import React from 'react';

/**
 * ActivityTimeline - 멤버들의 최근 게임 활동 타임라인
 * 임시 데이터로 표시
 */
export default function ActivityTimeline() {
  // 임시 활동 데이터
  const activities = [
    {
      id: 1,
      playerName: 'PlayerOne',
      action: '게임 플레이',
      details: '치킨 획득 • 8킬',
      timestamp: '2시간 전',
      type: 'win'
    },
    {
      id: 2,
      playerName: 'GamerPro',
      action: '순위 상승',
      details: 'Diamond → Crown',
      timestamp: '4시간 전',
      type: 'rank_up'
    },
    {
      id: 3,
      playerName: 'SkillMaster',
      action: '게임 플레이',
      details: '2등 • 12킬',
      timestamp: '6시간 전',
      type: 'play'
    },
    {
      id: 4,
      playerName: 'NoobKiller',
      action: '신기록 달성',
      details: '최고 킬수 20킬',
      timestamp: '8시간 전',
      type: 'achievement'
    },
    {
      id: 5,
      playerName: 'TeamPlayer',
      action: '게임 플레이',
      details: '치킨 획득 • 5킬',
      timestamp: '10시간 전',
      type: 'win'
    },
    {
      id: 6,
      playerName: 'SniperKing',
      action: '게임 플레이',
      details: '3등 • 7킬',
      timestamp: '12시간 전',
      type: 'play'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'win': return '🏆';
      case 'rank_up': return '📈';
      case 'achievement': return '⭐';
      default: return '🎮';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'win': return '#fef3c7';
      case 'rank_up': return '#ddd6fe';
      case 'achievement': return '#fce7f3';
      default: return '#f3f4f6';
    }
  };

  return (
    <div className="activity-timeline">
      <h3 className="activity-timeline-title">최근 활동</h3>
      <div className="timeline-list">
        {activities.map((activity) => (
          <div key={activity.id} className="timeline-item">
            <div
              className="timeline-icon"
              style={{ backgroundColor: getActivityColor(activity.type) }}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-player">{activity.playerName}</span>
                <span className="timeline-time">{activity.timestamp}</span>
              </div>
              <div className="timeline-action">{activity.action}</div>
              <div className="timeline-details">{activity.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
