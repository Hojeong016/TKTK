import React from 'react';
import { format } from 'date-fns';
import '../styles/achievement-card.css';

/**
 * AchievementCard - 업적/마일스톤 카드
 */
export default function AchievementCard({ achievement }) {
  const { unlocked, progress, target, rarity, unlockedAt } = achievement;

  const progressPercentage = target > 0 ? Math.min((progress / target) * 100, 100) : 0;

  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#9333ea',
    legendary: '#f59e0b'
  };

  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary'
  };

  return (
    <div className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} rarity-${rarity}`}>
      <div className="achievement-icon-wrapper">
        <div
          className="achievement-icon"
          style={{ borderColor: rarityColors[rarity] || '#9ca3af' }}
        >
          {achievement.icon && (achievement.icon.startsWith('http') || achievement.icon.startsWith('data:image')) ? (
            <img
              src={achievement.icon}
              alt={achievement.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          ) : (
            achievement.icon || achievement.id.substring(0, 2).toUpperCase()
          )}
        </div>
        {unlocked && <div className="unlock-badge">✓</div>}
      </div>

      <div className="achievement-content">
        <div className="achievement-header">
          <h4 className="achievement-name">{achievement.name}</h4>
          <span
            className="achievement-rarity"
            style={{ color: rarityColors[rarity] || '#9ca3af' }}
          >
            {rarityLabels[rarity] || 'Common'}
          </span>
        </div>

        <p className="achievement-description">{achievement.description}</p>

        <div className="progress-section">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercentage}%`,
                background: rarityColors[rarity] || '#9ca3af'
              }}
            ></div>
          </div>
          <div className="progress-text">
            <span className="progress-value">
              {progress} / {target}
            </span>
            <span className="progress-percentage">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {unlocked && unlockedAt && (
          <div className="unlock-date">
            달성일: {format(new Date(unlockedAt), 'yyyy년 M월 d일')}
          </div>
        )}

        {!unlocked && progressPercentage > 0 && (
          <div className="remaining-progress">
            {target - progress}개 남음
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AchievementGrid - 업적 그리드 컨테이너
 */
export function AchievementGrid({ achievements = [], filter = 'all' }) {
  const filteredAchievements = filter === 'all'
    ? achievements
    : filter === 'unlocked'
    ? achievements.filter(a => a.unlocked)
    : achievements.filter(a => !a.unlocked);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (!achievements || achievements.length === 0) {
    return (
      <div className="achievement-grid-container">
        <div className="empty-achievements">
          <p>업적 기능 개발 중입니다</p>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            곧 더 많은 통계와 함께 제공될 예정입니다.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="achievement-grid-container">
      <div className="achievement-grid-header">
        <h3 className="grid-title">업적</h3>
        <div className="achievement-count">
          {unlockedCount} / {totalCount} 달성
        </div>
      </div>

      <div className="achievement-grid">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
