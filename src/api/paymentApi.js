import api from './axios';

export const paymentApi = {
  initiatePayment: async (orderId, phoneNumber) => {
    const res = await api.post('/payments/initiate', { orderId, phoneNumber });
    return res.data;
  },

  getPaymentStatus: async (orderId) => {
    const res = await api.get(`/payments/status/${orderId}`);
    return res.data;
  },

  // Admin
  getAdminPayments: async (params = {}) => {
    const res = await api.get('/payments/admin/records', { params });
    return res.data;
  },

  manualVerify: async (orderId, transactionId, method = 'mpesa', note = '') => {
    const res = await api.post('/payments/admin/manual-verify', { orderId, transactionId, method, note });
    return res.data;
  }
};

export default paymentApi;
