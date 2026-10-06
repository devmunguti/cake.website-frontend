import api from './axios';

export const cakeApi = {
  // Public
  getCakes: async (params = {}) => {
    const res = await api.get('/cakes', { params });
    return res.data;
  },

  getFeaturedCakes: async () => {
    const res = await api.get('/cakes/featured');
    return res.data;
  },

  getCakeBySlug: async (slug) => {
    const res = await api.get(`/cakes/${slug}`);
    return res.data;
  },

  // Admin
  createCake: async (cakeData) => {
    const res = await api.post('/cakes', cakeData);
    return res.data;
  },

  updateCake: async (id, cakeData) => {
    const res = await api.put(`/cakes/${id}`, cakeData);
    return res.data;
  },

  deleteCake: async (id) => {
    const res = await api.delete(`/cakes/${id}`);
    return res.data;
  },

  toggleAvailability: async (id) => {
    const res = await api.patch(`/cakes/${id}/toggle-availability`);
    return res.data;
  },

  toggleFeatured: async (id) => {
    const res = await api.patch(`/cakes/${id}/toggle-featured`);
    return res.data;
  }
};

export default cakeApi;
