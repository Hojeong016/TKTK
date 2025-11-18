const TOKEN_KEY = 'authToken';

const tokenStorage = {
  /**
   * 현재 저장된 JWT 토큰 반환
   * @returns {string|null}
   */
  getToken() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(TOKEN_KEY);
  },

  /**
   * JWT 토큰 저장
   * @param {string} token
   */
  setToken(token) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * 저장된 토큰 삭제
   */
  clearToken() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

export default tokenStorage;
