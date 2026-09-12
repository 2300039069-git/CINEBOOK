const { Client } = require('pg');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { show_id, lock_token } = req.body || {};
  if (!show_id || !lock_token) {
    return res.status(200).json({ message: 'Released' });
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(
      "DELETE FROM seat_locks WHERE show_id = $1 AND lock_token = $2 AND status = 'LOCKED'",
      [show_id, lock_token]
    );
    return res.status(200).json({ message: 'Seat locks successfully released.' });
  } catch (err) {
    return res.status(200).json({ message: 'Released locally' });
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
