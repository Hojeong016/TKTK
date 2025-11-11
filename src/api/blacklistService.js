import apiClient from './apiClient';

const blacklistService = {
  async getEntries() {
    const res = await apiClient.get('/api/blacklist');
    return res.data;
  },

  async warnMember(memberId, payload) {
    const res = await apiClient.post(`/api/blacklist/${memberId}/warn`, payload);
    return res.data;
  },

  async removeWarning(memberId, payload) {
    const res = await apiClient.post(`/api/blacklist/${memberId}/warn/remove`, payload);
    return res.data;
  },

  async blacklistMember(memberId, payload) {
    const res = await apiClient.post(`/api/blacklist/${memberId}/blacklist`, payload);
    return res.data;
  },

  async releaseMember(memberId, payload) {
    const res = await apiClient.post(`/api/blacklist/${memberId}/release`, payload);
    return res.data;
  },
};

export default blacklistService;
