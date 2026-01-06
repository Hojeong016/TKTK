import React from 'react';
import Layout from '../components/Layout';
import '../styles/blacklist.css';
import { useFetchBlacklist } from '../api/useBlacklist';

export default function Blacklist() {
  const [activeTab, setActiveTab] = React.useState('blacklist');
  const { data, isLoading, isError, error } = useFetchBlacklist();

  const entries = Array.isArray(data) ? data : [];
  const blacklistMembers = entries.filter(entry => entry.status === 'BLACKLISTED');
  const warningMembers = entries
    .filter(entry => entry.status === 'WARNED' || entry.warningCount > 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="blacklist-page">
          <div className="blacklist-loading">블랙리스트 정보를 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="blacklist-page">
          <div className="blacklist-error">
            데이터를 불러오지 못했습니다: {error?.message || '알 수 없는 오류'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="blacklist-page">
        <div className="blacklist-header">
          <h1 className="blacklist-title">Blacklist</h1>
          <p className="blacklist-subtitle">클랜 블랙리스트 조회</p>
        </div>

        <div className="bl-stats-grid">
          <div className="bl-stat-card">
            <div className="bl-stat-icon">🚫</div>
            <div className="bl-stat-value">{blacklistMembers.length}</div>
            <div className="bl-stat-label">블랙리스트 멤버</div>
            <div className="bl-stat-sublabel">총 등록 인원</div>
          </div>
          <div className="bl-stat-card bl-warning-card">
            <div className="bl-stat-icon">⚠️</div>
            <div className="bl-stat-value">{warningMembers.length}</div>
            <div className="bl-stat-label">경고 멤버</div>
            <div className="bl-stat-sublabel">누적 경고 보유자</div>
          </div>
        </div>

        <div className="blacklist-tabs">
          <button
            className={`blacklist-tab ${activeTab === 'blacklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('blacklist')}
          >
            🚫 블랙리스트
          </button>
          <button
            className={`blacklist-tab ${activeTab === 'warning' ? 'active' : ''}`}
            onClick={() => setActiveTab('warning')}
          >
            ⚠️ 경고 멤버
          </button>
        </div>

        {activeTab === 'blacklist' && (
          <div className="blacklist-section tab-content">
            <div className="bl-section-header">
              <h2 className="bl-section-title">🚫 블랙리스트 목록</h2>
              <span className="bl-section-badge">{blacklistMembers.length}명</span>
            </div>

            {blacklistMembers.length === 0 ? (
              <div className="blacklist-empty-state">등록된 블랙리스트가 없습니다.</div>
            ) : (
              <div className="blacklist-list">
                {blacklistMembers.map(member => (
                  <div key={member.id} className="blacklist-card">
                    <div className="blacklist-info">
                      <div className="blacklist-name">{member.memberName}</div>
                      <div className="blacklist-discord">{member.discordName}</div>
                      <div className="blacklist-reason">{member.reason || '사유 미상'}</div>
                    </div>
                    <div className="blacklist-date">
                      <div className="date-label">등록일</div>
                      <div className="date-value">
                        {member.registeredAt
                          ? new Date(member.registeredAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : '미기록'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 경고 멤버 목록 */}
        {activeTab === 'warning' && (
          <div className="blacklist-section warning-section tab-content">
            <div className="bl-section-header">
              <h2 className="bl-section-title">⚠️ 경고 멤버 목록</h2>
              <span className="bl-section-badge warning-badge">{warningMembers.length}명</span>
            </div>

            {warningMembers.length === 0 ? (
              <div className="blacklist-empty-state">경고된 멤버가 없습니다.</div>
            ) : (
              <div className="warning-list">
                {warningMembers.map(member => {
                  const warningLevel = member.warningCount >= 3
                    ? 'high'
                    : member.warningCount === 2
                      ? 'medium'
                      : 'low';

                  return (
                    <div key={member.id} className={`warning-card ${warningLevel}`}>
                      <div className="warning-info">
                        <div className="warning-header-row">
                          <div className="warning-name">{member.memberName || member.name}</div>
                          <div className="warning-count-inline">
                            경고 <span className="count-number-inline">{member.warningCount}</span>회
                          </div>
                        </div>
                        <div className="warning-discord">{member.discordName}</div>
                      </div>
                      <div className="warning-date">
                        <div className="date-label">최근 업데이트</div>
                        <div className="date-value">
                          {member.updatedAt
                            ? new Date(member.updatedAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '미기록'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
