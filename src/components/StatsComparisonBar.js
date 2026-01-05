import React, { useState } from 'react';
import '../styles/stats-comparison-bar.css';

/**
 * StatsComparisonBar - 모드별 통계 비교 바 차트
 */
export default function StatsComparisonBar({ modeComparison = {} }) {
  const [selectedMetric, setSelectedMetric] = useState('kd');
  const data = modeComparison;

  const metrics = [
    { id: 'kd', label: 'K/D', format: (v) => v.toFixed(2) },
    { id: 'winRate', label: '승률', format: (v) => `${v.toFixed(1)}%` },
    { id: 'avgDamage', label: '평균 데미지', format: (v) => v.toFixed(0) },
    { id: 'kills', label: '총 킬', format: (v) => v },
  ];

  const modes = [
    { id: 'solo', label: '솔로', color: '#667eea' },
    { id: 'duo', label: '듀오', color: '#10b981' },
    { id: 'squad', label: '스쿼드', color: '#f59e0b' },
  ];

  // 최대값 계산 (바 길이 정규화용)
  const getMaxValue = () => {
    const values = modes.map(mode => data[mode.id]?.[selectedMetric] || 0);
    return Math.max(...values, 1);
  };

  const maxValue = getMaxValue();
  const currentMetric = metrics.find(m => m.id === selectedMetric);

  // 가장 높은 값 찾기
  const getBestMode = () => {
    let best = null;
    let maxVal = 0;

    modes.forEach(mode => {
      const value = data[mode.id]?.[selectedMetric] || 0;
      if (value > maxVal) {
        maxVal = value;
        best = mode.id;
      }
    });

    return best;
  };

  const bestMode = getBestMode();

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="stats-comparison-container">
        <div className="empty-comparison">
          <p>표시할 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-comparison-container">
      <div className="comparison-header">
        <h3 className="comparison-title">모드별 통계 비교</h3>
        <div className="metric-pills">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              className={`metric-pill ${selectedMetric === metric.id ? 'active' : ''}`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="comparison-bars">
        {modes.map((mode) => {
          // 데이터가 없으면 기본값 사용
          const modeData = data[mode.id] || {
            totalMatches: 0,
            wins: 0,
            kd: 0,
            winRate: 0,
            avgDamage: 0
          };

          const value = modeData[selectedMetric] || 0;
          const percentage = (value / maxValue) * 100;
          const isBest = mode.id === bestMode && value > 0;
          const hasData = modeData.totalMatches > 0;

          return (
            <div
              key={mode.id}
              className={`comparison-row ${isBest ? 'best' : ''} ${!hasData ? 'no-data' : ''}`}
            >
              <div className="mode-info">
                <div className="mode-header">
                  <span className="mode-label">{mode.label}</span>
                  {isBest && <span className="best-badge">BEST</span>}
                  {!hasData && <span className="no-data-badge">데이터 없음</span>}
                </div>
                <span className="mode-matches">{modeData.totalMatches}경기</span>
              </div>

              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${percentage}%`,
                    background: hasData ? mode.color : '#e5e7eb',
                    opacity: hasData ? 1 : 0.5
                  }}
                >
                  {value > 0 && (
                    <span className="bar-value">
                      {currentMetric.format(value)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mode-stats-summary">
                <div className="stat-item">
                  <span className="stat-label">승률</span>
                  <span className="stat-value">{modeData.winRate.toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">K/D</span>
                  <span className="stat-value">{modeData.kd.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">데미지</span>
                  <span className="stat-value">{modeData.avgDamage.toFixed(0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
