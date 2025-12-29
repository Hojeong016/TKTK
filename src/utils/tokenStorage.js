const TOKEN_KEY = 'authToken';
const DISCORD_TOKEN_KEY = 'discord_access_token';

const tokenStorage = {
  /**
   * 현재 저장된 JWT 토큰 반환
   * Discord 토큰을 우선적으로 확인하고, 없으면 기본 토큰 확인
   * @returns {string|null}
   */
  getToken() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    // Discord 토큰 먼저 확인
    const discordToken = window.localStorage.getItem(DISCORD_TOKEN_KEY);
    if (discordToken) {
      return discordToken;
    }
    // 기본 토큰 확인
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
   * 저장된 토큰 삭제 (Discord 토큰 포함)
   */
  clearToken() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(DISCORD_TOKEN_KEY);
  }
};

export default tokenStorage;
