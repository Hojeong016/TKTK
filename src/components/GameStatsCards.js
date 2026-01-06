import React from 'react';
import '../styles/game-stats-cards.css';

/**
 * GameStatsCards - 주요 게임 통계 카드들
 */
export default function GameStatsCards({ stats = {} }) {
  const mainStats = [
    {
      id: 'matches',
      label: '총 매치',
      value: stats.totalMatches || 0,
      color: '#667eea'
    },
    {
      id: 'winRate',
      label: '승률',
      value: `${(stats.winRate || 0).toFixed(1)}%`,
      color: '#667eea'
    },
    {
      id: 'kd',
      label: 'K/D 비율',
      value: (stats.kd || 0).toFixed(2),
      color: '#667eea'
    },
    {
      id: 'avgDamage',
      label: '평균 데미지',
      value: (stats.avgDamage || 0).toFixed(1),
      color: '#667eea'
    }
  ];

  const secondaryStats = [
    {
      label: 'Top 10',
      value: stats.top10 || 0,
      percentage: stats.top10Rate || 0
    },
    {
      label: '총 킬',
      value: stats.kills || 0,
      percentage: null
    },
    {
      label: '헤드샷 비율',
      value: `${(stats.headshotRate || 0).toFixed(1)}%`,
      percentage: null
    },
    {
      label: '최장 킬',
      value: `${stats.longestKill || 0}m`,
      percentage: null
    }
  ];

  return (
    <div className="game-stats-section">
      {/* Main Stats Grid */}
      <div className="main-stats-grid">
        {mainStats.map((stat) => (
          <div key={stat.id} className="main-stat-card">
            <div className="stat-card-header">
              <span className="main-stat-label">{stat.label}</span>
              {stat.trend != null && (
                <span
                  className={`main-stat-trend ${
                    stat.trend > 0 ? 'positive' : stat.trend < 0 ? 'negative' : 'neutral'
                  }`}
                >
                  {stat.trend > 0 ? `+${stat.trend}` : stat.trend}
                </span>
              )}
            </div>
            <div className="stat-card-body">
              <div className="main-stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="secondary-stats-container">
        <h4 className="secondary-stats-title">상세 통계</h4>
        <div className="secondary-stats-grid">
          {secondaryStats.map((stat, index) => (
            <div key={index} className="secondary-stat-item">
              <div className="secondary-stat-label">{stat.label}</div>
              <div className="secondary-stat-value">
                {stat.value}
                {stat.percentage !== null && (
                  <span className="secondary-stat-percentage">
                    ({stat.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
