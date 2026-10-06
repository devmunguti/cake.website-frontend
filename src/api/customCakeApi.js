import api from './axios';

export const customCakeApi = {
  submitRequest: async (formData) => {
    const res = await api.post('/custom-cake-requests', formData);
    return res.data;
  },

  getRequestById: async (id) => {
    const res = await api.get(`/custom-cake-requests/${id}`);
    return res.data;
  },

  respondToQuote: async (id, action) => {
    const res = await api.patch(`/custom-cake-requests/${id}/response`, { action });
    return res.data;
  },

  // Admin
  getAdminRequests: async (params = {}) => {
    const res = await api.get('/custom-cake-requests', { params });
    return res.data;
  },

  provideQuote: async (id, quoteData) => {
    const res = await api.patch(`/custom-cake-requests/${id}/quote`, quoteData);
    return res.data;
  }
};

export default customCakeApi;
