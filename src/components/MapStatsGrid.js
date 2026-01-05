import React, { useState } from 'react';
import '../styles/map-stats-grid.css';

/**
 * MapStatsGrid - 맵별 통계 그리드
 */
export default function MapStatsGrid({ maps = [] }) {
  const [sortBy, setSortBy] = useState('matches');

  const sortedMaps = [...maps].sort((a, b) => {
    if (sortBy === 'matches') return b.matches - a.matches;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    if (sortBy === 'avgRank') return a.avgRank - b.avgRank; // Lower rank is better
    return 0;
  });

  if (!maps || maps.length === 0) {
    return (
      <div className="map-stats-container">
        <div className="empty-maps">
          <p>맵 통계가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-stats-container">
      <div className="map-stats-header">
        <h3 className="map-stats-title">맵별 통계</h3>
        <div className="sort-selector">
          <label>정렬:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="matches">매치 수</option>
            <option value="winRate">승률</option>
            <option value="avgRank">평균 순위</option>
          </select>
        </div>
      </div>

      <div className="map-stats-grid">
        {sortedMaps.map((map, index) => (
          <div key={map.name} className={`map-card ${index === 0 ? 'favorite' : ''}`}>
            {index === 0 && <span className="favorite-badge">최애 맵</span>}

            <div className="map-name">{map.name}</div>

            <div className="map-main-stats">
              <div className="map-stat-item">
                <span className="stat-label">매치</span>
                <span className="stat-value">{map.matches}</span>
              </div>
              <div className="map-stat-item">
                <span className="stat-label">승</span>
                <span className="stat-value">{map.wins}</span>
              </div>
            </div>

            <div className="map-details">
              <div className="detail-row">
                <span className="detail-label">승률</span>
                <span className="detail-value">{map.winRate.toFixed(1)}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">평균 순위</span>
                <span className="detail-value">#{map.avgRank.toFixed(1)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">총 킬</span>
                <span className="detail-value">{map.kills}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">평균 데미지</span>
                <span className="detail-value">{map.avgDamage.toFixed(0)}</span>
              </div>
            </div>

            {map.favoriteDropZone && (
              <div className="drop-zone">
                <span className="drop-zone-label">선호 지역</span>
                <span className="drop-zone-name">{map.favoriteDropZone}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
