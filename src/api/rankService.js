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

const normalizeResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data?.items && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }
  return [];
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
    return normalizeResponse(res);
  },
  getStreamUrl: () => buildStreamUrl(),
};

export default rankService;
