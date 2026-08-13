import api from './api';

export const doctorService = {
  getDoctorProfile: async () => {
    const response = await api.get('/api/v1/doctors/me');
    return response.data;
  },

  updateDoctorProfile: async (doctorData) => {
    const response = await api.put('/api/v1/doctors/me', doctorData);
    return response.data;
  },

  updateAvailability: async (isAvailable) => {
    const response = await api.patch('/api/v1/doctors/me/availability', { isAvailable });
    return response.data;
  },

  getYearlyEarnings: async () => {
    const response = await api.get('/api/v1/doctors/me/earnings');
    return response.data;
  },

  searchDoctors: async (params = {}) => {
    const response = await api.get('/api/v1/doctors/search', { params });
    return response.data;
  },

  getDoctorById: async (doctorId) => {
    const response = await api.get(`/api/v1/doctors/${doctorId}`);
    return response.data;
  }
};
