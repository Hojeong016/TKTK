import apiClient from './apiClient';

const seasonService = {
  // === 공개 API ===

  async getSeasons() {
    const res = await apiClient.get('/api/seasons', { auth: false });
    return res?.data ?? res ?? [];
  },

  async getCurrentSeason() {
    try {
      const res = await apiClient.get('/api/seasons/current', { auth: false });
      return res?.data ?? res ?? null;
    } catch {
      return null;
    }
  },

  async getSeasonRankings(seasonId, { count = 20 } = {}) {
    const params = new URLSearchParams();
    if (count) params.set('count', count);
    const qs = params.toString();
    const endpoint = qs
      ? `/api/seasons/${seasonId}/rank?${qs}`
      : `/api/seasons/${seasonId}/rank`;
    const res = await apiClient.get(endpoint, { auth: false });
    return res?.data ?? res;
  },

  // === 관리자 API ===

  async getAdminSeasons() {
    const res = await apiClient.get('/api/admin/seasons');
    return res?.data ?? res ?? [];
  },

  async createSeason(body) {
    const res = await apiClient.post('/api/admin/seasons', body);
    return res?.data ?? res;
  },

  async updateSeason(seasonId, body) {
    const res = await apiClient.put(`/api/admin/seasons/${seasonId}`, body);
    return res?.data ?? res;
  },

  async startSeason(seasonId) {
    const res = await apiClient.post(`/api/admin/seasons/${seasonId}/start`, {
      requestedAt: new Date().toISOString().slice(0, 19),
    });
    return res?.data ?? res;
  },

  async endSeason(seasonId) {
    const res = await apiClient.post(`/api/admin/seasons/${seasonId}/end`, {
      requestedAt: new Date().toISOString().slice(0, 19),
    });
    return res?.data ?? res;
  },

  async deleteSeason(seasonId) {
    const res = await apiClient.delete(`/api/admin/seasons/${seasonId}`);
    return res?.data ?? res;
  },
};

export default seasonService;
