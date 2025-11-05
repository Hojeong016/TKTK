import React from 'react';
import { useFetchItems, useUpdateItem, useDeleteItem } from '../api/useFetch';
import { getTierIcon } from '../constants/tiers';
import useStore from '../store/useStore';
import AddMemberModal from './AddMemberModal';

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

  // API Mutation 훅
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const handleEdit = (member) => {
    setEditingId(member.id);
    const rightValue = member.discord?.right || [];
    const rights = Array.isArray(rightValue) ? rightValue : [rightValue];

    setEditData({
      name: member.name || '',
      koreaname: member.info?.koreaname || '',
      discordname: member.info?.discordname || '',
      gamename: member.game?.gamename || member.info?.gamename || '',
      tier: member.game?.tier || '',
      rights: rights,
      birthday: member.info?.birthday || '',
      soopUrl: member.streaming?.soop || '',
      chzzkUrl: member.streaming?.chzzk || ''
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
    // 원본 멤버 데이터 찾기
    const originalMember = data.find(m => m.id === memberId);

    // 수정된 데이터를 서버 DTO 형식으로 변환
    const updatedMemberData = {
      name: editData.name,
      info: {
        discordname: editData.discordname,
        gamename: editData.gamename,
        koreaname: editData.koreaname,
        birthday: editData.birthday,
        description: originalMember?.info?.description || ''
      },
      discord: {
        right: editData.rights,
        discordTierId: originalMember?.discord?.discordTierId || null,
        join: originalMember?.discord?.join || new Date().toISOString()
      },
      game: {
        tier: editData.tier,
        gamename: editData.gamename
      },
      streaming: {
        soop: editData.soopUrl,
        chzzk: editData.chzzkUrl
      },
      memberofthestaff: {
        name: originalMember?.memberofthestaff?.name || ''
      }
    };

    // API 호출
    updateMutation.mutate(
      { id: memberId, data: updatedMemberData },
      {
        onSuccess: () => {
          alert('멤버 정보가 성공적으로 수정되었습니다.');
          setEditingId(null);
          setEditData({});
        },
        onError: (error) => {
          console.error('Failed to update member:', error);
          alert('멤버 정보 수정에 실패했습니다: ' + error.message);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (member) => {
    if (window.confirm(`정말로 "${member.name}" 멤버를 삭제하시겠습니까?`)) {
      deleteMutation.mutate(member.id, {
        onSuccess: () => {
          alert('멤버가 성공적으로 삭제되었습니다.');
        },
        onError: (error) => {
          console.error('Failed to delete member:', error);
          alert('멤버 삭제에 실패했습니다: ' + error.message);
        },
      });
    }
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
              <th>ID</th>
              <th>Discord 닉네임</th>
              <th>한글명</th>
              <th>게임명</th>
              <th>티어</th>
              <th>권한</th>
              <th>생일</th>
              <th>Soop</th>
              <th>Chzzk</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => {
              const isEditing = editingId === member.id;

              return (
                <tr key={member.id} className={isEditing ? 'editing-row' : ''}>
                  <td>{member.id}</td>

                  {/* Discord 닉네임 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.discordname}
                        onChange={(e) => handleInputChange('discordname', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.info?.discordname || '—'
                    )}
                  </td>

                  {/* 한글명 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.koreaname}
                        onChange={(e) => handleInputChange('koreaname', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.info?.koreaname || '—'
                    )}
                  </td>

                  {/* 게임명 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.gamename}
                        onChange={(e) => handleInputChange('gamename', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.game?.gamename || member.info?.gamename || '—'
                    )}
                  </td>

                  {/* 티어 */}
                  <td>
                    {isEditing ? (
                      <select
                        value={editData.tier}
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

                  {/* 생일 */}
                  <td className="birthday-cell">
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.birthday}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.info?.birthday || '—'
                    )}
                  </td>

                  {/* Soop URL */}
                  <td className="url-cell">
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.soopUrl}
                        onChange={(e) => handleInputChange('soopUrl', e.target.value)}
                        className="table-input table-input-url"
                        placeholder="URL"
                      />
                    ) : (
                      member.streaming?.soop ? (
                        <a href={member.streaming.soop} target="_blank" rel="noreferrer" className="url-link" title={member.streaming.soop}>
                          링크
                        </a>
                      ) : '—'
                    )}
                  </td>

                  {/* Chzzk URL */}
                  <td className="url-cell">
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.chzzkUrl}
                        onChange={(e) => handleInputChange('chzzkUrl', e.target.value)}
                        className="table-input table-input-url"
                        placeholder="URL"
                      />
                    ) : (
                      member.streaming?.chzzk ? (
                        <a href={member.streaming.chzzk} target="_blank" rel="noreferrer" className="url-link" title={member.streaming.chzzk}>
                          링크
                        </a>
                      ) : '—'
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
    </div>
  );
}
