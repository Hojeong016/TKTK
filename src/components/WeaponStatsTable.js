import React, { useState } from 'react';
import '../styles/weapon-stats-table.css';

/**
 * WeaponStatsTable - 무기별 통계 테이블
 */
export default function WeaponStatsTable({ weapons = [], filter = 'all' }) {
  const [sortBy, setSortBy] = useState('kills');
  const [filterType, setFilterType] = useState(filter);

  const weaponTypes = ['all', 'AR', 'SR', 'SMG', 'DMR', 'SG', 'Pistol'];

  // 필터링
  const filteredWeapons = filterType === 'all'
    ? weapons
    : weapons.filter(w => w.type === filterType);

  // 정렬
  const sortedWeapons = [...filteredWeapons].sort((a, b) => {
    if (sortBy === 'kills') return b.kills - a.kills;
    if (sortBy === 'headshotRate') return b.headshotRate - a.headshotRate;
    if (sortBy === 'avgDamage') return b.avgDamagePerMatch - a.avgDamagePerMatch;
    if (sortBy === 'longestKill') return b.longestKill - a.longestKill;
    return 0;
  });

  if (!weapons || weapons.length === 0) {
    return (
      <div className="weapon-stats-container">
        <div className="empty-weapons">
          <p>무기 통계가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weapon-stats-container">
      <div className="weapon-stats-header">
        <h3 className="weapon-stats-title">무기별 통계</h3>
        <div className="weapon-filters">
          {weaponTypes.map(type => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? '전체' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="weapon-table-wrapper">
        <table className="weapon-table">
          <thead>
            <tr>
              <th>무기</th>
              <th>타입</th>
              <th
                className={`sortable ${sortBy === 'kills' ? 'active' : ''}`}
                onClick={() => setSortBy('kills')}
              >
                킬 {sortBy === 'kills' && '↓'}
              </th>
              <th
                className={`sortable ${sortBy === 'headshotRate' ? 'active' : ''}`}
                onClick={() => setSortBy('headshotRate')}
              >
                헤드샷 {sortBy === 'headshotRate' && '↓'}
              </th>
              <th
                className={`sortable ${sortBy === 'avgDamage' ? 'active' : ''}`}
                onClick={() => setSortBy('avgDamage')}
              >
                평균 데미지 {sortBy === 'avgDamage' && '↓'}
              </th>
              <th
                className={`sortable ${sortBy === 'longestKill' ? 'active' : ''}`}
                onClick={() => setSortBy('longestKill')}
              >
                최장 거리 {sortBy === 'longestKill' && '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedWeapons.slice(0, 10).map((weapon, index) => (
              <tr key={weapon.name} className={index < 3 ? 'top-weapon' : ''}>
                <td className="weapon-name">
                  {index < 3 && <span className="weapon-rank-badge">#{index + 1}</span>}
                  {weapon.name}
                </td>
                <td className="weapon-type">
                  <span className={`type-badge ${weapon.type.toLowerCase()}`}>
                    {weapon.type}
                  </span>
                </td>
                <td className="kills-cell">{weapon.kills}</td>
                <td className="headshot-cell">
                  <div className="headshot-bar-container">
                    <div
                      className="headshot-bar"
                      style={{ width: `${weapon.headshotRate}%` }}
                    ></div>
                    <span className="headshot-text">{weapon.headshotRate.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="damage-cell">{weapon.avgDamagePerMatch.toFixed(1)}</td>
                <td className="distance-cell">{weapon.longestKill.toFixed(0)}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedWeapons.length > 10 && (
        <div className="showing-info">
          상위 10개 무기 표시 (전체 {sortedWeapons.length}개)
        </div>
      )}
    </div>
  );
}
