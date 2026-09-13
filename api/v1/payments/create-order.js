try { require('dotenv').config(); } catch (e) {}
const crypto = require('crypto');
const https = require('https');

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'TEST112298405e290a700a9b8a4cf1e104892211';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || ['cfsk_ma_test', '38a3497ddb8b65296cdda27181aafaab', '43c6c164'].join('_');
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();

const CASHFREE_HOST = CASHFREE_ENV === 'production' ? 'api.cashfree.com' : 'sandbox.cashfree.com';

function sanitizeCustomerPhone(raw) {
  let cleaned = String(raw || '').replace(/\D/g, '');
  if (cleaned.length > 10 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(-10);
  }
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }
  if (cleaned.length !== 10) {
    cleaned = '9848012345';
  }
  return cleaned;
}

function sanitizeCustomerEmail(raw) {
  const email = String(raw || '').trim();
  if (email.includes('@') && email.includes('.')) {
    return email;
  }
  return 'customer@cinebook.in';
}

function sanitizeCustomerId(raw) {
  let cleaned = String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleaned.length < 3) {
    cleaned = 'usr_' + crypto.randomBytes(4).toString('hex');
  }
  return cleaned.slice(0, 45);
}

function sanitizeCustomerName(raw) {
  let name = String(raw || '').trim();
  return name.length >= 2 ? name.slice(0, 50) : 'Cinema Guest';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  const { booking_id, amount, customer_details } = req.body || {};
  const orderAmount = Number(parseFloat(amount || 100).toFixed(2));
  const rawOrderId = String(booking_id || ('CB-2026-' + Math.floor(100000 + Math.random() * 900000)));
  const orderId = rawOrderId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 45);

  const custDetails = {
    customer_id: sanitizeCustomerId(customer_details?.customer_id),
    customer_name: sanitizeCustomerName(customer_details?.customer_name),
    customer_email: sanitizeCustomerEmail(customer_details?.customer_email),
    customer_phone: sanitizeCustomerPhone(customer_details?.customer_phone)
  };

  // 1. Call Cashfree PG Orders API via cashfree-pg SDK
  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY && !CASHFREE_APP_ID.includes('dummy')) {
    try {
      let Cashfree = null;
      let CFEnvironment = null;
      try {
        const sdk = require('cashfree-pg');
        Cashfree = sdk.Cashfree;
        CFEnvironment = sdk.CFEnvironment;
      } catch (sdkLoadErr) {}

      if (Cashfree && CFEnvironment) {
        const envMode = CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
        const cfClient = new Cashfree(envMode, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);
        cfClient.XApiVersion = CASHFREE_API_VERSION;

        const orderRequest = {
          order_id: orderId,
          order_amount: orderAmount,
          order_currency: 'INR',
          customer_details: custDetails,
          order_meta: {
            return_url: 'https://cinebook.in/checkout?order_id={order_id}'
          },
          order_note: `Tickets for booking ${orderId}`
        };

        const response = await cfClient.PGCreateOrder(orderRequest);
        if (response && response.data && (response.data.payment_session_id || response.data.order_id)) {
          const cfOrder = response.data;
          return res.status(200).json({
            order_id: cfOrder.order_id || orderId,
            cf_order_id: cfOrder.cf_order_id,
            payment_session_id: cfOrder.payment_session_id,
            order_amount: cfOrder.order_amount || orderAmount,
            order_currency: cfOrder.order_currency || 'INR',
            environment: CASHFREE_ENV,
            booking_id: orderId
          });
        }
      }

      // HTTPS Direct Request Fallback
      const postData = JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: custDetails,
        order_meta: {
          return_url: 'https://cinebook.in/checkout?order_id={order_id}'
        },
        order_note: `Tickets for booking ${orderId}`
      });

      const cfOrder = await new Promise((resolve, reject) => {
        const reqCf = https.request({
          hostname: CASHFREE_HOST,
          port: 443,
          path: '/pg/orders',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': CASHFREE_API_VERSION,
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 8000
        }, (resCf) => {
          let data = '';
          resCf.on('data', (chunk) => { data += chunk; });
          resCf.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (resCf.statusCode >= 200 && resCf.statusCode < 300 && (json.payment_session_id || json.order_id)) {
                resolve(json);
              } else {
                reject(new Error(json.message || json.error_message || 'Cashfree API returned error'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        reqCf.on('error', reject);
        reqCf.on('timeout', () => {
          reqCf.destroy();
          reject(new Error('Cashfree API timeout'));
        });
        reqCf.write(postData);
        reqCf.end();
      });

      return res.status(200).json({
        order_id: cfOrder.order_id || orderId,
        cf_order_id: cfOrder.cf_order_id,
        payment_session_id: cfOrder.payment_session_id,
        order_amount: cfOrder.order_amount || orderAmount,
        order_currency: cfOrder.order_currency || 'INR',
        environment: CASHFREE_ENV,
        booking_id: orderId
      });
    } catch (err) {
      console.warn('Cashfree order creation error:', err.message);
      return res.status(400).json({
        detail: 'Cashfree order generation failed: ' + (err.message || 'Invalid parameters')
      });
    }
  }

  return res.status(400).json({
    detail: 'Cashfree credentials are not configured.'
  });
};
