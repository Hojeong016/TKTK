import React from 'react';
import { useFetchItems } from '../api/useFetch';
import { getRightLabel } from '../constants/rights';

/**
 * RightDistribution - 멤버들의 권한(Right) 분포를 시각화하는 컴포넌트
 */
export default function RightDistribution() {
  const { data, isLoading } = useFetchItems();

  const rightCounts = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return {};

    const counts = {};
    data.forEach((member) => {
      const right = member.discord?.right || 'member';
      counts[right] = (counts[right] || 0) + 1;
    });

    return counts;
  }, [data]);

  const totalMembers = Object.values(rightCounts).reduce((sum, count) => sum + count, 0);

  const rightList = Object.entries(rightCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([right, count]) => ({
      right,
      rightLabel: getRightLabel(right) || right,
      count,
      percentage: totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(1) : 0
    }));

  // 권한별 색상 매핑
  const getRightColor = (right) => {
    const lowerRight = String(right).toLowerCase();
    if (lowerRight === 'master') return '#fef3c7';
    if (lowerRight === 'streamer') return '#ddd6fe';
    if (lowerRight === '3tier') return '#d1fae5';
    return '#f3f4f6';
  };

  if (isLoading) return <div className="right-distribution">Loading...</div>;

  return (
    <div className="right-distribution">
      <h3 className="right-distribution-title">권한 분포</h3>
      <div className="right-distribution-chart">
        {rightList.map(({ right, rightLabel, count, percentage }) => (
          <div
            key={right}
            className="right-chart-segment"
            style={{
              flex: percentage,
              backgroundColor: getRightColor(right)
            }}
            title={`${rightLabel}: ${count}명 (${percentage}%)`}
          >
            {parseFloat(percentage) > 10 && (
              <span className="right-chart-label">{rightLabel}</span>
            )}
          </div>
        ))}
      </div>
      <div className="right-distribution-legend">
        {rightList.map(({ right, rightLabel, count, percentage }) => (
          <div key={right} className="right-legend-item">
            <span
              className="right-legend-color"
              style={{ backgroundColor: getRightColor(right) }}
            />
            <span className="right-legend-label">{rightLabel}</span>
            <span className="right-legend-value">{count}명 ({percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
