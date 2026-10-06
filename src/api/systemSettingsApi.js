import api from './axios';

export const systemSettingsApi = {
  /**
   * Retrieves complete Store Settings for authenticated admin
   */
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  getAdminSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  /**
   * Updates global Store Settings
   */
  updateSettings: async (settingsPayload) => {
    const response = await api.put('/admin/settings', settingsPayload);
    return response.data;
  },

  updateAdminSettings: async (settingsPayload) => {
    const response = await api.put('/admin/settings', settingsPayload);
    return response.data;
  },

  /**
   * Unauthenticated public config endpoint
   */
  getPublicSettings: async () => {
    const response = await api.get('/public/settings');
    return response.data;
  }
};

export default systemSettingsApi;
