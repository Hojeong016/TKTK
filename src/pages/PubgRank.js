import React from 'react';
import Layout from '../components/Layout';
import { TIERS, getTierIcon } from '../constants/tiers';
import '../styles/pubg-rank.css';

// 가상 유저 이름 생성 함수
const generateMockPlayers = (tier, count = 10) => {
  const names = [
    'ShadowHunter', 'DragonSlayer', 'NightRider', 'PhantomStrike', 'ThunderBolt',
    'IronFist', 'SwiftArrow', 'DarkPhoenix', 'SilentKiller', 'RapidFire',
    'BlazingGun', 'FrozenBlade', 'StormBreaker', 'CrimsonEdge', 'GoldenEagle',
    'SteelWolf', 'MysticWarrior', 'VenomSnake', 'TitanForce', 'CosmicRider'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${tier}-${i}`,
    rank: i + 1,
    prevRank: i + 1,
    name: names[i] || `Player${i + 1}`,
    tier: tier,
    wins: Math.floor(Math.random() * 30) + 10,
    kills: Math.floor(Math.random() * 150) + 50,
    kd: (Math.random() * 3 + 1.5).toFixed(1),
    winRate: Math.floor(Math.random() * 40) + 20,
    score: Math.floor(Math.random() * 1000) + 500,
    rankChange: 0 // 초기값
  }));
};

export default function PubgRank() {
  const [selectedTier, setSelectedTier] = React.useState('all');
  const [players, setPlayers] = React.useState([]);

  // PUBG 티어 목록
  const tierList = [
    { key: 'all', label: '전체' },
    ...Object.values(TIERS)
  ];

  // 티어별 데이터 생성
  const topPlayersByTier = React.useMemo(() => ({
    all: generateMockPlayers('Mixed', 10),
    bronze: generateMockPlayers('Bronze', 10),
    silver: generateMockPlayers('Silver', 10),
    gold: generateMockPlayers('Gold', 10),
    platinum: generateMockPlayers('Platinum', 10),
    diamond: generateMockPlayers('Diamond', 10),
    crown: generateMockPlayers('Crown', 10),
    ace: generateMockPlayers('Ace', 10),
    master: generateMockPlayers('Master', 10),
    challenger: generateMockPlayers('Challenger', 10),
    conqueror: generateMockPlayers('Conqueror', 10)
  }), []);

  // 선택된 티어 변경 시 플레이어 업데이트
  React.useEffect(() => {
    setPlayers(topPlayersByTier[selectedTier] || []);
  }, [selectedTier, topPlayersByTier]);

  // 5초마다 순위 섞기
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => {
        // 점수를 랜덤하게 약간 변경
        const updated = prev.map(p => ({
          ...p,
          score: p.score + Math.floor(Math.random() * 200) - 100
        }));

        // 점수 기준으로 재정렬
        const sorted = [...updated].sort((a, b) => b.score - a.score);

        // 순위 재할당 (이전 순위 저장)
        return sorted.map((p, i) => {
          const newRank = i + 1;
          const oldRank = p.rank;
          return {
            ...p,
            rank: newRank,
            rankChange: oldRank - newRank // 양수면 상승, 음수면 하락
          };
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return '#fbbf24';
      case 2: return '#9ca3af';
      case 3: return '#cd7f32';
      default: return '#e5e7eb';
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <Layout>
      <div className="pubg-rank-page">
        <div className="tier-header">
          <h1 className="tier-title">PUBG Rank</h1>
          <p className="tier-subtitle">티어별 상위 랭킹</p>
        </div>

        <div className="tier-instruction">
          💡 탭을 클릭해서 각 티어별 상위 랭킹을 확인하세요
        </div>

        {/* PUBG 티어 탭 */}
        <div className="tier-tabs">
          {tierList.map((tier) => (
            <button
              key={tier.key}
              className={`tier-tab ${selectedTier === tier.key ? 'active' : ''}`}
              onClick={() => setSelectedTier(tier.key)}
              title={tier.label}
            >
              {tier.key === 'all' ? (
                <span className="tier-tab-all-icon">⭐</span>
              ) : (
                getTierIcon(tier.label, { className: 'tier-icon-tab' })
              )}
            </button>
          ))}
        </div>

        {/* 상위 랭킹 리스트 */}
        <div className="rank-content">
          <div className="top-performers">
            <h3 className="top-performers-title">
              {selectedTier !== 'all' && (
                <span className="title-tier-icon">
                  {getTierIcon(tierList.find(t => t.key === selectedTier)?.label, { className: 'tier-icon-title' })}
                </span>
              )}
              {selectedTier === 'all' ? '전체 티어' : tierList.find(t => t.key === selectedTier)?.label} RANK
            </h3>

            {players.length > 0 ? (
              <div className="performers-list">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="performer-item"
                    style={{
                      transitionDelay: `${player.rank * 30}ms`
                    }}
                  >
                    <div className="performer-rank-badge" style={{ backgroundColor: getMedalColor(player.rank) }}>
                      {getMedalEmoji(player.rank)}
                    </div>

                    <div className="performer-info">
                      <div className="performer-name-row">
                        <span className="performer-name">{player.name}</span>
                        {player.rankChange !== undefined && (
                          <span className={`rank-change-inline ${
                            player.rankChange > 0 ? 'rank-up' :
                            player.rankChange < 0 ? 'rank-down' :
                            'rank-same'
                          }`}>
                            {player.rankChange > 0 ? `▲${Math.abs(player.rankChange)}` :
                             player.rankChange < 0 ? `▼${Math.abs(player.rankChange)}` :
                             '—'}
                          </span>
                        )}
                        {getTierIcon(player.tier, { className: 'performer-tier-icon', title: player.tier })}
                      </div>
                      <div className="performer-tier">{player.tier}</div>
                    </div>

                    <div className="performer-stats">
                      <div className="performer-stat">
                        <span className="performer-stat-label">승리</span>
                        <span className="performer-stat-value">{player.wins}</span>
                      </div>
                      <div className="performer-stat">
                        <span className="performer-stat-label">킬</span>
                        <span className="performer-stat-value">{player.kills}</span>
                      </div>
                      <div className="performer-stat">
                        <span className="performer-stat-label">K/D</span>
                        <span className="performer-stat-value">{player.kd}</span>
                      </div>
                      <div className="performer-stat">
                        <span className="performer-stat-label">승률</span>
                        <span className="performer-stat-value">{player.winRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>해당 티어에 랭킹 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
