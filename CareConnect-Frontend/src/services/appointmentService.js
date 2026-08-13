import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/api/v1/appointments', appointmentData);
    return response.data;
  },

  getPatientAppointments: async () => {
    const response = await api.get('/api/v1/appointments/patient');
    return response.data;
  },

  getDoctorAppointments: async () => {
    const response = await api.get('/api/v1/appointments/doctor');
    return response.data;
  },

  getAppointmentByBookingId: async (bookingId) => {
    const response = await api.get(`/api/v1/appointments/${bookingId}`);
    return response.data;
  },

  updateStatus: async (appointmentId, status) => {
    const response = await api.patch(`/api/v1/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  addPrescription: async (prescriptionData) => {
    const response = await api.post('/api/v1/appointments/prescription', prescriptionData);
    return response.data;
  }
};
