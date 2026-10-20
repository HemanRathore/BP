const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { db, json, error, getCookie, cookie, requestIsSameOrigin, validTotp, hashSecret } = require('../lib/db');

const SESSION_SECONDS = 8 * 60 * 60;
function body(req) { return req.body && typeof req.body === 'object' ? req.body : {}; }
function validProducts(list) {
  if (!Array.isArray(list) || list.length < 1 || list.length > 300) return false;
  const ids = new Set();
  return list.every((p) => {
    if (!p || typeof p !== 'object' || !/^[a-z0-9][a-z0-9-]{1,79}$/.test(p.id || '') || ids.has(p.id)) return false;
    ids.add(p.id);
    return typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 140 &&
      typeof p.cat === 'string' && p.cat.length <= 50 && typeof p.short === 'string' && p.short.length <= 300 &&
      typeof p.desc === 'string' && p.desc.length <= 3000 && typeof p.image === 'string' && p.image.length <= 240 &&
      (!p.image || (p.image.startsWith('assets/img/') && !p.image.includes('\\') && !p.image.split('/').includes('..') && !/^\s*javascript:/i.test(p.image))) &&
      (p.badges == null || (Array.isArray(p.badges) && p.badges.length <= 8 && p.badges.every((x) => typeof x === 'string' && x.length <= 40))) && p.specs && typeof p.specs === 'object' &&
      !Array.isArray(p.specs) && (p.price === null || (p.price && Number.isFinite(Number(p.price.from)) && Number.isFinite(Number(p.price.to)) && Number(p.price.from) >= 0 && Number(p.price.to) >= Number(p.price.from)));
  });
}
function validLocations(list) {
  return Array.isArray(list) && list.length >= 1 && list.length <= 20 && list.every((x) => {
    if (!x || typeof x !== 'object' || typeof x.name !== 'string' || !x.name.trim() || x.name.length > 120 ||
        typeof x.address !== 'string' || !x.address.trim() || x.address.length > 500 ||
        typeof x.map !== 'string' || x.map.length > 1000) return false;
    try {
      const u = new URL(x.map);
      if (u.protocol !== 'https:') return false;
      if (['google.com', 'www.google.com', 'maps.google.com', 'goo.gl'].includes(u.hostname)) return u.pathname.startsWith('/maps');
      return u.hostname === 'maps.app.goo.gl' && u.pathname.length > 1;
    } catch { return false; }
  });
}
async function identifyAdmin(req, res) {
  const token = getCookie(req, '__Host-bp_admin');
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await db().query(`select email from admin_sessions where token_hash = $1 and expires_at > now() limit 1`, [crypto.createHash('sha256').update(token).digest('hex')]);
  if (!rows.length) {
    res.setHeader('Set-Cookie', cookie('', 0));
    return null;
  }
  return rows[0].email;
}
async function loginLimit(email, req) {
  const ipKey = process.env.IP_HASH_SECRET;
  if (!ipKey || ipKey.length < 32) throw new Error('IP_HASH_SECRET is not configured.');
  const ip = (req.headers['x-forwarded-for'] || 'unknown').toString().split(',')[0].trim();
  const ipHash = hashSecret(`ip:${ip}`, ipKey);
  const emailHash = hashSecret(`email:${email}`, ipKey);
  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const buckets = [ipHash, emailHash];
    for (const bucket of buckets) {
      const { rows } = await client.query(`insert into admin_login_limits (bucket_hash, failures, window_start, locked_until)
        values ($1, 1, now(), null)
        on conflict (bucket_hash) do update set
          failures = case when admin_login_limits.window_start < now() - interval '15 minutes' then 1 else admin_login_limits.failures + 1 end,
          window_start = case when admin_login_limits.window_start < now() - interval '15 minutes' then now() else admin_login_limits.window_start end,
          locked_until = case when admin_login_limits.window_start >= now() - interval '15 minutes' and admin_login_limits.failures >= 4 then now() + interval '1 hour' else admin_login_limits.locked_until end
        returning failures, locked_until`, [bucket]);
      if (rows[0].locked_until && new Date(rows[0].locked_until) > new Date()) {
        await client.query('commit');
        return { blocked: true, buckets };
      }
    }
    await client.query('commit');
    return { blocked: false, buckets };
  } catch (e) { await client.query('rollback'); throw e; }
  finally { client.release(); }
}

module.exports = async function handler(req, res) {
  const action = req.query?.action || '';
  try {
    if (action === 'login' && req.method === 'POST') {
      if (!requestIsSameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
      const input = body(req);
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      const password = typeof input.password === 'string' ? input.password : '';
      const otp = typeof input.otp === 'string' ? input.otp.trim() : '';
      const limit = await loginLimit(email.slice(0, 254), req);
      const configuredEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';
      const totpSecret = process.env.ADMIN_TOTP_SECRET || '';
      if (limit.blocked) return json(res, 429, { error: 'Too many sign-in attempts. Try again later.' }, { 'Retry-After': '3600' });
      let passOK = false;
      if (email.length <= 254 && password.length <= 256 && configuredEmail && passwordHash.startsWith('$2') && totpSecret) {
        passOK = email === configuredEmail && await bcrypt.compare(password, passwordHash);
      }
      const mfaOK = validTotp(totpSecret, otp);
      if (!passOK || !mfaOK) return json(res, 401, { error: 'Sign-in failed. Check your details and authenticator code.' });
      const pool = db();
      await pool.query('delete from admin_login_limits where bucket_hash = any($1::text[])', [limit.buckets]);
      await pool.query('delete from admin_sessions where expires_at < now()');
      const raw = crypto.randomBytes(32).toString('hex');
      const digest = crypto.createHash('sha256').update(raw).digest('hex');
      await pool.query('insert into admin_sessions (token_hash, email, expires_at) values ($1, $2, now() + interval \'8 hours\')', [digest, configuredEmail]);
      return json(res, 200, { email: configuredEmail }, { 'Set-Cookie': cookie(raw, SESSION_SECONDS) });
    }
    if (action === 'logout' && req.method === 'POST') {
      if (!requestIsSameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
      const token = getCookie(req, '__Host-bp_admin');
      if (/^[a-f0-9]{64}$/.test(token)) await db().query('delete from admin_sessions where token_hash = $1', [crypto.createHash('sha256').update(token).digest('hex')]);
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
    }
    const email = await identifyAdmin(req, res);
    if (!email) return json(res, 401, { error: 'Sign in required.' });
    if (action === 'session' && req.method === 'GET') return json(res, 200, { email });
    if (action === 'content' && req.method === 'GET') {
      const { rows } = await db().query('select products, locations, updated_at from site_content where id = 1');
      if (!rows.length) return json(res, 503, { error: 'Run the database schema before using the admin.' });
      return json(res, 200, { products: rows[0].products, locations: rows[0].locations, updatedAt: rows[0].updated_at });
    }
    if (!requestIsSameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
    if (action === 'products' && req.method === 'PUT') {
      if (Buffer.byteLength(JSON.stringify(body(req))) > 1_000_000) return json(res, 413, { error: 'Product payload is too large.' });
      const products = body(req).products;
      if (!validProducts(products)) return json(res, 400, { error: 'Product data is invalid or too large.' });
      const { rows } = await db().query('update site_content set products = $1::jsonb, updated_at = now() where id = 1 returning products, updated_at', [JSON.stringify(products)]);
      if (!rows.length) return json(res, 503, { error: 'Run the database schema before saving.' });
      return json(res, 200, { products: rows[0].products, updatedAt: rows[0].updated_at });
    }
    if (action === 'locations' && req.method === 'PUT') {
      if (Buffer.byteLength(JSON.stringify(body(req))) > 100_000) return json(res, 413, { error: 'Location payload is too large.' });
      const locations = body(req).locations;
      if (!validLocations(locations)) return json(res, 400, { error: 'Location name, address or Google Maps URL is invalid.' });
      const { rows } = await db().query('update site_content set locations = $1::jsonb, updated_at = now() where id = 1 returning locations, updated_at', [JSON.stringify(locations)]);
      if (!rows.length) return json(res, 503, { error: 'Run the database schema before saving.' });
      return json(res, 200, { locations: rows[0].locations, updatedAt: rows[0].updated_at });
    }
    if (action === 'analytics' && req.method === 'GET') {
      const { rows } = await db().query(`select path, date_trunc('day', created_at)::date as day, count(*)::int as views
        from site_events where created_at >= now() - interval '30 days' group by path, day order by day`);
      if (Math.random() < 0.01) await db().query("delete from site_events where created_at < now() - interval '90 days'");
      const totals = new Map(); const paths = new Map();
      for (const row of rows) {
        const day = String(row.day).slice(0, 10);
        totals.set(day, (totals.get(day) || 0) + row.views);
        paths.set(row.path, (paths.get(row.path) || 0) + row.views);
      }
      const series = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() - (29 - i));
        const day = date.toISOString().slice(0, 10); return { day, views: totals.get(day) || 0 };
      });
      return json(res, 200, {
        total: series.reduce((sum, d) => sum + d.views, 0),
        today: series[29].views,
        pages: Array.from(paths, ([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8), series
      });
    }
    return json(res, 404, { error: 'Not found.' });
  } catch (err) { error(res, err); }
};
