import axios from 'axios';
import { logout } from '../utils/discord-auth';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('discord_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 처리
    if (error.response && error.response.status === 401) {
      // 토큰 만료 또는 인증 실패
      console.warn('토큰이 만료되었거나 인증에 실패했습니다.');

      // 이미 처리 중인지 확인 (중복 처리 방지)
      if (!sessionStorage.getItem('auth_error_handling')) {
        sessionStorage.setItem('auth_error_handling', 'true');

        // 로그아웃 처리 (토큰 삭제)
        logout();

        // 401 에러 플래그 설정
        sessionStorage.setItem('auth_expired', 'true');

        // 홈 페이지로 리다이렉트
        window.location.href = '/';
      }

      return Promise.reject(new Error('로그인이 만료되었습니다. 다시 로그인해주세요.'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
