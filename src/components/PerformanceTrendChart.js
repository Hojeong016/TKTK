import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import '../styles/performance-trend-chart.css';

/**
 * PerformanceTrendChart - 성적 추이 라인 차트
 */
export default function PerformanceTrendChart({ performanceTrends = [], period = 'month' }) {
  const [selectedMetric, setSelectedMetric] = useState('kd');
  const data = performanceTrends;

  const metrics = [
    { id: 'kd', label: 'K/D 비율', color: '#667eea', format: (v) => v != null ? v.toFixed(2) : '0.00' },
    { id: 'winRate', label: '승률', color: '#10b981', format: (v) => v != null ? `${v.toFixed(1)}%` : '0.0%' },
    { id: 'avgDamage', label: '평균 데미지', color: '#f59e0b', format: (v) => v != null ? v.toFixed(1) : '0.0' },
    { id: 'kills', label: '킬 수', color: '#ef4444', format: (v) => v != null ? v.toFixed(0) : '0' },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);

  // 평균 계산
  const average = data.length > 0
    ? data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length
    : 0;

  // 추세 계산
  const getTrend = () => {
    if (data.length < 2) return { direction: 'neutral', change: 0 };

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d[selectedMetric], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d[selectedMetric], 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  const trend = getTrend();

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <div className="tooltip-date">{format(new Date(data.date), 'M월 d일')}</div>
          <div className="tooltip-value" style={{ color: currentMetric.color }}>
            {currentMetric.label}: {currentMetric.format(data[selectedMetric])}
          </div>
          <div className="tooltip-matches">{data.matches}경기</div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="performance-trend-container">
        <div className="empty-chart">
          <p>표시할 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-trend-container">
      <div className="trend-header">
        <h3 className="trend-title">성적 추이</h3>
        <div className="trend-summary">
          <div className="trend-average">
            <span className="label">평균</span>
            <span className="value" style={{ color: currentMetric.color }}>
              {currentMetric.format(average)}
            </span>
          </div>
          <div className={`trend-indicator ${trend.direction}`}>
            <span className="trend-icon">
              {trend.direction === 'up' && '↗'}
              {trend.direction === 'down' && '↘'}
              {trend.direction === 'neutral' && '→'}
            </span>
            <span className="trend-value">
              {trend.direction === 'neutral' ? '유지' : `${trend.change.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      <div className="metric-selector">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            className={`metric-btn ${selectedMetric === metric.id ? 'active' : ''}`}
            onClick={() => setSelectedMetric(metric.id)}
            style={{
              borderColor: selectedMetric === metric.id ? metric.color : 'transparent',
              color: selectedMetric === metric.id ? metric.color : '#6b7280'
            }}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'M/d')}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => currentMetric.format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetric.color}
              strokeWidth={3}
              dot={{ fill: currentMetric.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {/* 평균선 */}
            <Line
              type="monotone"
              dataKey={() => average}
              stroke={currentMetric.color}
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-line solid" style={{ background: currentMetric.color }}></span>
          실제 값
        </span>
        <span className="legend-item">
          <span className="legend-line dashed" style={{ background: currentMetric.color }}></span>
          평균선
        </span>
      </div>
    </div>
  );
}
