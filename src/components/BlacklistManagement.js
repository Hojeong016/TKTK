import React from 'react';
import { useFetchItems } from '../api/useFetch';

/**
 * BlacklistManagement - 블랙리스트 및 경고 관리
 */
export default function BlacklistManagement() {
  const { data: members, isLoading, isError } = useFetchItems();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Mock 데이터 - 블랙리스트 상태 (실제로는 서버에서 가져와야 함)
  const [blacklistStatus, setBlacklistStatus] = React.useState({
    1: { isBlacklisted: false, warningCount: 0 },
    2: { isBlacklisted: false, warningCount: 2 },
    3: { isBlacklisted: false, warningCount: 1 },
    4: { isBlacklisted: true, warningCount: 3 },
    5: { isBlacklisted: false, warningCount: 0 },
    6: { isBlacklisted: false, warningCount: 1 },
  });

  const handleAddToBlacklist = (memberId, memberName) => {
    if (window.confirm(`"${memberName}"을(를) 블랙리스트에 등록하시겠습니까?`)) {
      setBlacklistStatus(prev => ({
        ...prev,
        [memberId]: { ...prev[memberId], isBlacklisted: true }
      }));
      alert('블랙리스트에 등록되었습니다.');
    }
  };

  const handleRemoveFromBlacklist = (memberId, memberName) => {
    if (window.confirm(`"${memberName}"을(를) 블랙리스트에서 해제하시겠습니까?`)) {
      setBlacklistStatus(prev => ({
        ...prev,
        [memberId]: { ...prev[memberId], isBlacklisted: false }
      }));
      alert('블랙리스트에서 해제되었습니다.');
    }
  };

  const handleAddWarning = (memberId, memberName) => {
    if (window.confirm(`"${memberName}"에게 경고를 부여하시겠습니까?`)) {
      setBlacklistStatus(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          warningCount: (prev[memberId]?.warningCount || 0) + 1
        }
      }));
      alert('경고가 부여되었습니다.');
    }
  };

  const handleRemoveWarning = (memberId, memberName) => {
    const currentWarnings = blacklistStatus[memberId]?.warningCount || 0;
    if (currentWarnings === 0) {
      alert('경고 내역이 없습니다.');
      return;
    }
    if (window.confirm(`"${memberName}"의 경고를 1회 차감하시겠습니까?`)) {
      setBlacklistStatus(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          warningCount: Math.max(0, (prev[memberId]?.warningCount || 0) - 1)
        }
      }));
      alert('경고가 차감되었습니다.');
    }
  };

  // 검색 필터링
  const filteredMembers = React.useMemo(() => {
    if (!members || !Array.isArray(members)) return [];
    if (!searchTerm) return members;

    const term = searchTerm.toLowerCase();
    return members.filter(m =>
      m.name?.toLowerCase().includes(term) ||
      m.info?.discordname?.toLowerCase().includes(term) ||
      m.info?.koreaname?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  if (isLoading) return <div className="management-table-container">Loading...</div>;
  if (isError) return <div className="management-table-container">Error loading data</div>;
  if (!members || members.length === 0) return <div className="management-table-container">No members found</div>;

  return (
    <div className="management-table-container">
      <div className="table-controls">
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>블랙리스트 관리</h3>
        <input
          type="text"
          className="search-input"
          placeholder="멤버 검색 (이름, Discord 닉네임)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '300px'
          }}
        />
      </div>

      <div className="table-wrapper" style={{ marginTop: '20px' }}>
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Discord 닉네임</th>
              <th>한글명</th>
              <th>게임명</th>
              <th style={{ textAlign: 'center' }}>경고 횟수</th>
              <th style={{ textAlign: 'center' }}>블랙리스트</th>
              <th style={{ width: '300px' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const status = blacklistStatus[member.id] || { isBlacklisted: false, warningCount: 0 };

              return (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.info?.discordname || '—'}</td>
                  <td>{member.info?.koreaname || '—'}</td>
                  <td>{member.game?.gamename || member.info?.gamename || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="warning-count-display"
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        background: status.warningCount >= 3 ? '#fecaca' :
                                   status.warningCount >= 2 ? '#fed7aa' :
                                   status.warningCount >= 1 ? '#fef3c7' : '#f3f4f6',
                        color: status.warningCount >= 3 ? '#dc2626' :
                               status.warningCount >= 2 ? '#ea580c' :
                               status.warningCount >= 1 ? '#d97706' : '#6b7280'
                      }}
                    >
                      {status.warningCount}회
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {status.isBlacklisted ? (
                      <span
                        className="blacklist-badge"
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: '#fecaca',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        🚫 등록됨
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      {status.isBlacklisted ? (
                        <button
                          className="btn-save"
                          onClick={() => handleRemoveFromBlacklist(member.id, member.name)}
                        >
                          해제
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-delete"
                            onClick={() => handleAddToBlacklist(member.id, member.name)}
                          >
                            등록
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleAddWarning(member.id, member.name)}
                          >
                            경고
                          </button>
                          {status.warningCount > 0 && (
                            <button
                              className="btn-cancel"
                              onClick={() => handleRemoveWarning(member.id, member.name)}
                            >
                              차감
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
