/**
 * Auth API 서비스
 * 세션 기반 인증 관련 API 호출
 */

import apiClient from './apiClient';
import tokenStorage from '../utils/tokenStorage';

const authService = {
  /**
   * 로그인
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @returns {Promise<any>} 로그인 결과
   */
  async login(userName, password) {
    try {
      const result = await apiClient.post('/api/auth/login', {
        userName,
        password
      });

      const token = result?.data?.accessToken || result?.data?.token || result?.accessToken;
      if (!token) {
        throw new Error('토큰 발급에 실패했습니다.');
      }

      tokenStorage.setToken(token);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * 회원가입
   * @param {Object} signupData - 회원가입 데이터
   * @param {string} signupData.userName - 사용자 이름 (4-20자, 영문/숫자/_/-)
   * @param {string} signupData.nickName - 닉네임 (2-20자)
   * @param {string} signupData.password - 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)
   * @param {string} signupData.adminCode - 관리자 코드
   * @returns {Promise<any>} 회원가입 결과
   */
  async signup(signupData) {
    try {
      const response = await apiClient.post('/api/auth/signup', signupData);
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  /**
   * 로그아웃
   * @returns {Promise<any>} 로그아웃 결과
   */
  async logout() {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      tokenStorage.clearToken();
    }
  },

  /**
   * 인증 여부 확인
   * @returns {boolean} 인증 여부
   */
  isAuthenticated() {
    return !!tokenStorage.getToken();
  }
};

export default authService;
