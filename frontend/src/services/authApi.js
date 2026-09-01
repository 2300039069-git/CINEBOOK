import api from './api';

export const authApi = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
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
