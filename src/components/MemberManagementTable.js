import React from 'react';
import { useFetchItems, useUpdateItem, useDeleteItem } from '../api/useFetch';
import { getTierIcon } from '../constants/tiers';
import useStore from '../store/useStore';
import EditMemberModal from './EditMemberModal';
import { extractStreamingUrl } from '../utils/streamingUrl';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';
import memberService from '../api/memberService';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 티어 값을 서버 형식으로 변환 (프론트: "Ace" -> 서버: "ACE")
 */
const toServerTier = (tier) => {
  if (!tier) return '';
  return String(tier).toUpperCase();
};

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
 * MemberManagementTable - 관리자용 멤버 관리 테이블
 * 수정/삭제 기능 포함
 */
export default function MemberManagementTable({ version }) {
  const { data, isLoading, isError } = useFetchItems({ requireAuth: true, staleTime: 0, cacheTime: 0, version });
  const { rightsConfig } = useStore();
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [retryingId, setRetryingId] = React.useState(null);
  const { toast, showToast } = useToast();
  const queryClient = useQueryClient();

  // API Mutation 훅
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const handleEdit = (member) => {
    setEditingMember(member);
    setEditModalOpen(true);
  };

  React.useEffect(() => {
    setEditModalOpen(false);
    setEditingMember(null);
  }, [version]);

  const handleSave = (formData) => {
    if (!editingMember) return;

    // 수정된 데이터를 서버 DTO 형식으로 변환
    const updatedMemberData = {
      info: {
        discordname: formData.discordname,
        birthday: formData.birthday
      },
      discord: {
        right: formData.rights
      },
      game: {
        tier: toServerTier(formData.tier) // 프론트: "Ace" -> 서버: "ACE"
      },
      streaming: {
        soop: formData.soopUrl,
        chzzk: formData.chzzkUrl
      },
      memberofthestaff: {
        name: formData.staffName
      },
      tktkTier: formData.tktkTier || null
    };

    // API 호출
    updateMutation.mutate(
      { id: editingMember.id, data: updatedMemberData },
      {
        onSuccess: () => {
          showToast('success', '멤버 정보가 성공적으로 수정되었습니다.');
          setEditModalOpen(false);
          setEditingMember(null);
        },
        onError: (error) => {
          console.error('Failed to update member:', error);
          showToast('error', `멤버 정보 수정에 실패했습니다: ${error.message}`);
        },
      }
    );
  };

  const handleCloseEditModal = () => {
    if (!updateMutation.isPending) {
      setEditModalOpen(false);
      setEditingMember(null);
    }
  };

  const handleDelete = (member) => {
    setDeleteTarget(member);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('success', '멤버가 성공적으로 삭제되었습니다.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        console.error('Failed to delete member:', error);
        showToast('error', `멤버 삭제에 실패했습니다: ${error.message}`);
      },
    });
  };

  const handleRetry = async (member) => {
    const gameName = member.game?.gamename;
    if (!gameName) {
      showToast('error', '게임명이 없어 재시도할 수 없습니다.');
      return;
    }

    setRetryingId(member.id);
    try {
      // 관리자가 특정 멤버의 게임 정보를 재동기화
      await memberService.retryGameSyncForMember(member.id, gameName);
      showToast('success', '게임 정보 연동을 재시도합니다. 게임 이름을 다시 한번 확인해주세요');

      // 3초 후 데이터 새로고침
      setTimeout(() => {
        queryClient.invalidateQueries(['items']);
        setRetryingId(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to retry game sync:', error);
      showToast('error', `게임 정보 연동 재시도에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      setRetryingId(null);
    }
  };

  const getClanStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { text: '클랜원', color: '#10b981', bg: '#d1fae5' },
      PENDING: { text: '신청 중', color: '#f59e0b', bg: '#fef3c7' },
      NONE: { text: '미가입', color: '#6b7280', bg: '#f3f4f6' }
    };
    return statusConfig[status] || statusConfig.NONE;
  };

  return (
    <div className="management-table-container">
      {/* 새 멤버 추가 기능 주석처리 */}
      {/* <div className="table-controls">
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + 새 멤버 추가
        </button>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading data</div>
      ) : !data || data.length === 0 ? (
        <div>No members found</div>
      ) : (
        <div className="table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>작업</th>
              <th>Name</th>
              <th>Discord 닉네임</th>
              <th>생일</th>
              <th>권한</th>
              <th>게임명</th>
              <th>티어</th>
              <th>TKTK 티어</th>
              <th>클랜 상태</th>
              <th>Soop</th>
              <th>Chzzk</th>
              <th>담당 스태프</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => {
              const syncStatus = member.game?.syncStatus;
              const isSyncFailed = syncStatus === 'FAILED';
              const isSyncPending = syncStatus === 'PENDING';
              const isRequesting = syncStatus === 'REQUEST';
              const needsSync = isSyncFailed || isSyncPending;

              // 행 클래스 결정
              let rowClass = '';
              if (isSyncFailed) rowClass = 'sync-failed-row';
              else if (isSyncPending) rowClass = 'sync-pending-row';
              else if (isRequesting) rowClass = 'sync-requesting-row';

              return (
                <tr key={member.id} className={rowClass}>
                  {/* 작업 버튼 */}
                  <td className="action-cell">
                    <div className="action-buttons">
                      {(needsSync || isRequesting) && (
                        <button
                          className={
                            isRequesting
                              ? 'btn-retry btn-retry-requesting'
                              : isSyncFailed
                                ? 'btn-retry btn-retry-failed'
                                : 'btn-retry btn-retry-pending'
                          }
                          onClick={() => handleRetry(member)}
                          disabled={retryingId === member.id || isRequesting}
                          title={
                            isRequesting
                              ? '게임 정보 연동 중...\n잠시만 기다려주세요.'
                              : isSyncFailed
                                ? `게임 정보 연동 재시도${member.game?.failReason ? `\n실패 사유: ${member.game.failReason}` : ''}${member.game?.retryCount ? `\n재시도 횟수: ${member.game.retryCount}회` : ''}`
                                : '게임 정보 연동 시작\n아직 PUBG 계정과 연동되지 않았습니다.'
                          }
                        >
                          {isRequesting ? '⏳' : (retryingId === member.id ? '⏳' : (isSyncFailed ? '🔄' : '▶️'))}
                        </button>
                      )}
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(member)}
                        disabled={deleteMutation.isPending || retryingId === member.id || isRequesting}
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(member)}
                        disabled={deleteMutation.isPending || retryingId === member.id || isRequesting}
                        title="삭제"
                      >
                        {deleteMutation.isPending ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>

                  {/* Name */}
                  <td>
                    {member.name || '—'}
                  </td>

                  {/* Discord 닉네임 */}
                  <td>
                    {member.info?.discordname || '—'}
                  </td>

                  {/* 생일 */}
                  <td className="birthday-cell">
                    {member.info?.birthday || '—'}
                  </td>

                  {/* 권한 */}
                  <td>
                    <div className="rights-display">
                      {(() => {
                        const rightValue = member.discord?.right || [];
                        const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
                        return rights.map((rightKey, idx) => {
                          const config = rightsConfig.find(rc => rc.key === rightKey);
                          if (!config) return null;
                          return (
                            <span
                              key={idx}
                              className="right-badge-small"
                              style={{
                                color: config.color,
                                backgroundColor: config.bgColor
                              }}
                            >
                              {config.label}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </td>

                  {/* 게임명 */}
                  <td>
                    {member.game?.gamename || '—'}
                  </td>

                  {/* 티어 */}
                  <td>
                    <div className="tier-cell">
                      {getTierIcon(member.game?.tier, { className: 'tier-icon-tiny' })}
                      <span>{member.game?.tier || 'Unranked'}</span>
                    </div>
                  </td>

                  {/* TKTK 티어 */}
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

                  {/* 클랜 상태 */}
                  <td>
                    {(() => {
                      const clanStatus = member.clanJoinStatus || 'NONE';
                      const statusBadge = getClanStatusBadge(clanStatus);

                      return (
                        <span
                          className="right-badge-small"
                          style={{
                            color: statusBadge.color,
                            backgroundColor: statusBadge.bg
                          }}
                        >
                          {statusBadge.text}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Soop URL */}
                  <td className="url-cell">
                    {(() => {
                      const soopUrl = extractStreamingUrl(member.streaming?.soop);
                      return soopUrl ? (
                        <a href={soopUrl} target="_blank" rel="noreferrer" className="url-link" title={soopUrl}>
                          링크
                        </a>
                      ) : '—';
                    })()}
                  </td>

                  {/* Chzzk URL */}
                  <td className="url-cell">
                    {(() => {
                      const chzzkUrl = extractStreamingUrl(member.streaming?.chzzk);
                      return chzzkUrl ? (
                        <a href={chzzkUrl} target="_blank" rel="noreferrer" className="url-link" title={chzzkUrl}>
                          링크
                        </a>
                      ) : '—';
                    })()}
                  </td>

                  {/* 담당 스태프 */}
                  <td>
                    {member.memberofthestaff?.name || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <EditMemberModal
        open={editModalOpen}
        member={editingMember}
        onClose={handleCloseEditModal}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="멤버 삭제"
        description={`"${deleteTarget?.name || '해당 멤버'}" 멤버를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
