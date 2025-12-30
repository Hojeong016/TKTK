import React from 'react';
import { useFetchItems } from '../api/useFetch';
import memberService from '../api/memberService';
import { useQueryClient } from '@tanstack/react-query';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';

/**
 * TKTK 티어 레벨 코드를 한글로 변환
 */
const getLevelCodeLabel = (levelCode) => {
  const levelMap = {
    'UPPER': '상',
    'MID': '중',
    'LOW': '하'
  };
  return levelMap[levelCode] || levelCode;
};

/**
 * ClanStatusManagement - 클랜 가입 승인/거절/해제 전용 관리 컴포넌트
 */
export default function ClanStatusManagement() {
  const { data, isLoading, isError } = useFetchItems({ requireAuth: true });
  const [clanActionTarget, setClanActionTarget] = React.useState(null); // { member, action: 'approve'|'reject'|'remove' }
  const [approveModalData, setApproveModalData] = React.useState(null); // { member, tier, level }
  const { toast, showToast } = useToast();
  const queryClient = useQueryClient();

  const handleApproveClan = (member) => {
    setApproveModalData({ member, tier: '1tier', level: 'UPPER' });
  };

  const handleRejectClan = (member) => {
    setClanActionTarget({ member, action: 'reject' });
  };

  const handleRemoveClan = (member) => {
    setClanActionTarget({ member, action: 'remove' });
  };

  const confirmApproveWithTier = async () => {
    if (!approveModalData) return;

    const { member, tier, level } = approveModalData;

    try {
      // 1. 클랜 승인
      await memberService.approveClanJoin(member.id);

      // 2. 티어 배정 (tier와 level이 선택된 경우에만)
      if (tier && level) {
        await memberService.updateTierAssignment(member.id, {
          tierName: tier,
          levelCode: level
        });
      }

      showToast('success', `클랜 가입이 승인되고 티어가 배정되었습니다.`);
      queryClient.invalidateQueries(['items']);
      setApproveModalData(null);
    } catch (error) {
      console.error('Failed to approve clan with tier:', error);
      showToast('error', `클랜 승인에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const confirmClanAction = async () => {
    if (!clanActionTarget) return;

    const { member, action } = clanActionTarget;

    try {
      if (action === 'reject') {
        await memberService.rejectClanJoin(member.id);
        showToast('success', '클랜 가입이 거절되었습니다.');
      } else if (action === 'remove') {
        await memberService.removeClanMember(member.id);
        showToast('success', '클랜원이 해제되었습니다.');
      }

      queryClient.invalidateQueries(['items']);
      setClanActionTarget(null);
    } catch (error) {
      console.error(`Failed to ${action} clan:`, error);
      showToast('error', `클랜 ${action === 'reject' ? '거절' : '해제'}에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const getClanActionMessage = () => {
    if (!clanActionTarget) return '';
    const { member, action } = clanActionTarget;

    if (action === 'reject') {
      return `"${member.name}" 님의 클랜 가입을 거절하시겠습니까?`;
    } else if (action === 'remove') {
      return `"${member.name}" 님을 클랜에서 해제하시겠습니까?`;
    }
    return '';
  };

  const getClanStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { text: '클랜원', color: '#10b981', bg: '#d1fae5' },
      PENDING: { text: '신청 중', color: '#f59e0b', bg: '#fef3c7' },
      NONE: { text: '미가입', color: '#6b7280', bg: '#f3f4f6' }
    };
    return statusConfig[status] || statusConfig.NONE;
  };

  // 클랜 상태별로 멤버 필터링
  const pendingMembers = data?.filter(m => m.clanJoinStatus === 'PENDING') || [];
  const approvedMembers = data?.filter(m => m.clanJoinStatus === 'APPROVED') || [];

  return (
    <div className="management-table-container">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
          클랜 가입 신청 관리
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          클랜 가입 신청을 승인하거나 거절하고, 클랜원을 해제할 수 있습니다.
        </p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading data</div>
      ) : !data || data.length === 0 ? (
        <div>No members found</div>
      ) : (
        <>
          {/* 신청 대기 중인 멤버 */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#f59e0b',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #f59e0b'
            }}>
              신청 대기 중 ({pendingMembers.length})
            </h3>

            {pendingMembers.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                신청 대기 중인 멤버가 없습니다.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>Discord 닉네임</th>
                      <th>게임명</th>
                      <th>티어</th>
                      <th>클랜 상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map((member) => {
                      const statusBadge = getClanStatusBadge(member.clanJoinStatus);
                      return (
                        <tr key={member.id}>
                          <td>{member.name || '—'}</td>
                          <td>{member.info?.discordname || '—'}</td>
                          <td>{member.game?.gamename || '—'}</td>
                          <td>{member.game?.tier || 'Unranked'}</td>
                          <td>
                            <span
                              className="right-badge-small"
                              style={{
                                color: statusBadge.color,
                                backgroundColor: statusBadge.bg
                              }}
                            >
                              {statusBadge.text}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                className="btn-save"
                                onClick={() => handleApproveClan(member)}
                                title="승인"
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                ✅ 승인
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => handleRejectClan(member)}
                                title="거절"
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                ❌ 거절
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 클랜원 목록 */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#10b981',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #10b981'
            }}>
              클랜원 목록 ({approvedMembers.length})
            </h3>

            {approvedMembers.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                클랜원이 없습니다.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>Discord 닉네임</th>
                      <th>게임명</th>
                      <th>티어</th>
                      <th>TKTK 티어</th>
                      <th>클랜 상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedMembers.map((member) => {
                      const statusBadge = getClanStatusBadge(member.clanJoinStatus);
                      return (
                        <tr key={member.id}>
                          <td>{member.name || '—'}</td>
                          <td>{member.info?.discordname || '—'}</td>
                          <td>{member.game?.gamename || '—'}</td>
                          <td>{member.game?.tier || 'Unranked'}</td>
                          <td>
                            {member.tier?.tktkTierName ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontWeight: 600 }}>{member.tier.tktkTierName}</span>
                                {member.tier.tktkTierLevelCode && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {getLevelCodeLabel(member.tier.tktkTierLevelCode)}
                                  </span>
                                )}
                              </div>
                            ) : '—'}
                          </td>
                          <td>
                            <span
                              className="right-badge-small"
                              style={{
                                color: statusBadge.color,
                                backgroundColor: statusBadge.bg
                              }}
                            >
                              {statusBadge.text}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-delete"
                              onClick={() => handleRemoveClan(member)}
                              title="해제"
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            >
                              🔓 해제
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!clanActionTarget}
        title={
          clanActionTarget?.action === 'reject' ? '클랜 가입 거절' :
          '클랜원 해제'
        }
        description={getClanActionMessage()}
        confirmLabel={
          clanActionTarget?.action === 'reject' ? '거절' :
          '해제'
        }
        onConfirm={confirmClanAction}
        onCancel={() => setClanActionTarget(null)}
      />

      {/* 클랜 승인 with 티어 선택 모달 */}
      {approveModalData && (
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
          onClick={() => setApproveModalData(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#1e293b'
            }}>
              클랜 가입 승인
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              marginBottom: '1.5rem'
            }}>
              "{approveModalData.member.name}" 님의 클랜 가입을 승인하고 티어를 배정합니다.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                TKTK 티어
              </label>
              <select
                value={approveModalData.tier}
                onChange={(e) => setApproveModalData({ ...approveModalData, tier: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#1e293b',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="1tier">1tier</option>
                <option value="2tier">2tier</option>
                <option value="3tier">3tier</option>
                <option value="4tier">4tier</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                티어 레벨
              </label>
              <select
                value={approveModalData.level}
                onChange={(e) => setApproveModalData({ ...approveModalData, level: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#1e293b',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="UPPER">상 (상위)</option>
                <option value="MID">중 (중위)</option>
                <option value="LOW">하 (하위)</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setApproveModalData(null)}
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
                onClick={confirmApproveWithTier}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                승인 및 티어 배정
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
