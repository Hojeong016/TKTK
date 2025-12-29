/**
 * Discord OAuth 인증 유틸리티
 */

/**
 * 랜덤 state 문자열 생성 (CSRF 방지용)
 */
export const generateState = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Discord 인가 URL 생성
 */
export const getDiscordAuthUrl = () => {
  const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REACT_APP_DISCORD_REDIRECT_URI);
  const scope = encodeURIComponent(process.env.REACT_APP_DISCORD_SCOPES || 'identify email');
  const state = generateState();

  // state를 sessionStorage에 저장하여 나중에 검증
  sessionStorage.setItem('discord_oauth_state', state);

  return `https://discord.com/oauth2/authorize?response_type=code&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUri}&prompt=consent`;
};

/**
 * Discord 로그인 시작
 */
export const initiateDiscordLogin = () => {
  const authUrl = getDiscordAuthUrl();
  window.location.href = authUrl;
};

/**
 * OAuth state 검증
 */
export const verifyState = (receivedState) => {
  const savedState = sessionStorage.getItem('discord_oauth_state');
  sessionStorage.removeItem('discord_oauth_state');
  return savedState === receivedState;
};

/**
 * 로컬 스토리지에서 액세스 토큰 가져오기
 */
export const getAccessToken = () => {
  return localStorage.getItem('discord_access_token');
};

/**
 * 로컬 스토리지에 액세스 토큰 저장
 */
export const setAccessToken = (token) => {
  localStorage.setItem('discord_access_token', token);
};

/**
 * 로컬 스토리지에서 리프레시 토큰 가져오기
 */
export const getRefreshToken = () => {
  return localStorage.getItem('discord_refresh_token');
};

/**
 * 로컬 스토리지에 리프레시 토큰 저장
 */
export const setRefreshToken = (token) => {
  localStorage.setItem('discord_refresh_token', token);
};

/**
 * 로그아웃 (토큰 제거)
 */
export const logout = () => {
  localStorage.removeItem('discord_access_token');
  localStorage.removeItem('discord_refresh_token');
  localStorage.removeItem('discord_user');
};

/**
 * 사용자 정보 저장
 */
export const setUser = (user) => {
  localStorage.setItem('discord_user', JSON.stringify(user));
};

/**
 * 사용자 정보 가져오기
 */
export const getUser = () => {
  const userStr = localStorage.getItem('discord_user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * 로그인 여부 확인
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * 로컬 스토리지에서 Signup 토큰 가져오기
 */
export const getSignupToken = () => {
  return localStorage.getItem('discord_signup_token');
};

/**
 * 로컬 스토리지에 Signup 토큰 저장
 */
export const setSignupToken = (token) => {
  localStorage.setItem('discord_signup_token', token);
};

/**
 * 로컬 스토리지에서 Signup 토큰 제거
 */
export const removeSignupToken = () => {
  localStorage.removeItem('discord_signup_token');
};
