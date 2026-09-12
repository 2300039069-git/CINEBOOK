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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const emailLower = email.trim().toLowerCase();

  // 1. Super Admin instant verification
  if (emailLower === 'kancharladhanush2003@gmail.com' && password === 'AdminPass@2026') {
    const user = {
      id: 'usr-admin-dhanush',
      name: 'Dhanush Kancharla (Super Admin)',
      email: 'kancharladhanush2003@gmail.com',
      phone: '+91 98765 00001',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
      is_active: true,
      theatre_ids: []
    };

    const token = createJwt({
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      iat: Math.floor(Date.now() / 1000)
    });

    return res.status(200).json({
      access_token: token,
      token_type: 'bearer',
      user
    });
  }

  // 2. Query Supabase PostgreSQL
  let client;
  try {
    client = new Client({
      connectionString: DB_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    const result = await client.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailLower]);
    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'Incorrect email or password.' });
    }

    const dbUser = result.rows[0];
    const isMatch = bcrypt.compareSync(password, dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Incorrect email or password.' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role || 'CUSTOMER',
      avatar: dbUser.avatar,
      is_active: dbUser.is_active !== false,
      theatre_ids: dbUser.theatre_ids || []
    };

    const token = createJwt({
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      iat: Math.floor(Date.now() / 1000)
    });

    return res.status(200).json({
      access_token: token,
      token_type: 'bearer',
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(401).json({ detail: 'Incorrect email or password.' });
  } finally {
    if (client) {
      try { await client.end(); } catch (e) {}
    }
  }
};
