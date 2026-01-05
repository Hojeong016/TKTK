import axiosInstance from './axiosConfig';

/**
 * 공통 쿼리 스트링 생성
 * @param {Record<string, any>} params
 */
const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, value);
  });

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
};

const gameStatsService = {
  async getActivity(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/activity/${memberId}${query}`);
    return res.data?.data;
  },

  async getStats(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/stats/${memberId}${query}`);
    return res.data?.data;
  },

  async getTrends(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/trends/${memberId}${query}`);
    return res.data?.data;
  },

  async getMapStats(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/maps/${memberId}${query}`);
    return res.data?.data;
  },

  async getSeasonStats(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/seasons/${memberId}${query}`);
    return res.data?.data;
  },

  async getMatches(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/matches/${memberId}${query}`);
    return res.data?.data;
  },

  async getAchievements(memberId, params = {}) {
    const query = buildQueryString(params);
    const res = await axiosInstance.get(`/api/game/achievements/${memberId}${query}`);
    return res.data?.data;
  }
};

export default gameStatsService;
