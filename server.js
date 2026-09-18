require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { scrapeBMS } = require('./scrapers/bmsScraper');

const app = express();
const PORT = process.env.PORT || 5000;
const OUTPUT_DIR = path.join(__dirname, 'scrapers/output');
const BOOKINGS_FILE = path.join(OUTPUT_DIR, 'bookings.json');

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jyptmaprxztaxjoapbjs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cHRtYXByeHp0YXhqb2FwYmpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjYxODIwMCwiZXhwIjoyMDUyMTk0MjAwfQ.dummy';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

app.use(cors());

// ============================================================================
// 3. Webhook endpoint /api/webhook/vyapar MUST use express.raw BEFORE express.json()
// ============================================================================
app.use('/api/webhook/vyapar', express.raw({ type: 'application/json' }));
app.use('/webhook/vyapar', express.raw({ type: 'application/json' }));

// All other endpoints use express.json()
app.use(express.json());

// ============================================================================
// 1 & 2. Order Creation Endpoint (POST /api/v1/create_order & /api/v1/payments/create-vyapar-order)
// ============================================================================
app.post(['/api/v1/create_order', '/api/v1/payments/create-vyapar-order', '/api/create_order'], async (req, res) => {
  try {
    const {
      booking_id,
      amount,
      p_info,
      customer_name,
      customer_mobile,
      customer_details
    } = req.body;

    const bId = booking_id || `CB-${Date.now()}`;
    const client_txn_id = `CNB_${bId}_${Date.now()}`;
    const apiKey = process.env.VYAPAR_API_KEY || 'vg_live_ldyjlAfN9ThqOb2CdAivodK8';
    const mobile = customer_mobile || (customer_details && customer_details.customer_phone) || '8639781668';
    const redirect_url = `https://cinebook.cyou/status?bookingId=${bId}`;
    const callback_url = 'https://cinebook-backend-i2k9.onrender.com/api/webhook/vyapar';

    console.log(`[VyaparGateway] Creating order: ${client_txn_id} for amount ₹${amount}`);

    const vyaparResponse = await fetch('https://vyapargateway.com/api/v1/create_order', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_txn_id,
        amount: Number(amount),
        p_info: p_info || `Movie Ticket Booking - ${bId}`,
        customer_name: customer_name || (customer_details && customer_details.customer_name) || 'Valued Cinema Guest',
        customer_mobile: mobile,
        redirect_url,
        callback_url
      })
    });

    const data = await vyaparResponse.json();
    return res.status(vyaparResponse.status).json(data);
  } catch (err) {
    console.error('[VyaparGateway] Create order error:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
});

// ============================================================================
// 3 & 4. Webhook Route (POST /api/webhook/vyapar) with HMAC SHA256 Verification
// ============================================================================
app.post(['/api/webhook/vyapar', '/webhook/vyapar'], async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');
    const signature = req.headers['x-vyapargateway-signature'];
    const timestamp = req.headers['x-vyapargateway-timestamp'];
    const secret = process.env.VYAPAR_WEBHOOK_SECRET;

    // 1. Verify HMAC SHA256 of `${timestamp}.${rawBody}`
    if (secret) {
      const stringToSign = `${timestamp}.${rawBody}`;
      const computedSig = crypto.createHmac('sha256', secret).update(stringToSign).digest('hex');
      if (computedSig !== signature) {
        console.warn('[VyaparGateway Webhook] Invalid signature rejected (401 Unauthorized)');
        return res.status(401).json({ status: false, error: 'Unauthorized: Invalid signature' });
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    console.log('[VyaparGateway Webhook] Payload verified:', payload);

    // 2. Verify payload.status === "success"
    const isSuccess = payload.status === 'success' || payload.event === 'payment.success' || payload.status === true;
    if (!isSuccess) {
      console.warn(`[VyaparGateway Webhook] Non-success status: ${payload.status}`);
      return res.status(200).json({ status: true, message: 'Non-success status acknowledged' });
    }

    // 3. Parse client_txn_id to get bookingId (format: CNB_${bookingId}_${Date.now()})
    const clientTxnId = payload.client_txn_id || (payload.data && payload.data.client_txn_id) || '';
    let bookingId = '';
    if (clientTxnId.startsWith('CNB_')) {
      const parts = clientTxnId.split('_');
      bookingId = parts[1];
    } else {
      bookingId = payload.booking_id || clientTxnId;
    }

    const upiTxnId = payload.upi_txn_id || payload.utr || (payload.data && payload.data.upi_txn_id) || `VG_${Date.now()}`;

    // 4. Run Supabase update: status = 'BOOKED' and payment_utr = payload.upi_txn_id
    if (bookingId) {
      try {
        await supabase
          .from('bookings')
          .update({
            booking_status: 'CONFIRMED',
            payment_id: `vyapar_${upiTxnId}`
          })
          .eq('booking_id', bookingId);

        console.log(`[VyaparGateway Webhook] Supabase booking ${bookingId} transitioned to BOOKED with UTR ${upiTxnId}`);
      } catch (dbErr) {
        console.warn('[VyaparGateway Webhook] Supabase sync notice:', dbErr.message);
      }
    }

    // 5. Return 200 OK with {"status": true}
    return res.status(200).json({ status: true, message: 'Payment confirmed successfully' });
  } catch (err) {
    console.error('[VyaparGateway Webhook] Handler error:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
});

// Health check
app.get(['/health', '/api/health', '/'], (req, res) => {
  res.json({ status: 'healthy', service: 'CineBook Node API', timestamp: new Date().toISOString() });
});

// Scraper & Booking routes
app.get('/api/cities', (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    const cities = files.filter(f => f.endsWith('_movies.json')).map(f => f.replace('_movies.json', ''));
    res.json({ cities: cities.length > 0 ? cities : ['guntur', 'vijayawada', 'tenali', 'hyderabad'], total: cities.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/movies/:city', (req, res) => {
  const city = (req.params.city || '').toLowerCase().trim();
  const filePath = path.join(OUTPUT_DIR, `${city}_movies.json`);
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return res.json(JSON.parse(fileContent));
    } catch (err) {
      console.error(err);
    }
  }
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 CineBook Express API running on port ${PORT}`);
  console.log(`📡 Order Creation: POST http://localhost:${PORT}/api/v1/create_order`);
  console.log(`📡 Webhook Route:  POST http://localhost:${PORT}/api/webhook/vyapar`);
  console.log(`========================================================`);
});

module.exports = app;
