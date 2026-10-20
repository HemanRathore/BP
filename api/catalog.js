const { db, json, error } = require('../lib/db');
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
  try {
    const { rows } = await db().query('select products, locations, updated_at from site_content where id = 1');
    if (!rows.length) return json(res, 404, { error: 'Catalogue is not initialized.' });
    json(res, 200, { products: rows[0].products, locations: rows[0].locations, updatedAt: rows[0].updated_at }, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' });
  } catch (err) { error(res, err); }
};
