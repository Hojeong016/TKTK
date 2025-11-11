import apiClient from './apiClient';

const rightsService = {
  async getRights() {
    const res = await apiClient.get('/api/rights');
    return res.data;
  },

  async createRight(payload) {
    const res = await apiClient.post('/api/rights', payload);
    return res.data;
  },

  async updateRight(rightId, payload) {
    const res = await apiClient.put(`/api/rights/${rightId}`, payload);
    return res.data;
  },

  async deleteRight(rightId) {
    const res = await apiClient.delete(`/api/rights/${rightId}`);
    return res.data;
  },
};

export default rightsService;
