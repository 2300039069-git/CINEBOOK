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
// 1. Webhook endpoint /api/webhook/vyapar MUST use express.raw BEFORE express.json()
// ============================================================================
app.post(['/api/webhook/vyapar', '/webhook/vyapar'], express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const timestamp = req.headers['x-vyapargateway-timestamp'];
    const signature = req.headers['x-vyapargateway-signature'];
    const rawBody = req.body.toString('utf8');

    const expectedSig = crypto
      .createHmac('sha256', process.env.VYAPAR_WEBHOOK_SECRET || '')
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    if (process.env.VYAPAR_WEBHOOK_SECRET && signature !== expectedSig) {
      console.warn('[VyaparGateway Webhook] Invalid signature rejected (401 Unauthorized)');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const data = JSON.parse(rawBody || '{}');
    console.log('[VyaparGateway Webhook] Verified payload:', data);

    if (data.status === 'success' || data.event === 'payment.success' || data.status === true) {
      const clientTxnId = data.client_txn_id || (data.data && data.data.client_txn_id) || '';
      let bookingId = '';
      if (clientTxnId.startsWith('CNB_')) {
        bookingId = clientTxnId.split('_')[1];
      } else {
        bookingId = data.booking_id || clientTxnId;
      }

      const upiTxnId = data.upi_txn_id || data.utr || (data.data && data.data.upi_txn_id) || `VG_${Date.now()}`;

      if (bookingId) {
        try {
          const { data: bData } = await supabase
            .from('bookings')
            .update({
              status: 'BOOKED',
              booking_status: 'CONFIRMED',
              payment_utr: upiTxnId,
              payment_id: `vyapar_${upiTxnId}`,
              confirmed_at: new Date().toISOString()
            })
            .eq('booking_id', bookingId)
            .select();

          const bookingRecord = bData && bData[0];
          if (bookingRecord) {
            const showId = bookingRecord.show_id;
            let seatsList = bookingRecord.seats || [];
            if (typeof seatsList === 'string') {
              try { seatsList = JSON.parse(seatsList); } catch (e) {}
            }
            if (Array.isArray(seatsList)) {
              for (const s of seatsList) {
                const sId = typeof s === 'string' ? s : (s.id || s.seat_id);
                if (sId) {
                  const seatRowId = `${showId}:${sId}`;
                  await supabase.from('seats').upsert({
                    id: seatRowId,
                    show_id: showId,
                    seat_id: sId,
                    status: 'BOOKED',
                    updated_at: new Date().toISOString()
                  });
                }
              }
            }
          }

          console.log(`[VyaparGateway Webhook] Supabase booking ${bookingId} transitioned to BOOKED with UTR ${upiTxnId}`);
        } catch (dbErr) {
          console.warn('[VyaparGateway Webhook] Supabase sync notice:', dbErr.message);
        }
      }
    }
    return res.status(200).json({ status: true });
  } catch (err) {
    console.error('[VyaparGateway Webhook] Error:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
});

// All other endpoints use express.json()
app.use(express.json());

// ============================================================================
// 2. Order Creation Endpoint (POST /api/v1/create_order)
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
// 3. Fallback Active Status Polling (GET /api/check-status/:orderId)
// ============================================================================
app.get(['/api/check-status/:orderId', '/check-status/:orderId', '/api/v1/payments/check-status/:orderId', '/api/v1/payments/upi-status/:orderId'], async (req, res) => {
  try {
    const { orderId } = req.params;
    const apiKey = process.env.VYAPAR_API_KEY || 'vg_live_ldyjlAfN9ThqOb2CdAivodK8';

    const checkRes = await fetch('https://vyapargateway.com/api/v1/check_order_status', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ order_id: orderId, client_txn_id: orderId })
    });

    const checkData = await checkRes.json();
    const orderInfo = checkData.data || {};
    const st = (orderInfo.status || '').toLowerCase();
    const isPaid = st === 'success' || st === 'paid' || st === 'completed' || st === 'successful';
    const utr = orderInfo.upi_txn_id || orderInfo.utr || orderInfo.txn_id;

    if (isPaid) {
      const clientTxnId = orderInfo.client_txn_id || orderId;
      const bId = clientTxnId.startsWith('CNB_') ? clientTxnId.split('_')[1] : (orderInfo.booking_id || clientTxnId);
      if (bId) {
        try {
          const { data: bData } = await supabase
            .from('bookings')
            .update({
              status: 'BOOKED',
              booking_status: 'CONFIRMED',
              payment_utr: utr,
              payment_id: `vyapar_${utr}`,
              confirmed_at: new Date().toISOString()
            })
            .eq('booking_id', bId)
            .select();

          const bookingRecord = bData && bData[0];
          if (bookingRecord) {
            const showId = bookingRecord.show_id;
            let seatsList = bookingRecord.seats || [];
            if (typeof seatsList === 'string') {
              try { seatsList = JSON.parse(seatsList); } catch (e) {}
            }
            if (Array.isArray(seatsList)) {
              for (const s of seatsList) {
                const sId = typeof s === 'string' ? s : (s.id || s.seat_id);
                if (sId) {
                  const seatRowId = `${showId}:${sId}`;
                  await supabase.from('seats').upsert({
                    id: seatRowId,
                    show_id: showId,
                    seat_id: sId,
                    status: 'BOOKED',
                    updated_at: new Date().toISOString()
                  });
                }
              }
            }
          }

          console.log(`[Active Check] Supabase updated to BOOKED for ${bId} with UTR ${utr}`);
        } catch (e) {
          console.warn('[Active Check] Supabase update warning:', e.message);
        }
      }
    }

    return res.json({
      order_id: orderId,
      status: isPaid ? 'PAID' : 'PENDING',
      paid: isPaid,
      is_paid: isPaid,
      utr_number: utr,
      amount: orderInfo.amount || 1.0,
      raw_data: orderInfo
    });
  } catch (err) {
    console.error('[Check Status] Error:', err);
    return res.status(500).json({ error: err.message, status: 'PENDING', paid: false });
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
  console.log(`📡 Active Check:   GET  http://localhost:${PORT}/api/check-status/:orderId`);
  console.log(`========================================================`);
});

module.exports = app;
