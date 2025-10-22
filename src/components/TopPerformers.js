import React from 'react';
import { getTierIcon } from '../constants/tiers';

/**
 * TopPerformers - 이번 주 상위 성적 멤버들
 * 임시 데이터로 표시
 */
export default function TopPerformers() {
  // 임시 상위 성적 데이터
  const topPlayers = [
    {
      id: 1,
      rank: 1,
      name: 'ElitePro',
      tier: 'Conqueror',
      wins: 28,
      kills: 156,
      kd: 4.2,
      winRate: 45
    },
    {
      id: 2,
      rank: 2,
      name: 'MasterGamer',
      tier: 'Master',
      wins: 24,
      kills: 142,
      kd: 3.8,
      winRate: 42
    },
    {
      id: 3,
      rank: 3,
      name: 'ProPlayer',
      tier: 'Ace',
      wins: 22,
      kills: 138,
      kd: 3.5,
      winRate: 40
    },
    {
      id: 4,
      rank: 4,
      name: 'SkillKing',
      tier: 'Crown',
      wins: 20,
      kills: 125,
      kd: 3.2,
      winRate: 38
    },
    {
      id: 5,
      rank: 5,
      name: 'GameChamp',
      tier: 'Diamond',
      wins: 18,
      kills: 118,
      kd: 3.0,
      winRate: 35
    }
  ];

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return '#fbbf24'; // gold
      case 2: return '#9ca3af'; // silver
      case 3: return '#cd7f32'; // bronze
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
    <div className="top-performers">
      <h3 className="top-performers-title">Top Performers</h3>
      <p className="top-performers-subtitle">이번 주 상위 성적</p>

      <div className="performers-list">
        {topPlayers.map((player) => (
          <div key={player.id} className="performer-item">
            <div className="performer-rank-badge" style={{ backgroundColor: getMedalColor(player.rank) }}>
              {getMedalEmoji(player.rank)}
            </div>

            <div className="performer-info">
              <div className="performer-name-row">
                <span className="performer-name">{player.name}</span>
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
    </div>
  );
}
