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

export const createCashfreeOrder = async (bookingId, amount, customerDetails = {}) => {
  return paymentApi.createOrder(bookingId, amount, customerDetails);
};

export const verifyCashfreePayment = async (paymentDetails) => {
  return paymentApi.verifyPayment(paymentDetails);
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

  createCashfreeOrder: async (bookingId, amount, customerDetails = {}) => {
    return paymentApi.createOrder(bookingId, amount, customerDetails);
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
  },

  verifyCashfreePayment: async (paymentDetails) => {
    return paymentApi.verifyPayment(paymentDetails);
  },

  // --- Savings Account UPI QR API Methods ---

  createUpiQrOrder: async (bookingId, amount, movieTitle = 'Movie Ticket', customerDetails = {}) => {
    try {
      const response = await api.post('/payments/create-upi-qr', {
        booking_id: bookingId,
        amount: Number(amount),
        movie_title: movieTitle,
        customer_details: customerDetails
      });
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to generate UPI QR code.';
      console.error('UPI QR creation error:', errMsg);
      const customErr = new Error(errMsg);
      customErr.response = err.response;
      throw customErr;
    }
  },

  getUpiPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/payments/upi-status/${orderId}`);
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to check UPI payment status.';
      const statusErr = new Error(errMsg);
      statusErr.response = err.response;
      throw statusErr;
    }
  },

  simulateUpiPaymentSuccess: async (orderId) => {
    try {
      const response = await api.post(`/payments/simulate-upi-success/${orderId}`);
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Simulation failed.';
      const simErr = new Error(errMsg);
      simErr.response = err.response;
      throw simErr;
    }
  },

  verifyUpiUtr: async (orderId, utrNumber, bookingId = null) => {
    try {
      const response = await api.post('/payments/verify-upi-utr', {
        order_id: orderId,
        booking_id: bookingId,
        utr_number: utrNumber
      });
      return response.data || response;
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'UTR verification failed.';
      const utrErr = new Error(errMsg);
      utrErr.response = err.response;
      throw utrErr;
    }
  }
};

export const createUpiQrOrder = paymentApi.createUpiQrOrder;
export const getUpiPaymentStatus = paymentApi.getUpiPaymentStatus;
export const simulateUpiPaymentSuccess = paymentApi.simulateUpiPaymentSuccess;
export const verifyUpiUtr = paymentApi.verifyUpiUtr;

export default paymentApi;
