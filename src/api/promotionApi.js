import api from './axios';

export const promotionApi = {
  validateCode: async (code, orderAmount) => {
    const res = await api.post('/promotions/validate', { code, orderAmount });
    return res.data;
  },

  getActivePromotions: async () => {
    const res = await api.get('/promotions/active');
    return res.data;
  },

  // Admin
  getAdminPromotions: async () => {
    const res = await api.get('/promotions/admin/all');
    return res.data;
  },

  createPromotion: async (data) => {
    const res = await api.post('/promotions/admin', data);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await api.delete(`/promotions/admin/${id}`);
    return res.data;
  }
};

export default promotionApi;
