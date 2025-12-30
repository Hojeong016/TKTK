import React, { useState } from 'react';
import { format } from 'date-fns';
import '../styles/activity-heatmap.css';

/**
 * ActivityHeatmap - GitHub 잔디 스타일 활동 히트맵
 *
 * @param {Array} data - 활동 데이터 배열 [{ date, matchCount, totalKills, ... }]
 * @param {Object} summary - 활동 요약 통계
 */
export default function ActivityHeatmap({ data = [], summary = {} }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 활동 레벨 계산 (0-4)
  const getActivityLevel = (matchCount) => {
    if (matchCount === 0) return 0;
    if (matchCount <= 2) return 1;
    if (matchCount <= 5) return 2;
    if (matchCount <= 9) return 3;
    return 4;
  };

  // 색상 클래스 가져오기
  const getColorClass = (level, isFuture) => {
    if (isFuture) return 'activity-cell future';
    return `activity-cell level-${level}`;
  };

  // 주차별로 데이터 그룹화 (일요일 시작)
  const groupByWeeks = () => {
    if (!data || data.length === 0) return [];

    const weeks = [];

    // 데이터가 이미 일요일부터 시작하고 364일(52주)이므로
    // 단순히 7일씩 그룹화
    for (let i = 0; i < data.length; i += 7) {
      const week = data.slice(i, i + 7);

      // 7일이 안 되는 경우 null로 채우기
      while (week.length < 7) {
        week.push(null);
      }

      weeks.push(week);
    }

    return weeks;
  };

  const weeks = groupByWeeks();

  // 마우스 호버 핸들러
  const handleCellHover = (activity, event) => {
    if (!activity) {
      setHoveredCell(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredCell(activity);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };


  return (
    <div className="activity-heatmap-container">
      <div className="activity-heatmap-header">
        <h3 className="activity-heatmap-title">활동 히트맵</h3>
        <div className="activity-summary">
          <span className="summary-item">
            <span className="summary-label">현재 연속</span>
            <span className="summary-value">{summary.currentStreak || 0}일</span>
          </span>
          <span className="summary-divider">|</span>
          <span className="summary-item">
            <span className="summary-label">최장 연속</span>
            <span className="summary-value">{summary.longestStreak || 0}일</span>
          </span>
          <span className="summary-divider">|</span>
          <span className="summary-item">
            <span className="summary-label">활동일</span>
            <span className="summary-value">{summary.activeDays || 0}일</span>
          </span>
        </div>
      </div>

      <div className="activity-heatmap">
        {/* 히트맵 그리드 */}
        <div className="heatmap-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week-column">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="activity-cell empty" />;
                }

                const level = getActivityLevel(day.matchCount);

                return (
                  <div
                    key={dayIndex}
                    className={getColorClass(level, day.isFuture)}
                    onMouseEnter={(e) => handleCellHover(day, e)}
                    onMouseLeave={handleCellLeave}
                    data-date={day.date}
                    data-count={day.matchCount}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* 툴팁 */}
        {hoveredCell && (
          <div
            className="activity-tooltip"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="tooltip-date">
              {format(new Date(hoveredCell.date), 'yyyy년 M월 d일')}
            </div>
            <div className="tooltip-stats">
              <span>{hoveredCell.matchCount}경기</span>
              {hoveredCell.matchCount > 0 && (
                <>
                  <span className="tooltip-divider">•</span>
                  <span>{hoveredCell.totalKills}킬</span>
                  {hoveredCell.wins > 0 && (
                    <>
                      <span className="tooltip-divider">•</span>
                      <span className="tooltip-win">{hoveredCell.wins}승</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="activity-legend">
        <span className="legend-label">적음</span>
        <div className="legend-colors">
          <div className="activity-cell level-0" />
          <div className="activity-cell level-1" />
          <div className="activity-cell level-2" />
          <div className="activity-cell level-3" />
          <div className="activity-cell level-4" />
        </div>
        <span className="legend-label">많음</span>
      </div>
    </div>
  );
}
