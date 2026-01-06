import apiClient from './apiClient';

/**
 * Ledger API 서비스
 * 공금 입출금 내역 관리 API
 */
const ledgerService = {
  /**
   * 모든 거래 내역 조회
   * @returns {Promise<Transaction[]>} 거래 내역 목록
   */
  async getTransactions({ auth = true } = {}) {
    try {
      const res = await apiClient.get('/api/ledger/transactions', { auth });
      return res.data?.data ?? res.data ?? [];
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  /**
   * 특정 거래 내역 조회
   * @param {string|number} id - 거래 ID
   * @returns {Promise<Transaction>} 거래 정보
   */
  async getTransactionById(id) {
    try {
      const res = await apiClient.get(`/api/ledger/transactions/${id}`);
      return res.data?.data ?? res.data ?? null;
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * 새 거래 내역 추가
   * @param {Object} transactionData - 거래 데이터
   * @param {string} transactionData.date - 거래 날짜 (YYYY-MM-DD)
   * @param {string} transactionData.type - 거래 구분 ('income' | 'expense')
   * @param {string} transactionData.category - 카테고리
   * @param {number} transactionData.amount - 금액
   * @param {string} transactionData.description - 거래 내용
   * @param {string} transactionData.memo - 메모
   * @returns {Promise<Transaction>} 생성된 거래 정보
   */
  async createTransaction(transactionData) {
    try {
      const res = await apiClient.post('/api/ledger/transactions', transactionData);
      return res.data?.data ?? res.data ?? null;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  },

  /**
   * 거래 내역 수정
   * @param {string|number} id - 거래 ID
   * @param {Object} transactionData - 수정할 데이터
   * @returns {Promise<Transaction>} 수정된 거래 정보
   */
  async updateTransaction(id, transactionData) {
    try {
      const res = await apiClient.put(`/api/ledger/transactions/${id}`, transactionData);
      return res.data?.data ?? res.data ?? null;
    } catch (error) {
      console.error(`Failed to update transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * 거래 내역 삭제
   * @param {string|number} id - 거래 ID
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    try {
      const res = await apiClient.delete(`/api/ledger/transactions/${id}`);
      return res.data?.data ?? res.data ?? null;
    } catch (error) {
      console.error(`Failed to delete transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * 거래 통계 조회
   * @param {Object} params - 조회 조건
   * @param {string} params.startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {string} params.endDate - 종료 날짜 (YYYY-MM-DD)
   * @returns {Promise<Object>} 통계 정보
   */
  async getStatistics(params) {
    try {
      const queryParams = new URLSearchParams(params);
      const res = await apiClient.get(`/api/ledger/statistics?${queryParams.toString()}`);
      return res.data?.data ?? res.data ?? {};
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  },

  /**
   * 카테고리 목록 조회
   * @returns {Promise<string[]>} 카테고리 목록
   */
  async getCategories() {
    try {
      const res = await apiClient.get('/api/ledger/categories');
      return res.data?.data ?? res.data ?? [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 실패 시 기본 카테고리 반환
      return ['회비', '후원', '펀딩', '이벤트', '식비', '기타'];
    }
  }
};

export default ledgerService;
