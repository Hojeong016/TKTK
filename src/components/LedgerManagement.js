import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ledgerService from '../api/ledgerService';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';

/**
 * LedgerManagement - 공금 입출금 내역 관리 컴포넌트
 * 관리자가 거래 내역을 추가/수정/삭제할 수 있는 관리 페이지
 */
export default function LedgerManagement() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categories, setCategories] = useState(['회비', '후원', '펀딩', '이벤트', '식비', '기타']);
  const [newCategory, setNewCategory] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '회비',
    amount: '',
    description: '',
    memo: ''
  });

  // 거래 내역 조회
  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ['ledger-transactions'],
    queryFn: () => ledgerService.getTransactions(),
  });

  // 거래 추가 mutation
  const createMutation = useMutation({
    mutationFn: ledgerService.createTransaction,
    onSuccess: () => {
      showToast('success', '거래 내역이 추가되었습니다.');
      queryClient.invalidateQueries(['ledger-transactions']);
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
      showToast('error', '거래 내역 추가에 실패했습니다.');
    },
  });

  // 거래 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ledgerService.updateTransaction(id, data),
    onSuccess: () => {
      showToast('success', '거래 내역이 수정되었습니다.');
      queryClient.invalidateQueries(['ledger-transactions']);
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error);
      showToast('error', '거래 내역 수정에 실패했습니다.');
    },
  });

  // 거래 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: ledgerService.deleteTransaction,
    onSuccess: () => {
      showToast('success', '거래 내역이 삭제되었습니다.');
      queryClient.invalidateQueries(['ledger-transactions']);
      setDeleteTarget(null);
    },
    onError: (error) => {
      console.error('Failed to delete transaction:', error);
      showToast('error', '거래 내역 삭제에 실패했습니다.');
    },
  });

  // 모달 열기 - 새 거래 추가
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: '회비',
      amount: '',
      description: '',
      memo: ''
    });
    setIsModalOpen(true);
  };

  // 모달 열기 - 거래 수정
  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      memo: transaction.memo || ''
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: '회비',
      amount: '',
      description: '',
      memo: ''
    });
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.date || !formData.category || !formData.amount || !formData.description) {
      showToast('error', '필수 항목을 모두 입력해주세요.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', '올바른 금액을 입력해주세요.');
      return;
    }

    const transactionData = {
      date: formData.date,
      type: formData.type,
      category: formData.category,
      amount: amount,
      description: formData.description,
      memo: formData.memo
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: transactionData });
    } else {
      createMutation.mutate(transactionData);
    }
  };

  // 삭제 확인
  const handleDelete = (transaction) => {
    setDeleteTarget(transaction);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  // 새 카테고리 추가
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="management-table-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            공금 입출금 내역 관리
          </h2>
          <button
            onClick={handleOpenAddModal}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            새 거래 추가
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          클랜 공금의 입출금 내역을 추가, 수정, 삭제할 수 있습니다.
        </p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading transactions</div>
      ) : !transactions || transactions.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: '8px'
        }}>
          거래 내역이 없습니다. 새 거래를 추가해보세요.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>구분</th>
                <th>카테고리</th>
                <th>내용</th>
                <th>금액</th>
                <th>메모</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>
                    <span
                      className="right-badge-small"
                      style={{
                        color: transaction.type === 'income' ? '#3b82f6' : '#ef4444',
                        backgroundColor: transaction.type === 'income' ? '#dbeafe' : '#fee2e2'
                      }}
                    >
                      {transaction.type === 'income' ? '수입' : '지출'}
                    </span>
                  </td>
                  <td>{transaction.category}</td>
                  <td>{transaction.description}</td>
                  <td style={{
                    color: transaction.type === 'income' ? '#3b82f6' : '#ef4444',
                    fontWeight: 600
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}₩{formatAmount(transaction.amount)}
                  </td>
                  <td>{transaction.memo || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenEditModal(transaction)}
                        title="수정"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(transaction)}
                        title="삭제"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 추가/수정 모달 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💰 {editingTransaction ? '거래 내역 수정' : '새 거래 추가'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* 날짜 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 구분 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  구분 *
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>수입</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>지출</span>
                  </label>
                </div>
              </div>

              {/* 카테고리 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  카테고리 *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const category = prompt('새 카테고리 이름을 입력하세요:');
                      if (category && category.trim() && !categories.includes(category.trim())) {
                        setCategories([...categories, category.trim()]);
                        setFormData({ ...formData, category: category.trim() });
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    + 추가
                  </button>
                </div>
              </div>

              {/* 금액 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  금액 (원) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="1"
                  placeholder="50000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 내용 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  내용 *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="1월 정기 회비"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* 메모 */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  메모
                </label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="10명 회비 입금 완료"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* 버튼 */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: createMutation.isPending || updateMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: createMutation.isPending || updateMutation.isPending ? 0.7 : 1,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? '처리 중...' : (editingTransaction ? '수정 완료' : '저장하기')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={!!deleteTarget}
        title="거래 내역 삭제"
        description={
          deleteTarget ? (
            <div>
              <p>정말 이 거래를 삭제하시겠습니까?</p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div><strong>날짜:</strong> {deleteTarget.date}</div>
                <div><strong>내용:</strong> {deleteTarget.description}</div>
                <div><strong>금액:</strong> {deleteTarget.type === 'income' ? '+' : '-'}₩{formatAmount(deleteTarget.amount)}</div>
              </div>
              <p style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                이 작업은 취소할 수 없습니다.
              </p>
            </div>
          ) : ''
        }
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
