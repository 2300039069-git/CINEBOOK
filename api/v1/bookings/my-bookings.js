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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyJwt(req.headers.authorization);
  if (!user) {
    return res.status(200).json([]);
  }

  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const rows = await client.query(
      'SELECT * FROM bookings WHERE user_id =  OR customer_email =  ORDER BY created_at DESC',
      [user.sub, user.email || '']
    );
    return res.status(200).json(rows.rows);
  } catch (err) {
    return res.status(200).json([]);
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
