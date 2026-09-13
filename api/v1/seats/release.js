const { Client } = require('pg');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { show_id, lock_token, seat_ids } = req.body || {};
  if (!show_id && !lock_token) {
    return res.status(200).json({ message: 'Released' });
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    if (show_id && seat_ids && Array.isArray(seat_ids) && seat_ids.length > 0) {
      if (lock_token) {
        await client.query(
          "DELETE FROM seat_locks WHERE show_id = $1 AND (seat_id = ANY($2) OR lock_token = $3) AND status = 'LOCKED'",
          [show_id, seat_ids, lock_token]
        );
      } else {
        await client.query(
          "DELETE FROM seat_locks WHERE show_id = $1 AND seat_id = ANY($2) AND status = 'LOCKED'",
          [show_id, seat_ids]
        );
      }
    } else if (show_id && lock_token) {
      await client.query(
        "DELETE FROM seat_locks WHERE show_id = $1 AND lock_token = $2 AND status = 'LOCKED'",
        [show_id, lock_token]
      );
    } else if (lock_token) {
      await client.query(
        "DELETE FROM seat_locks WHERE lock_token = $1 AND status = 'LOCKED'",
        [lock_token]
      );
    if (lock_token) {
      try {
        await client.query(
          "UPDATE bookings SET booking_status = 'CANCELLED' WHERE lock_token = $1 AND booking_status = 'PENDING'",
          [lock_token]
        );
      } catch (e) {}
    }

    return res.status(200).json({ success: true, message: 'Seat locks successfully released.' });
  } catch (err) {
    console.error('Release error:', err);
    return res.status(200).json({ success: true, message: 'Released locally' });
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
