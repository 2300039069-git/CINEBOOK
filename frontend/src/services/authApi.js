import api from './api';

export const authApi = {
  login: async (email, password) => {
    try {
      return await api.post('/auth/login', { email, password });
    } catch (err) {
      if (err.status === 401 || err.response?.status === 401) {
        throw new Error('Incorrect email or password. Please verify your credentials.');
      }
      if (!err.status || err.message?.includes('Network Error') || err.message?.includes('timeout') || err.status >= 500) {
        throw new Error(
          'Unable to reach CineBook backend server on Render. The server may be waking up (cold start takes ~30-45s on Render Free Tier). Please check your connection and try again.'
        );
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      if (err.status === 400 || err.response?.status === 400) {
        throw new Error(err.response?.data?.detail || err.message || 'An account with this email already exists.');
      }
      if (!err.status || err.message?.includes('Network Error') || err.message?.includes('timeout') || err.status >= 500) {
        throw new Error(
          'Unable to reach CineBook backend server on Render. The server may be waking up. Please try again in a few moments.'
        );
      }
      throw err;
    }
  },

  // 1. Registration with OTP
  sendRegistrationOTP: async (email) => {
    return await api.post('/auth/send-registration-otp', { email });
  },

  verifyRegistrationOTP: async (registrationDataWithOTP) => {
    return await api.post('/auth/verify-registration-otp', registrationDataWithOTP);
  },

  // 2. Forgot Password with OTP
  sendResetOTP: async (email) => {
    return await api.post('/auth/send-reset-otp', { email });
  },

  verifyResetOTP: async (resetData) => {
    return await api.post('/auth/verify-reset-otp', resetData);
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  }
};
