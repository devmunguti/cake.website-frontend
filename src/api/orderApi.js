import api from './axios';

export const orderApi = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },

  getOrderByRef: async (orderRef) => {
    const res = await api.get(`/orders/track/${orderRef}`);
    return res.data;
  },

  // Admin
  getAdminOrders: async (params = {}) => {
    const res = await api.get('/orders/admin/all', { params });
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/orders/admin/dashboard-stats');
    return res.data;
  },

  updateOrderStatus: async (id, status, note = '') => {
    const res = await api.patch(`/orders/admin/${id}/status`, { status, note });
    return res.data;
  }
};

export default orderApi;
