import React from 'react';
import { useFetchItems } from '../api/useFetch';
import { getTierIcon } from '../constants/tiers';
import { getRightLabel } from '../constants/rights';
import AddMemberModal from './AddMemberModal';

/**
 * MemberManagementTable - 관리자용 멤버 관리 테이블
 * 수정/삭제 기능 포함
 */
export default function MemberManagementTable() {
  const { data, isLoading, isError } = useFetchItems();
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
    // TODO: API 호출로 데이터 저장
    console.log('Saving member:', memberId, editData);
    alert('저장 기능은 API 연동 후 구현됩니다.');
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (member) => {
    if (window.confirm(`정말로 "${member.name}" 멤버를 삭제하시겠습니까?`)) {
      // TODO: API 호출로 데이터 삭제
      console.log('Deleting member:', member.id);
      alert('삭제 기능은 API 연동 후 구현됩니다.');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) return <div className="management-table-container">Loading...</div>;
  if (isError) return <div className="management-table-container">Error loading data</div>;
  if (!data || data.length === 0) return <div className="management-table-container">No members found</div>;

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

      <div className="table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>한글명</th>
              <th>디스코드</th>
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

                  {/* 이름 */}
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      member.name
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

                  {/* 디스코드 */}
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
                        {['master', 'streamer', '3tier'].map(rightOpt => (
                          <label key={rightOpt} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={(editData.rights || []).includes(rightOpt)}
                              onChange={() => handleRightToggle(rightOpt)}
                            />
                            <span>{getRightLabel(rightOpt)}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="rights-display">
                        {(() => {
                          const rightValue = member.discord?.right || [];
                          const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
                          return rights.map((r, idx) => (
                            <span key={idx} className="right-badge-small">
                              {getRightLabel(r) || r}
                            </span>
                          ));
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
                        >
                          저장
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancel}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(member)}
                        >
                          수정
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(member)}
                        >
                          삭제
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
    </div>
  );
}
