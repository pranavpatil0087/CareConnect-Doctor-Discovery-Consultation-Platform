import api from './api';

export const specialityService = {
  getAllSpecialities: async () => {
    const response = await api.get('/api/v1/specialities');
    return response.data;
  },

  getSpecialityById: async (id) => {
    const response = await api.get(`/api/v1/specialities/${id}`);
    return response.data;
  }
};
