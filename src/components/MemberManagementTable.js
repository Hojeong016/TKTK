import React from 'react';
import { useFetchItems, useUpdateItem, useDeleteItem } from '../api/useFetch';
import { getTierIcon } from '../constants/tiers';
import useStore from '../store/useStore';
import AddMemberModal from './AddMemberModal';
import { extractStreamingUrl } from '../utils/streamingUrl';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';
import memberService from '../api/memberService';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 티어 값 정규화 (서버: "ACE" -> 프론트: "Ace")
 */
const normalizeTier = (tier) => {
  if (!tier) return '';
  const tierStr = String(tier);
  return tierStr.charAt(0).toUpperCase() + tierStr.slice(1).toLowerCase();
};

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
export default function MemberManagementTable() {
  const { data, isLoading, isError } = useFetchItems({ requireAuth: true });
  const { rightsConfig } = useStore();
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [retryingId, setRetryingId] = React.useState(null);
  const { toast, showToast } = useToast();
  const queryClient = useQueryClient();

  // API Mutation 훅
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const handleEdit = (member) => {
    setEditingId(member.id);
    const rightValue = member.discord?.right || [];
    const rights = Array.isArray(rightValue) ? rightValue : [rightValue];

    // birthday 날짜 형식 변환 (ISO 형식이면 YYYY-MM-DD만 추출)
    let birthdayValue = member.info?.birthday || '';
    if (birthdayValue && birthdayValue.includes('T')) {
      birthdayValue = birthdayValue.split('T')[0];
    }

    // StreamingUrl 객체에서 URL 문자열 추출
    const soopUrl = extractStreamingUrl(member.streaming?.soop);
    const chzzkUrl = extractStreamingUrl(member.streaming?.chzzk);

    // 티어 값 정규화 (서버: "ACE" -> 프론트: "Ace")
    const normalizedTier = normalizeTier(member.game?.tier);

    setEditData({
      discordname: member.info?.discordname || '',
      birthday: birthdayValue,
      rights: rights,
      gamename: member.game?.gamename || '',
      tier: normalizedTier,
      soopUrl: soopUrl,
      chzzkUrl: chzzkUrl,
      staffName: member.memberofthestaff?.name || '',
      tktkTier: member.tktkTier || ''
    });

    // 디버깅을 위한 로그
    console.log('Editing member:', {
      id: member.id,
      name: member.name,
      rawTier: member.game?.tier,
      normalizedTier: normalizedTier,
      rights: rights,
      birthday: birthdayValue
    });
  };

  const handleRightToggle = (rightValue) => {
    setEditData(prev => {
      const currentRights = prev.rights || [];
      const newRights = currentRights.includes(rightValue)
        ? currentRights.filter(r => r !== rightValue)
        : [...currentRights, rightValue];
      return { ...prev, rights: newRights };
    });
  };

  const handleSave = (memberId) => {
    // 기존 멤버 데이터 찾기
    const currentMember = data.find(m => m.id === memberId);

    // 수정된 데이터를 서버 DTO 형식으로 변환
    const updatedMemberData = {
      name: currentMember?.name, // 기존 name 값 유지
      info: {
        discordname: editData.discordname,
        birthday: editData.birthday
      },
      discord: {
        right: editData.rights
      },
      game: {
        tier: toServerTier(editData.tier), // 프론트: "Ace" -> 서버: "ACE"
        gamename: editData.gamename
      },
      streaming: {
        soop: editData.soopUrl,
        chzzk: editData.chzzkUrl
      },
      memberofthestaff: {
        name: editData.staffName
      },
      tktkTier: editData.tktkTier || null
    };

    // API 호출
    updateMutation.mutate(
      { id: memberId, data: updatedMemberData },
      {
        onSuccess: () => {
          showToast('success', '멤버 정보가 성공적으로 수정되었습니다.');
          setEditingId(null);
          setEditData({});
        },
        onError: (error) => {
          console.error('Failed to update member:', error);
          showToast('error', `멤버 정보 수정에 실패했습니다: ${error.message}`);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
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
      await memberService.retryGameSync(gameName);
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

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
              const isEditing = editingId === member.id;
              const syncStatus = member.game?.syncStatus;
              const isSyncFailed = syncStatus === 'FAILED';
              const isSyncPending = syncStatus === 'PENDING';
              const isRequesting = syncStatus === 'REQUEST';
              const needsSync = isSyncFailed || isSyncPending;

              // 행 클래스 결정
              let rowClass = '';
              if (isEditing) rowClass = 'editing-row';
              else if (isSyncFailed) rowClass = 'sync-failed-row';
              else if (isSyncPending) rowClass = 'sync-pending-row';
              else if (isRequesting) rowClass = 'sync-requesting-row';

              return (
                <tr key={member.id} className={rowClass}>
                  {/* 작업 버튼 */}
                  <td className="action-cell">
                    {isEditing ? (
                      <div className="action-buttons">
                        <button
                          className="btn-save"
                          onClick={() => handleSave(member.id)}
                          disabled={updateMutation.isPending}
                          title="저장"
                        >
                          {updateMutation.isPending ? '⏳' : '✅'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                          title="취소"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </td>

                  {/* Name */}
                  <td>
                    {member.name || '—'}
                  </td>

                  {/* Discord 닉네임 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.discordname || ''}
                        onChange={(e) => handleInputChange('discordname', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.info?.discordname || '—'
                    )}
                  </td>

                  {/* 생일 */}
                  <td className="birthday-cell">
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.birthday || ''}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.info?.birthday || '—'
                    )}
                  </td>

                  {/* 권한 */}
                  <td>
                    {isEditing ? (
                      <div className="rights-checkboxes">
                        {rightsConfig.map(rightOpt => (
                          <label key={rightOpt.key} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={(editData.rights || []).includes(rightOpt.key)}
                              onChange={() => handleRightToggle(rightOpt.key)}
                            />
                            <span>{rightOpt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
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
                    )}
                  </td>

                  {/* 게임명 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.gamename || ''}
                        onChange={(e) => handleInputChange('gamename', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.game?.gamename || '—'
                    )}
                  </td>

                  {/* 티어 */}
                  <td>
                    {isEditing ? (
                      <select
                        value={editData.tier || ''}
                        onChange={(e) => handleInputChange('tier', e.target.value)}
                        className="table-select"
                      >
                        <option value="">선택</option>
                        <option value="Conqueror">Conqueror</option>
                        <option value="Master">Master</option>
                        <option value="Ace">Ace</option>
                        <option value="Crown">Crown</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Unranked">Unranked</option>
                      </select>
                    ) : (
                      <div className="tier-cell">
                        {getTierIcon(member.game?.tier, { className: 'tier-icon-tiny' })}
                        <span>{member.game?.tier || 'Unranked'}</span>
                      </div>
                    )}
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
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.soopUrl || ''}
                        onChange={(e) => handleInputChange('soopUrl', e.target.value)}
                        className="table-input table-input-url"
                        placeholder="URL"
                      />
                    ) : (
                      (() => {
                        const soopUrl = extractStreamingUrl(member.streaming?.soop);
                        return soopUrl ? (
                          <a href={soopUrl} target="_blank" rel="noreferrer" className="url-link" title={soopUrl}>
                            링크
                          </a>
                        ) : '—';
                      })()
                    )}
                  </td>

                  {/* Chzzk URL */}
                  <td className="url-cell">
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.chzzkUrl || ''}
                        onChange={(e) => handleInputChange('chzzkUrl', e.target.value)}
                        className="table-input table-input-url"
                        placeholder="URL"
                      />
                    ) : (
                      (() => {
                        const chzzkUrl = extractStreamingUrl(member.streaming?.chzzk);
                        return chzzkUrl ? (
                          <a href={chzzkUrl} target="_blank" rel="noreferrer" className="url-link" title={chzzkUrl}>
                            링크
                          </a>
                        ) : '—';
                      })()
                    )}
                  </td>

                  {/* 담당 스태프 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.staffName || ''}
                        onChange={(e) => handleInputChange('staffName', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.memberofthestaff?.name || '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
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
