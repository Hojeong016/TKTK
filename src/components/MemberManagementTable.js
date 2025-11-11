import React from 'react';
import { useFetchItems, useUpdateItem, useDeleteItem } from '../api/useFetch';
import { getTierIcon } from '../constants/tiers';
import useStore from '../store/useStore';
import AddMemberModal from './AddMemberModal';
import { extractStreamingUrl } from '../utils/streamingUrl';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';

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
 * MemberManagementTable - 관리자용 멤버 관리 테이블
 * 수정/삭제 기능 포함
 */
export default function MemberManagementTable() {
  const { data, isLoading, isError } = useFetchItems();
  const { rightsConfig } = useStore();
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const { toast, showToast } = useToast();

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
      name: member.name || '',
      discordname: member.info?.discordname || '',
      birthday: birthdayValue,
      rights: rights,
      gamename: member.game?.gamename || '',
      tier: normalizedTier,
      soopUrl: soopUrl,
      chzzkUrl: chzzkUrl,
      staffName: member.memberofthestaff?.name || ''
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
    // 수정된 데이터를 서버 DTO 형식으로 변환
    const updatedMemberData = {
      id: memberId,
      name: editData.name,
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
      }
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

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="management-table-container">
      <div className="table-controls">
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + 새 멤버 추가
        </button>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

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
              <th>Name</th>
              <th>Discord 닉네임</th>
              <th>생일</th>
              <th>권한</th>
              <th>게임명</th>
              <th>티어</th>
              <th>Soop</th>
              <th>Chzzk</th>
              <th>담당 스태프</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => {
              const isEditing = editingId === member.id;

              return (
                <tr key={member.id} className={isEditing ? 'editing-row' : ''}>
                  {/* Name */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.name || '—'
                    )}
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
                        <option value="Free">Free</option>
                      </select>
                    ) : (
                      <div className="tier-cell">
                        {getTierIcon(member.game?.tier, { className: 'tier-icon-tiny' })}
                        <span>{member.game?.tier || 'Free'}</span>
                      </div>
                    )}
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

                  {/* 작업 버튼 */}
                  <td className="action-cell">
                    {isEditing ? (
                      <div className="action-buttons">
                        <button
                          className="btn-save"
                          onClick={() => handleSave(member.id)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? '저장 중...' : '저장'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(member)}
                          disabled={deleteMutation.isPending}
                        >
                          수정
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(member)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
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
