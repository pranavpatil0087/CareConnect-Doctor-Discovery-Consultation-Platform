import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const res = await api.post('/api/v1/reviews', reviewData);
    return res.data;
  },

  getDoctorReviews: async (doctorId) => {
    const res = await api.get(`/api/v1/reviews/doctor/${doctorId}`);
    return res.data;
  },

  getMyReviews: async () => {
    const res = await api.get('/api/v1/reviews/my-reviews');
    return res.data;
  },
};

export default reviewService;
