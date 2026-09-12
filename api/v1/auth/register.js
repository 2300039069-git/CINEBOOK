const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
const JWT_SECRET = process.env.JWT_SECRET || 'cinebook-production-super-secret-key-change-in-env-2026';

function createJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
  return header + '.' + body + '.' + signature;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { name, email, password, phone } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ detail: 'Name, email, and password are required' });
  }

  const emailLower = email.trim().toLowerCase();
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [emailLower]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ detail: 'An account with this email is already registered. Please sign in.' });
    }

    const userId = 'usr-' + crypto.randomBytes(4).toString('hex');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userRole = (req.body.role === 'THEATRE_ADMIN' || req.body.role === 'SUPER_ADMIN') ? req.body.role : 'CUSTOMER';

    await client.query(
      'INSERT INTO users (id, name, email, phone, password_hash, role, is_active, theatre_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [userId, name.trim(), emailLower, phone || null, passwordHash, userRole, true, []]
    );

    const user = {
      id: userId,
      name: name.trim(),
      email: emailLower,
      phone: phone || null,
      role: userRole,
      is_active: true,
      theatre_ids: []
    };

    const token = createJwt({
      sub: userId,
      role: 'CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      iat: Math.floor(Date.now() / 1000)
    });

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ detail: 'Database registration failed. Please try again.' });
  } finally {
    try { await client.end(); } catch (e) {}
  }
};
