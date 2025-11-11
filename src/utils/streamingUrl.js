/**
 * StreamingUrl 유틸리티 함수
 * 서버에서 StreamingUrl 객체 타입으로 내려오는 경우 URL 문자열 추출
 */

/**
 * StreamingUrl 객체에서 URL 문자열 추출
 * @param {string|object} streamingUrl - StreamingUrl 객체 또는 문자열
 * @returns {string} URL 문자열
 */
export const extractStreamingUrl = (streamingUrl) => {
  if (!streamingUrl) return '';

  // 이미 문자열인 경우
  if (typeof streamingUrl === 'string') return streamingUrl;

  // 객체인 경우 - url, value 필드 또는 toString() 사용
  if (typeof streamingUrl === 'object') {
    return streamingUrl.url || streamingUrl.value || String(streamingUrl);
  }

  return '';
};
