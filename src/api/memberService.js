/**
 * Member API 서비스
 * Member 관련 API 호출을 담당
 */

import apiClient from './apiClient';

const memberService = {
  /**
   * 모든 멤버 목록 조회
   * @returns {Promise<Member[]>} 멤버 목록
   */
  async getItems({ auth = false } = {}) {
    try {
      // 서버 API 호출
     const res = await apiClient.get('/api/members', { auth });
     return res.data;
    } catch (error) {
      console.error('Failed to fetch members:', error);
      throw error;
    }
  },

  /**
   * 특정 멤버 조회
   * @param {string|number} id - 멤버 ID
   * @returns {Promise<Member>} 멤버 정보
   */
  async getItemById(id, { auth = true } = {}) {
    try {
      return await apiClient.get(`/api/members/${id}`, { auth });
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      throw error;
    }
  },

  /**
   * 멤버 생성
   * @param {Member} memberData - 생성할 멤버 데이터
   * @returns {Promise<Member>} 생성된 멤버 정보
   */
  async createItem(memberData) {
    try {
      return await apiClient.post('/api/members', memberData);
    } catch (error) {
      console.error('Failed to create member:', error);
      throw error;
    }
  },

  /**
   * 멤버 정보 업데이트
   * @param {string|number} id - 멤버 ID
   * @param {Partial<Member>} memberData - 업데이트할 데이터
   * @returns {Promise<Member>} 업데이트된 멤버 정보
   */
  async updateItem(id, memberData) {
    try {
      return await apiClient.put(`/api/members/${id}`, memberData);
    } catch (error) {
      console.error(`Failed to update member ${id}:`, error);
      throw error;
    }
  },

  /**
   * 멤버 정보 부분 업데이트
   * @param {string|number} id - 멤버 ID
   * @param {Partial<Member>} memberData - 업데이트할 데이터
   * @returns {Promise<Member>} 업데이트된 멤버 정보
   */
  async patchItem(id, memberData) {
    try {
      return await apiClient.patch(`/api/members/${id}`, memberData);
    } catch (error) {
      console.error(`Failed to patch member ${id}:`, error);
      throw error;
    }
  },

  /**
   * 멤버 삭제
   * @param {string|number} id - 멤버 ID
   * @returns {Promise<void>}
   */
  async deleteItem(id) {
    try {
      return await apiClient.delete(`/api/members/${id}`);
    } catch (error) {
      console.error(`Failed to delete member ${id}:`, error);
      throw error;
    }
  },

  /**
   * 필터링된 멤버 목록 조회
   * @param {Object} filters - 필터 조건
   * @param {string[]} [filters.rights] - 권한 필터
   * @param {string[]} [filters.tiers] - 티어 필터
   * @returns {Promise<Member[]>} 필터링된 멤버 목록
   */
  async getFilteredItems(filters, { auth = false } = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.rights && filters.rights.length > 0) {
        queryParams.append('rights', filters.rights.join(','));
      }

      if (filters.tiers && filters.tiers.length > 0) {
        queryParams.append('tiers', filters.tiers.join(','));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/api/members?${queryString}`
        : '/api/members';

      return await apiClient.get(endpoint, { auth });
    } catch (error) {
      console.error('Failed to fetch filtered members:', error);
      throw error;
    }
  },

  /**
   * 멤버 TKTK 티어/레벨 업데이트
   * @param {string|number} id
   * @param {{tierName?: string|null, levelCode?: string|null}} payload
   */
  async updateTierAssignment(id, payload) {
    try {
      const res = await apiClient.patch(`/api/members/${id}/tier`, payload);
      return res.data;
    } catch (error) {
      console.error(`Failed to update member ${id} tier:`, error);
      throw error;
    }
  },

  /**
   * 게임 정보 연동 재시도
   * @param {string} gameName - 게임 이름
   * @returns {Promise<any>} 연동 결과
   */
  async retryGameSync(gameName) {
    try {
      const res = await apiClient.post(`/api/member/accountId/${gameName}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to retry game sync for ${gameName}:`, error);
      throw error;
    }
  }
};

export default memberService;
