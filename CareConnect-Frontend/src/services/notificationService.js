import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/api/v1/notifications');
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get('/api/v1/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.put(`/api/v1/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/api/v1/notifications/read-all');
    return res.data;
  },
};

export default notificationService;
