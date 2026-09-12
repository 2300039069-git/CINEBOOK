const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'cinebook-production-super-secret-key-change-in-env-2026';

function verifyJwt(token) {
  try {
    const [headerB64, bodyB64, sigB64] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(headerB64 + '.' + bodyB64).digest('base64url');
    if (sigB64 !== expectedSig) return null;
    const body = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf-8'));
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }

  if (payload.sub === 'usr-admin-dhanush') {
    return res.status(200).json({
      id: 'usr-admin-dhanush',
      name: 'Dhanush Kancharla (Super Admin)',
      email: 'kancharladhanush2003@gmail.com',
      phone: '+91 98765 00001',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
      is_active: true,
      theatre_ids: []
    });
  }

  return res.status(200).json({
    id: payload.sub,
    role: payload.role,
    email: payload.email || '',
    is_active: true
  });
};
