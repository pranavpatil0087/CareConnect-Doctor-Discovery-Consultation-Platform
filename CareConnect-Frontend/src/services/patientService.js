import api from './api';

export const patientService = {
  getPatientProfile: async () => {
    const response = await api.get('/api/v1/patients/me');
    return response.data;
  },

  updatePatientProfile: async (patientData) => {
    const response = await api.put('/api/v1/patients/me', patientData);
    return response.data;
  },

  getMedicalHistory: async () => {
    const response = await api.get('/api/v1/patients/me/medical-history');
    return response.data;
  }
};
