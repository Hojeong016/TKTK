import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/season-comparison.css';

/**
 * SeasonComparison - 시즌별 비교 차트
 */
export default function SeasonComparison({ seasons = [], currentSeason }) {
  const [selectedMetric, setSelectedMetric] = useState('kd');

  const metrics = [
    { id: 'kd', label: 'K/D', format: (v) => v.toFixed(2) },
    { id: 'winRate', label: '승률', format: (v) => `${v.toFixed(1)}%` },
    { id: 'avgDamage', label: '평균 데미지', format: (v) => v.toFixed(0) },
    { id: 'totalMatches', label: '매치 수', format: (v) => v },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);

  // 차트 데이터 준비
  const chartData = seasons.map(season => ({
    ...season,
    displayName: season.seasonName.replace(/\d{4}\s*/, '').trim(),
    isCurrent: season.seasonId === currentSeason,
    value: season.stats[selectedMetric]
  }));

  // 추세 계산
  const getTrend = () => {
    if (seasons.length < 2) return 'neutral';

    const recent = seasons.slice(-2);
    const prev = recent[0].stats[selectedMetric];
    const curr = recent[1].stats[selectedMetric];

    const change = ((curr - prev) / prev) * 100;

    return change > 2 ? 'up' : change < -2 ? 'down' : 'neutral';
  };

  const trend = getTrend();

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="season-tooltip">
          <div className="tooltip-season-name">{data.seasonName}</div>
          <div className="tooltip-value" style={{ color: '#667eea' }}>
            {currentMetric.label}: {currentMetric.format(data.value)}
          </div>
          <div className="tooltip-period">
            {data.startDate} ~ {data.endDate}
          </div>
          {data.isCurrent && <div className="tooltip-badge">현재 시즌</div>}
        </div>
      );
    }
    return null;
  };

  if (!seasons || seasons.length === 0) {
    return (
      <div className="season-comparison-container">
        <div className="empty-season">
          <p>시즌 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="season-comparison-container">
      <div className="season-header">
        <div className="header-left">
          <h3 className="season-title">시즌별 비교</h3>
          <div className={`trend-badge ${trend}`}>
            <span className="trend-icon">
              {trend === 'up' && '↗'}
              {trend === 'down' && '↘'}
              {trend === 'neutral' && '→'}
            </span>
            <span className="trend-text">
              {trend === 'up' && '성장 추세'}
              {trend === 'down' && '하락 추세'}
              {trend === 'neutral' && '유지'}
            </span>
          </div>
        </div>
        <div className="metric-tabs">
          {metrics.map(metric => (
            <button
              key={metric.id}
              className={`metric-tab ${selectedMetric === metric.id ? 'active' : ''}`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="season-chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="displayName"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => currentMetric.format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrent ? '#667eea' : '#d1d5db'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="season-list">
        {seasons.map(season => (
          <div
            key={season.seasonId}
            className={`season-card ${season.seasonId === currentSeason ? 'current' : ''}`}
          >
            <div className="season-card-header">
              <span className="season-name">{season.seasonName}</span>
              {season.seasonId === currentSeason && (
                <span className="current-badge">진행 중</span>
              )}
            </div>
            <div className="season-period">
              {season.startDate} ~ {season.endDate}
            </div>
            <div className="season-quick-stats">
              <div className="quick-stat">
                <span className="label">매치</span>
                <span className="value">{season.stats.totalMatches}</span>
              </div>
              <div className="quick-stat">
                <span className="label">승률</span>
                <span className="value">{season.stats.winRate.toFixed(1)}%</span>
              </div>
              <div className="quick-stat">
                <span className="label">K/D</span>
                <span className="value">{season.stats.kd.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
