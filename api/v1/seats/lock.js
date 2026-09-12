const { Client } = require('pg');
const crypto = require('crypto');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { show_id, seat_ids, client_session_id } = req.body || {};
  let { lock_token } = req.body || {};

  if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return res.status(400).json({ detail: 'show_id and seat_ids array are required.' });
  }

  if (seat_ids.length > 8) {
    return res.status(400).json({ detail: 'You can select up to 8 seats per booking.' });
  }

  if (!lock_token) {
    lock_token = 'lock_' + crypto.randomBytes(8).toString('hex');
  }

  const userId = client_session_id || ('sess_' + lock_token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Check permanently booked seats in Supabase
    const bookedCheck = await client.query(
      'SELECT seat_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2)',
      [show_id, seat_ids]
    );
    if (bookedCheck.rows.length > 0) {
      return res.status(409).json({ detail: 'Seat already booked' });
    }

    // 2. Check active temporary locks held by another session
    const lockCheck = await client.query(
      "SELECT seat_id, user_id, lock_token, status, is_booked, expires_at FROM seat_locks WHERE show_id = $1 AND seat_id = ANY($2) AND (expires_at > $3 OR status = 'BOOKED' OR is_booked = TRUE)",
      [show_id, seat_ids, now.toISOString()]
    );

    for (const r of lockCheck.rows) {
      if (r.is_booked || r.status === 'BOOKED') {
        return res.status(409).json({ detail: 'Seat already booked' });
      }
      if (r.lock_token !== lock_token && r.user_id !== userId) {
        return res.status(409).json({ detail: 'Seat already booked' });
      }
    }

    // 3. Atomically upsert locks in Supabase
    for (const seatId of seat_ids) {
      await client.query(
        `INSERT INTO seat_locks (show_id, seat_id, user_id, lock_token, status, is_booked, locked_at, expires_at)
         VALUES ($1, $2, $3, $4, 'LOCKED', FALSE, $5, $6)
         ON CONFLICT (show_id, seat_id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           lock_token = EXCLUDED.lock_token,
           status = 'LOCKED',
           is_booked = FALSE,
           locked_at = EXCLUDED.locked_at,
           expires_at = EXCLUDED.expires_at`,
        [show_id, seatId, userId, lock_token, now.toISOString(), expiresAt.toISOString()]
      );
    }

    return res.status(200).json({
      success: true,
      lock_token,
      show_id,
      seat_ids,
      locked_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      seconds_remaining: 300,
      message: 'Successfully locked ' + seat_ids.length + ' seats.'
    });
  } catch (err) {
    console.error('Lock seats error:', err);
    return res.status(500).json({ detail: 'Failed to lock seats in database.' });
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
