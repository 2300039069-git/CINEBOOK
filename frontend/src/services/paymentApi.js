import { load as loadCashfreeSDK } from '@cashfreepayments/cashfree-js';
import api from './api';

export const CASHFREE_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox';

let cashfreeInstance = null;

export const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Cashfree) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="cashfree.com"]');
    if (existing) {
      existing.onload = () => resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const getCashfreeInstance = async () => {
  if (cashfreeInstance) return cashfreeInstance;

  const mode = CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
  try {
    cashfreeInstance = await loadCashfreeSDK({ mode });
    if (cashfreeInstance) return cashfreeInstance;
  } catch (sdkErr) {
    console.warn('Cashfree NPM SDK load warning, falling back to window.Cashfree:', sdkErr);
  }

  await loadCashfreeScript();
  if (typeof window !== 'undefined' && window.Cashfree) {
    cashfreeInstance = window.Cashfree({ mode });
  }
  return cashfreeInstance;
};

export const paymentApi = {
  createOrder: async (bookingId, amount, customerDetails = {}) => {
    try {
      const response = await api.post('/payments/create-order', {
        booking_id: bookingId,
        amount: Number(amount),
        customer_details: customerDetails
      });
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to initialize Cashfree payment session.';
      console.error('Cashfree create-order error:', errMsg);
      const customErr = new Error(errMsg);
      customErr.response = err.response;
      customErr.status = err.response?.status;
      throw customErr;
    }
  },

  verifyPayment: async (paymentDetails) => {
    try {
      const response = await api.post('/payments/verify', paymentDetails);
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Payment verification failed.';
      const verifyErr = new Error(errMsg);
      verifyErr.status = err.response?.status || err.status || 400;
      verifyErr.response = err.response;
      throw verifyErr;
    }
  }
};




