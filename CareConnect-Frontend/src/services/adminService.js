import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/api/v1/admin/stats');
    return res.data;
  },

  getAllDoctors: async () => {
    const res = await api.get('/api/v1/admin/doctors');
    return res.data;
  },

  verifyDoctor: async (doctorId, isVerified) => {
    const res = await api.put(`/api/v1/admin/doctors/${doctorId}/verify?isVerified=${isVerified}`);
    return res.data;
  },

  getAllPatients: async () => {
    const res = await api.get('/api/v1/admin/patients');
    return res.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const res = await api.put(`/api/v1/admin/users/${userId}/toggle-status?isActive=${isActive}`);
    return res.data;
  },

  getAllAppointments: async () => {
    const res = await api.get('/api/v1/admin/appointments');
    return res.data;
  },

  getAuditLogs: async (params = {}) => {
    const res = await api.get('/api/v1/admin/audit-logs', { params });
    return res.data;
  },
};

export default adminService;
