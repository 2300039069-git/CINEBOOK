import api from './api';

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Ta1Px7K4yVtNZ4';

const withTimeout = (promise, ms = 1200) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentApi = {
  createOrder: async (bookingId, amount) => {
    try {
      const response = await api.post('/payments/create-order', {
        booking_id: bookingId,
        amount: amount
      });
      return response.data || response;
    } catch (err) {
      console.warn('Backend payment create-order failed, using test order:', err.message);
      return {
        order_id: `order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        key_id: RAZORPAY_KEY_ID,
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



