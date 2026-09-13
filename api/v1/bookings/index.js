const { Client } = require('pg');
const crypto = require('crypto');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
const JWT_SECRET = process.env.JWT_SECRET || 'cinebook-production-super-secret-key-change-in-env-2026';

function verifyJwt(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const [headerB64, bodyB64, sigB64] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(headerB64 + '.' + bodyB64).digest('base64url');
    if (sigB64 !== expectedSig) return null;
    return JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf-8'));
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  if (req.method === 'GET') {
    try {
      await client.connect();
      const rows = await client.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ total: rows.rows.length, bookings: rows.rows });
    } catch (err) {
      return res.status(200).json({ total: 0, bookings: [] });
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const user = verifyJwt(req.headers?.authorization);
    const userId = user?.sub || payload.user_id || 'usr_guest';
    const showId = payload.show_id || 'sh-001';
    const seats = payload.seats || [];
    const lockToken = payload.lock_token || '';
    const paymentId = payload.payment_id || payload.razorpay_payment_id || null;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ detail: 'No seats selected.' });
    }

    const seatIds = seats.map(s => typeof s === 'string' ? s : s.id);
    const bookingId = payload.booking_id || ('CB-2026-' + Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (8 * 60 * 1000)); // 8 minutes lock

    try {
      await client.connect();

      // 0. Purge expired temporary locks
      await client.query(
        "DELETE FROM seat_locks WHERE expires_at <= $1 AND status = 'LOCKED'",
        [now.toISOString()]
      );

      // 1. Check if any seat is already permanently booked
      const bookedCheck = await client.query(
        'SELECT seat_id FROM booked_seats WHERE show_id = $1 AND seat_id = ANY($2)',
        [showId, seatIds]
      );
      if (bookedCheck.rows.length > 0) {
        return res.status(409).json({
          detail: 'Seat ' + bookedCheck.rows[0].seat_id + ' is already booked by another customer.'
        });
      }

      // 2. Check active unexpired locks held by another user/session
      const lockCheck = await client.query(
        "SELECT seat_id, user_id, lock_token, status, expires_at FROM seat_locks WHERE show_id = $1 AND seat_id = ANY($2) AND expires_at > $3 AND status = 'LOCKED'",
        [showId, seatIds, now.toISOString()]
      );
      for (const r of lockCheck.rows) {
        const isMine = (lockToken && r.lock_token === lockToken) || (userId && r.user_id === userId);
        if (!isMine) {
          return res.status(409).json({
            detail: 'Seat ' + r.seat_id + ' is currently held by another customer.'
          });
        }
      }

      // 3. Ensure temporary hold in seat_locks (status 'LOCKED', not booked)
      for (const sId of seatIds) {
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
          [showId, sId, userId, lockToken || ('lock_' + userId), now.toISOString(), expiresAt.toISOString()]
        );
      }

      // 4. Save booking record with initial PENDING status (do NOT permanently book seats yet)
      const totalAmount = Number(payload.total_amount) || 0;
      const baseAmount = Number(payload.base_amount) || 0;
      const convenienceFee = Number(payload.convenience_fee) || 0;
      const taxes = Number(payload.taxes) || 0;
      const initialStatus = 'PENDING';

      await client.query(
        `INSERT INTO bookings (
          booking_id, user_id, show_id, movie_id, theatre_id, show_date, show_time,
          lock_token, seats, base_amount, convenience_fee, taxes, total_amount,
          customer_name, customer_email, customer_phone, booking_status, payment_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (booking_id) DO UPDATE SET
          booking_status = CASE WHEN bookings.booking_status = 'CONFIRMED' THEN 'CONFIRMED' ELSE 'PENDING' END,
          payment_id = EXCLUDED.payment_id`,
        [
          bookingId, userId, showId,
          payload.movie_id || 'mv-001',
          payload.theatre_id || 'th-001',
          payload.show_date || now.toISOString().split('T')[0],
          payload.show_time || '11:00 AM',
          lockToken,
          JSON.stringify(seats),
          baseAmount, convenienceFee, taxes, totalAmount,
          payload.customer_name || user?.name || 'Valued Customer',
          payload.customer_email || user?.email || 'customer@cinebook.in',
          payload.customer_phone || payload.phone || '+91 98480 12345',
          initialStatus,
          null,
          now.toISOString()
        ]
      );

      const bookingRecord = {
        booking_id: bookingId,
        user_id: userId,
        show_id: showId,
        movie_id: payload.movie_id || 'mv-001',
        theatre_id: payload.theatre_id || 'th-001',
        show_date: payload.show_date || now.toISOString().split('T')[0],
        show_time: payload.show_time || '11:00 AM',
        seats,
        base_amount: baseAmount,
        convenience_fee: convenienceFee,
        taxes: taxes,
        total_amount: totalAmount,
        booking_status: initialStatus,
        payment_id: paymentId,
        customer_email: payload.customer_email || user?.email || 'customer@cinebook.in',
        created_at: now.toISOString()
      };

      return res.status(201).json({
        success: true,
        booking_id: bookingId,
        booking: bookingRecord
      });
    } catch (err) {
      console.error('Create booking error:', err);
      return res.status(500).json({ detail: 'Failed to initialize booking session: ' + err.message });
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  return res.status(405).json({ detail: 'Method not allowed' });
};
