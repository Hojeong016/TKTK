import React from 'react';
import Layout from '../components/Layout';
import '../styles/blacklist.css';

export default function Blacklist() {
  const [activeTab, setActiveTab] = React.useState('blacklist'); // 'blacklist' or 'warning'

  // Mock 데이터 - 블랙리스트
  const blacklistMembers = [
    {
      id: 1,
      name: 'BadPlayer123',
      discordName: 'BadPlayer#1234',
      reason: '지속적인 팀킬 및 욕설',
      reportedDate: '2024-10-20'
    },
    {
      id: 2,
      name: 'ToxicUser',
      discordName: 'Toxic#5678',
      reason: '클랜 규칙 위반 (부정 행위)',
      reportedDate: '2024-10-18'
    },
    {
      id: 3,
      name: 'Cheater999',
      discordName: 'Cheater#9999',
      reason: '핵 사용 의심',
      reportedDate: '2024-10-15'
    },
    {
      id: 4,
      name: 'GrieferXX',
      discordName: 'Griefer#0000',
      reason: '트롤링 및 의도적 게임 방해',
      reportedDate: '2024-10-12'
    }
  ];

  // Mock 데이터 - 경고 멤버
  const warningMembers = [
    {
      id: 1,
      name: 'ShadowHunter',
      discordName: '치킨러버#1234',
      warningCount: 3,
      lastWarningDate: '2024-10-22',
      lastWarningReason: '과도한 욕설 사용'
    },
    {
      id: 2,
      name: 'DragonSlayer',
      discordName: '배그왕#5678',
      warningCount: 2,
      lastWarningDate: '2024-10-19',
      lastWarningReason: '팀 플레이 미흡'
    },
    {
      id: 3,
      name: 'NightRider',
      discordName: '헤드샷마스터#9012',
      warningCount: 1,
      lastWarningDate: '2024-10-16',
      lastWarningReason: '지각'
    },
    {
      id: 4,
      name: 'PhantomStrike',
      discordName: '생존왕#3456',
      warningCount: 2,
      lastWarningDate: '2024-10-14',
      lastWarningReason: '규칙 위반'
    },
    {
      id: 5,
      name: 'ThunderBolt',
      discordName: '킬러본능#7890',
      warningCount: 1,
      lastWarningDate: '2024-10-10',
      lastWarningReason: '무단 이탈'
    }
  ];

  return (
    <Layout>
      <div className="blacklist-page">
        <div className="blacklist-header">
          <h1 className="blacklist-title">Blacklist</h1>
          <p className="blacklist-subtitle">클랜 블랙리스트 조회</p>
        </div>

        {/* 통계 카드 */}
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

        {/* 탭 */}
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

        {/* 탭 콘텐츠 */}
        {activeTab === 'blacklist' && (
          <div className="blacklist-section tab-content">
          <div className="bl-section-header">
            <h2 className="bl-section-title">🚫 블랙리스트 목록</h2>
            <span className="bl-section-badge">{blacklistMembers.length}명</span>
          </div>

          <div className="blacklist-list">
            {blacklistMembers.map(member => (
              <div key={member.id} className="blacklist-card">
                <div className="blacklist-info">
                  <div className="blacklist-name">{member.name}</div>
                  <div className="blacklist-discord">{member.discordName}</div>
                  <div className="blacklist-reason">{member.reason}</div>
                </div>
                <div className="blacklist-date">
                  <div className="date-label">등록일</div>
                  <div className="date-value">
                    {new Date(member.reportedDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* 경고 멤버 목록 */}
        {activeTab === 'warning' && (
          <div className="blacklist-section warning-section tab-content">
          <div className="bl-section-header">
            <h2 className="bl-section-title">⚠️ 경고 멤버 목록</h2>
            <span className="bl-section-badge warning-badge">{warningMembers.length}명</span>
          </div>

          <div className="warning-list">
            {warningMembers.map(member => {
              // 경고 횟수에 따른 레벨 결정
              const warningLevel = member.warningCount >= 3 ? 'high' : member.warningCount === 2 ? 'medium' : 'low';

              return (
                <div key={member.id} className={`warning-card ${warningLevel}`}>
                  <div className="warning-info">
                    <div className="warning-header-row">
                      <div className="warning-name">{member.name}</div>
                      <div className="warning-count-inline">
                        경고 <span className="count-number-inline">{member.warningCount}</span>회
                      </div>
                    </div>
                    <div className="warning-discord">{member.discordName}</div>
                    <div className="warning-last-reason">{member.lastWarningReason}</div>
                  </div>
                  <div className="warning-date">
                    <div className="date-label">최근 경고일</div>
                    <div className="date-value">
                      {new Date(member.lastWarningDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
}
