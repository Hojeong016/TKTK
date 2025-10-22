import React from 'react';

/**
 * StatsCard - 통계 정보를 표시하는 카드 컴포넌트
 * @param {string} title - 카드 제목
 * @param {string|number} value - 표시할 값
 * @param {string} subtitle - 부가 설명 (선택)
 * @param {string} trend - 증감 표시 (선택, 예: "+12%", "-5%")
 * @param {string} icon - 아이콘 (선택)
 */
export default function StatsCard({ title, value, subtitle, trend, icon }) {
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <span className="stats-card-title">{title}</span>
        {icon && <span className="stats-card-icon">{icon}</span>}
      </div>
      <div className="stats-card-body">
        <div className="stats-card-value">{value}</div>
        {trend && (
          <span className={`stats-card-trend ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
    </div>
  );
}
