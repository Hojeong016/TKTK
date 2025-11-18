import tokenStorage from '../utils/tokenStorage';

/**
 * API 클라이언트 클래스
 * 서버 통신을 담당하는 중앙화된 API 클래스
 */

class ApiClient {
  constructor() {
    // 환경 변수에서 API URL 가져오기
    // 기본값: 로컬 개발 환경
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    this.timeout = process.env.REACT_APP_API_TIMEOUT || 10000;
  }

  /**
   * HTTP 요청을 보내는 기본 메서드
   * @param {string} endpoint - API 엔드포인트
   * @param {RequestInit} options - fetch 옵션
   * @returns {Promise<any>} 응답 데이터
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const {
      auth = true,
      ...fetchOptions
    } = options;

    // JWT 토큰 가져오기 (필요 시)
    const token = auth ? tokenStorage.getToken() : null;

    const config = {
      ...fetchOptions,
      credentials: 'omit', // JWT 기반 인증: 쿠키 미사용
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
    };

    // 타임아웃 처리
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.');
      }
      throw error;
    }
  }

  /**
   * GET 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {RequestInit} options - fetch 옵션
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {any} data - 전송할 데이터
   * @param {RequestInit} options - fetch 옵션
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {any} data - 전송할 데이터
   * @param {RequestInit} options - fetch 옵션
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {any} data - 전송할 데이터
   * @param {RequestInit} options - fetch 옵션
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {RequestInit} options - fetch 옵션
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

export default apiClient;
