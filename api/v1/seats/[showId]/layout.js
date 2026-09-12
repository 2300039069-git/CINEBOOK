const { Client } = require('pg');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract showId from query params or URL
  let showId = req.query?.showId;
  if (!showId) {
    const parts = (req.url || '').split('?')[0].split('/');
    const layoutIdx = parts.indexOf('layout');
    if (layoutIdx > 0) {
      showId = parts[layoutIdx - 1];
    }
  }
  if (!showId) {
    showId = 'sh-001';
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  const dbLocks = {};
  const now = new Date().toISOString();

  try {
    await client.connect();

    // 1. Permanently booked seats
    const bookedRes = await client.query(
      'SELECT seat_id FROM booked_seats WHERE show_id = $1',
      [showId]
    );
    for (const r of bookedRes.rows) {
      dbLocks[r.seat_id] = 'BOOKED';
    }

    // 2. Active locks
    const locksRes = await client.query(
      "SELECT seat_id, status, is_booked, expires_at FROM seat_locks WHERE show_id = $1 AND (expires_at > $2 OR status = 'BOOKED' OR is_booked = TRUE)",
      [showId, now]
    );
    for (const r of locksRes.rows) {
      if (r.is_booked || r.status === 'BOOKED') {
        dbLocks[r.seat_id] = 'BOOKED';
      } else {
        dbLocks[r.seat_id] = 'LOCKED';
      }
    }
  } catch (err) {
    console.warn('Database layout query warning:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }

  const tiersConfig = [
    { tier: 'RECLINER', label: 'Recliner (Plush Loungers)', price: 550.0, rows: ['A', 'B'] },
    { tier: 'PREMIUM', label: 'Premium (Executive Seating)', price: 380.0, rows: ['C', 'D', 'E', 'F'] },
    { tier: 'CLASSIC', label: 'Classic (Standard Cinema)', price: 250.0, rows: ['G', 'H', 'J', 'K'] }
  ];

  let totalSeats = 0;
  let availableCount = 0;
  let lockedCount = 0;
  let bookedCount = 0;

  const layoutTiers = [];
  const seatsPerRow = 14;

  for (const tc of tiersConfig) {
    const tierRows = [];
    for (const rLetter of tc.rows) {
      const seatsInRow = [];
      for (let num = 1; num <= seatsPerRow; num++) {
        const seatId = rLetter + num;
        totalSeats++;

        let seatStatus = 'AVAILABLE';
        if (dbLocks[seatId] === 'BOOKED') {
          seatStatus = 'BOOKED';
          bookedCount++;
        } else if (dbLocks[seatId] === 'LOCKED') {
          seatStatus = 'LOCKED';
          lockedCount++;
        } else {
          availableCount++;
        }

        seatsInRow.push({
          id: seatId,
          number: num,
          row: rLetter,
          rowLetter: rLetter,
          tier: tc.tier,
          price: tc.price,
          status: seatStatus,
          is_aisle_after: (num === 3 || num === 11),
          isAisleAfter: (num === 3 || num === 11)
        });
      }
      tierRows.push({ row_letter: rLetter, rowLetter: rLetter, seats: seatsInRow });
    }

    layoutTiers.push({
      name: tc.tier,
      tier: tc.tier,
      label: tc.label,
      price: tc.price,
      rows: tierRows
    });
  }

  return res.status(200).json({
    show_id: showId,
    tiers: layoutTiers,
    total_seats: totalSeats,
    available_seats: availableCount,
    locked_seats: lockedCount,
    booked_seats: bookedCount
  });
};
