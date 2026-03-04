import apiClient from './apiClient';

const DEFAULT_COUNT = 20;

const getBaseUrl = () => {
  const base = process.env.REACT_APP_API_BASE_URL;
  return base && base.trim().length > 0 ? base : '';
};

const buildStreamUrl = () => {
  const base = getBaseUrl();
  if (!base) {
    return '/api/rank/stream';
  }
  try {
    const url = new URL('/api/rank/stream', base);
    return url.toString();
  } catch {
    return '/api/rank/stream';
  }
};

const normalizeRankingsResponse = (payload) => {
  if (!payload) return { rankings: [], currentSeason: null };

  // 신규 응답 형식: { data: { currentSeason, rankings } }
  const data = payload.data ?? payload;
  if (data.rankings && Array.isArray(data.rankings)) {
    return {
      rankings: data.rankings,
      currentSeason: data.currentSeason ?? null,
    };
  }

  // 구 응답 형식 호환 (배열 직접 반환)
  if (Array.isArray(data)) {
    return { rankings: data, currentSeason: null };
  }
  if (Array.isArray(payload)) {
    return { rankings: payload, currentSeason: null };
  }

  return { rankings: [], currentSeason: null };
};

const rankService = {
  async getRankings({ count = DEFAULT_COUNT } = {}) {
    const searchParams = new URLSearchParams();
    if (count) {
      searchParams.set('count', count);
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/rank?${queryString}` : '/api/rank';

    const res = await apiClient.get(endpoint);
    return normalizeRankingsResponse(res);
  },
  getStreamUrl: () => buildStreamUrl(),
};

export default rankService;
