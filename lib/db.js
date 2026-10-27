const { Pool } = require('pg');

let pool;
function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const caBundle = (process.env.DATABASE_SSL_CA || '').trim();
  if (!caBundle) throw new Error('DATABASE_SSL_CA is not configured. Add the Supabase database CA certificate.');
  if (!caBundle.includes('-----BEGIN CERTIFICATE-----')) throw new Error('DATABASE_SSL_CA must contain a PEM certificate.');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 6_000,
      statement_timeout: 8_000,
      ssl: { ca: caBundle, rejectUnauthorized: true }
    });
    pool.on('error', (error) => console.error('[db] idle connection error:', error.message));
  }
  return pool;
}

function json(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(data));
}

function error(res, err) {
  console.error('[api]', err && err.message ? err.message : err);
  json(res, 500, { error: 'The request could not be completed.' });
}

function getCookie(req, key) {
  for (const bit of (req.headers.cookie || '').split(';')) {
    const [name, ...rest] = bit.trim().split('=');
    if (name === key) return rest.join('=');
  }
  return '';
}
function cookie(value, age = 8 * 60 * 60) {
  const secure = process.env.NODE_ENV === 'development' ? '' : '; Secure';
  return `__Host-bp_admin=${value || ''}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${age}`;
}
function requestIsSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  if (!origin || !host) return false;
  try { return new URL(origin).origin === `${protocol}://${host}`; } catch { return false; }
}
function decodeTotpSecret(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    const n = alphabet.indexOf(char);
    if (n < 0) continue;
    bits += n.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function validTotp(secret, code, now = Date.now()) {
  if (!secret || !/^\d{6}$/.test(String(code || ''))) return false;
  const key = decodeTotpSecret(secret);
  if (!key.length) return false;
  const crypto = require('node:crypto');
  for (const offset of [-30_000, 0, 30_000]) {
    const counter = Math.floor((now + offset) / 30_000);
    const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(counter));
    const digest = crypto.createHmac('sha1', key).update(msg).digest();
    const at = digest[digest.length - 1] & 15;
    const value = ((digest[at] & 127) << 24 | (digest[at + 1] & 255) << 16 | (digest[at + 2] & 255) << 8 | (digest[at + 3] & 255)) % 1_000_000;
    const expected = Buffer.from(String(value).padStart(6, '0'));
    const actual = Buffer.from(String(code));
    if (crypto.timingSafeEqual(expected, actual)) return true;
  }
  return false;
}
function hashSecret(value, key) {
  return require('node:crypto').createHmac('sha256', key).update(value).digest('hex');
}

module.exports = { db, json, error, getCookie, cookie, requestIsSameOrigin, validTotp, hashSecret };
