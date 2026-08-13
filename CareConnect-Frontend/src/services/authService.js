import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  sendOtp: async (contact, method = 'sms') => {
    const response = await api.post('/api/v1/auth/otp/send', { contact, method });
    return response.data;
  },

  verifyOtp: async (contact, code) => {
    const response = await api.post('/api/v1/auth/otp/verify', { contact, code });
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/api/v1/auth/google-login', { idToken });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
    }
  }
};
