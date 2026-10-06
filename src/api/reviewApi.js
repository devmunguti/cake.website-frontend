import api from './axios';

export const reviewApi = {
  getReviews: async (params = {}) => {
    const res = await api.get('/reviews', { params });
    return res.data;
  },

  submitReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  // Admin
  replyToReview: async (id, replyText) => {
    const res = await api.patch(`/reviews/${id}/reply`, { replyText });
    return res.data;
  },

  togglePublish: async (id) => {
    const res = await api.patch(`/reviews/${id}/toggle-publish`);
    return res.data;
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  }
};

export default reviewApi;
