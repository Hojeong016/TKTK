import React from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { useFetchItems } from '../api/useFetch';
import '../styles/tier.css';

export default function Tier() {
  const { data, isLoading } = useFetchItems();
  const [selectedTier, setSelectedTier] = React.useState(1); // 초기값을 1로 설정
  const [teamScores, setTeamScores] = React.useState(null);

  // 팀 점수 데이터 로드
  React.useEffect(() => {
    fetch('/data/team_scores.json')
      .then(res => res.json())
      .then(data => setTeamScores(data))
      .catch(err => console.error('Failed to load team scores:', err));
  }, []);

  // 티어별 멤버 수 계산 (discord.right 기준)
  const tierStats = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        tier1: 0,
        tier2: 0,
        tier3: 0,
        tier4: 0
      };
    }

    const tier1 = data.filter(m => {
      const rights = Array.isArray(m.discord?.right) ? m.discord.right : [m.discord?.right];
      return rights.includes('1tier');
    }).length;

    const tier2 = data.filter(m => {
      const rights = Array.isArray(m.discord?.right) ? m.discord.right : [m.discord?.right];
      return rights.includes('2tier');
    }).length;

    const tier3 = data.filter(m => {
      const rights = Array.isArray(m.discord?.right) ? m.discord.right : [m.discord?.right];
      return rights.includes('3tier');
    }).length;

    const tier4 = data.filter(m => {
      const rights = Array.isArray(m.discord?.right) ? m.discord.right : [m.discord?.right];
      return rights.includes('4tier');
    }).length;

    return {
      tier1,
      tier2,
      tier3,
      tier4
    };
  }, [data]);

  // 선택된 티어의 멤버들을 레벨별로 분류
  const getTierMembers = (tierNumber) => {
    if (!data || !Array.isArray(data)) return { 상: [], 중: [], 하: [] };

    const members = data.filter(m => {
      const rights = Array.isArray(m.discord?.right) ? m.discord.right : [m.discord?.right];
      return rights.includes(`${tierNumber}tier`);
    });

    const grouped = {
      상: members.filter(m => m.game?.level === '상'),
      중: members.filter(m => m.game?.level === '중'),
      하: members.filter(m => m.game?.level === '하')
    };

    return grouped;
  };

  const handleTierClick = (tierNumber) => {
    setSelectedTier(selectedTier === tierNumber ? null : tierNumber);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="tier-page">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  const tierMembers = selectedTier ? getTierMembers(selectedTier) : null;

  const levelConfig = {
    '상': {
      className: 'level-upper',
      icon: '👑'
    },
    '중': {
      className: 'level-middle',
      icon: '⭐'
    },
    '하': {
      className: 'level-lower',
      icon: '💎'
    }
  };

  return (
    <Layout>
      <div className="tier-page">
        <div className="tier-header">
          <h1 className="tier-title">TKTK CLAN TIER</h1>
          <p className="tier-subtitle">TKTK 멤버 티어</p>
        </div>

        {/* 안내 문구 */}
        <div className="tier-instruction">
          💡 각 카드를 클릭해서 티어의 상세 정보를 확인하세요
        </div>

        {/* 티어별 카드 그리드 */}
        <div className="tier-cards-grid">
          <div className="tier-card-wrapper" onClick={() => handleTierClick(1)}>
            <StatsCard
              title="1 TIER"
              value={tierStats.tier1}
              icon="⭐️"
            />
          </div>
          <div className="tier-card-wrapper" onClick={() => handleTierClick(2)}>
            <StatsCard
              title="2 TIER"
              value={tierStats.tier2}
              icon="⭐️⭐️"
            />
          </div>
          <div className="tier-card-wrapper" onClick={() => handleTierClick(3)}>
            <StatsCard
              title="3 TIER"
              value={tierStats.tier3}
              icon="⭐️⭐️⭐️"
            />
          </div>
          <div className="tier-card-wrapper" onClick={() => handleTierClick(4)}>
            <StatsCard
              title="4 TIER"
              value={tierStats.tier4}
              icon="⭐️⭐️⭐️⭐️"
            />
          </div>
        </div>

        {/* 선택된 티어의 멤버 목록 */}
        {selectedTier && tierMembers && (
          <div className="tier-members-section">
            <div className="tier-members-header">
              <span>{selectedTier} TIER Member</span>
              <span className="tier-members-count">
                총 {tierMembers['상'].length + tierMembers['중'].length + tierMembers['하'].length}명
              </span>
            </div>

            <div className="level-cards-grid">
              {['상', '중', '하'].map((level) => (
                <div key={level} className="level-card">
                  {/* 헤더 */}
                  <div className={`level-card-header ${levelConfig[level].className}`}>
                    <div className="level-card-title-group">
                      <span className="level-card-icon">{levelConfig[level].icon}</span>
                      <span className="level-card-title">{level}</span>
                    </div>
                    <span className="level-card-badge">
                      {tierMembers[level].length}
                    </span>
                  </div>

                  {/* 팀 대표 점수 */}
                  {teamScores && teamScores[`${selectedTier}tier`]?.[level] && (
                    <div className="team-stats">
                      <div className="team-stat-item">
                        <span className="team-stat-icon">🎯</span>
                        <span className="team-stat-label">킬내기</span>
                        <span className="team-stat-value">{teamScores[`${selectedTier}tier`][level]['킬내기']}</span>
                      </div>
                      <div className="team-stat-item">
                        <span className="team-stat-icon">⚔️</span>
                        <span className="team-stat-label">딜내기</span>
                        <span className="team-stat-value">{teamScores[`${selectedTier}tier`][level]['딜내기']}</span>
                      </div>
                      <div className="team-stat-item">
                        <span className="team-stat-icon">🏆</span>
                        <span className="team-stat-label">킬딜내기</span>
                        <span className="team-stat-value">{teamScores[`${selectedTier}tier`][level]['킬딜내기']}</span>
                      </div>
                    </div>
                  )}

                  {/* 멤버 리스트 */}
                  <div className="level-card-body">
                    {tierMembers[level].length > 0 ? (
                      <div className="level-members-list">
                        {tierMembers[level].map(member => (
                          <div
                            key={member.id}
                            className={`level-member-item ${levelConfig[level].className}`}
                          >
                            {member.info?.discordname || member.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="level-empty-state">
                        멤버가 없습니다
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
