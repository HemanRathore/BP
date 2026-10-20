const { db, json, error, requestIsSameOrigin, hashSecret } = require('../lib/db');
const crypto = require('node:crypto');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  if (!requestIsSameOrigin(req)) return json(res, 403, { error: 'Request origin not allowed.' });
  const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 180) : '';
  if (!/^\/(?!\/)[a-zA-Z0-9/_\-.]*$/.test(path) || path.startsWith('/admin')) return json(res, 400, { error: 'Invalid page path.' });
  try {
    const key = process.env.IP_HASH_SECRET;
    if (!key || key.length < 32) throw new Error('IP_HASH_SECRET is not configured.');
    const ip = (req.headers['x-forwarded-for'] || 'unknown').toString().split(',')[0].trim();
    const bucket = hashSecret(ip, key);
    const pool = db();
    const { rows } = await pool.query(`insert into site_event_rate (ip_hash, minute_start, hits)
      values ($1, date_trunc('minute', now()), 1)
      on conflict (ip_hash, minute_start) do update set hits = site_event_rate.hits + 1
      returning hits`, [bucket]);
    if (rows[0].hits > 30) return json(res, 429, { error: 'Rate limit reached.' }, { 'Retry-After': '60' });
    await pool.query('insert into site_events (event, path) values ($1, $2)', ['page_view', path]);
    if (Math.random() < 0.01) await pool.query("delete from site_event_rate where minute_start < date_trunc('minute', now()) - interval '10 minutes'");
    json(res, 202, { ok: true });
  } catch (err) { error(res, err); }
};
