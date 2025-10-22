import React from 'react';
import { useFetchItems } from '../api/useFetch';

/**
 * TierDistribution - 멤버들의 티어 분포를 시각화하는 컴포넌트
 */
export default function TierDistribution() {
  const { data, isLoading } = useFetchItems();

  const tierCounts = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return {};

    const counts = {};
    data.forEach((member) => {
      const tier = member.game?.tier || 'Free';
      counts[tier] = (counts[tier] || 0) + 1;
    });

    return counts;
  }, [data]);

  const totalMembers = Object.values(tierCounts).reduce((sum, count) => sum + count, 0);

  // 티어별 그라데이션 색상 매핑
  const getTierGradient = (tier) => {
    const tierLower = String(tier).toLowerCase();
    const gradients = {
      conqueror: 'linear-gradient(90deg, #ff0844, #ffb199)',
      master: 'linear-gradient(90deg, #ff6b6b, #feca57)',
      ace: 'linear-gradient(90deg, #a29bfe, #fd79a8)',
      crown: 'linear-gradient(90deg, #fdcb6e, #e17055)',
      diamond: 'linear-gradient(90deg, #74b9ff, #a29bfe)',
      platinum: 'linear-gradient(90deg, #00b894, #55efc4)',
      gold: 'linear-gradient(90deg, #fdcb6e, #ffeaa7)',
      silver: 'linear-gradient(90deg, #b2bec3, #dfe6e9)',
      bronze: 'linear-gradient(90deg, #d63031, #ff7675)',
      free: 'linear-gradient(90deg, #636e72, #b2bec3)'
    };
    return gradients[tierLower] || 'linear-gradient(90deg, #3b82f6, #2563eb)';
  };

  const tierList = Object.entries(tierCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tier, count]) => ({
      tier,
      count,
      percentage: totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(1) : 0,
      gradient: getTierGradient(tier)
    }));

  if (isLoading) return <div className="tier-distribution">Loading...</div>;

  return (
    <div className="tier-distribution">
      <h3 className="tier-distribution-title">티어 분포</h3>
      <div className="tier-distribution-list">
        {tierList.map(({ tier, count, percentage, gradient }) => (
          <div key={tier} className="tier-item">
            <div className="tier-item-header">
              <span className="tier-item-name">{tier}</span>
              <span className="tier-item-count">{count}명</span>
            </div>
            <div className="tier-item-bar-bg">
              <div
                className="tier-item-bar"
                style={{
                  width: `${percentage}%`,
                  background: gradient
                }}
              />
            </div>
            <span className="tier-item-percentage">{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
