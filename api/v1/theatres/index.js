const { Client } = require('pg');
const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const city = req.query?.city;
    let query = 'SELECT * FROM theatres';
    const params = [];
    if (city && city !== 'All') {
      query += ' WHERE LOWER(city) = ';
      params.push(city.toLowerCase());
    }
    const result = await client.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(200).json([]);
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
