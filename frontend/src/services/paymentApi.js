import api from './api';

export const CASHFREE_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox';

let cashfreeInstance = null;

export const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
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
  await loadCashfreeScript();
  if (window.Cashfree && !cashfreeInstance) {
    cashfreeInstance = window.Cashfree({
      mode: CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
    });
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
      console.warn('Backend Cashfree create-order failed, using fallback:', err.message);
      return {
        order_id: `CF_${bookingId || Date.now()}`,
        payment_session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        order_amount: Number(amount),
        order_currency: 'INR',
        environment: CASHFREE_ENV,
        booking_id: bookingId
      };
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




