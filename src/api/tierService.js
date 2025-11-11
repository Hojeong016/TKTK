import apiClient from './apiClient';

const tierService = {
  // 티어 목록 조회
  getTiers: async () => {
    const res = await apiClient.get('/api/tiers');
    return res.data; // ApiResponse.data
  },

  // 특정 티어 상세 조회
  getTierDetail: async (tierId) => {
    const res = await apiClient.get(`/api/tiers/${tierId}`);
    return res.data; // ApiResponse.data
  },

  // 특정 레벨 점수 수정
  updateTierLevelScores: async (tierId, levelCode, payload) => {
    const res = await apiClient.put(
      `/api/tiers/${tierId}/levels/${levelCode}/scores`,
      payload
    );
    return res.data;
  },

  // 여러 레벨 점수 수정
  updateTierScores: async (tierId, payload) => {
    const res = await apiClient.put(`/api/tiers/${tierId}/scores`, payload);
    return res.data;
  },
};

export default tierService;
