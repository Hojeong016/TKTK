import React from 'react';
import Layout from '../components/Layout';
import ActivityTimeline from '../components/ActivityTimeline';
import '../styles/reports.css';

export default function Reports() {
  // Mock 데이터 - 생일자
  const birthdays = [
    { id: 1, discordName: '치킨러버', birthday: '2024-10-25', avatar: '🎮' },
    { id: 2, discordName: '배그왕', birthday: '2024-10-28', avatar: '🏆' },
    { id: 3, discordName: '헤드샷마스터', birthday: '2024-10-30', avatar: '🎯' }
  ];

  // Mock 데이터 - 클랜 통계
  const clanStats = {
    totalMembers: 48,
    activeMembers: 35,
    activeRate: 73,
    avgGameTime: '3.2시간',
    popularMode: 'Squad'
  };

  const getDaysUntilBirthday = (birthday) => {
    const today = new Date();
    const bday = new Date(birthday);
    const diff = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">클랜 활동 및 멤버 정보</p>
        </div>

        {/* 1. 클랜 통계 대시보드 - 상단 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{clanStats.totalMembers}</div>
            <div className="stat-label">총 멤버</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💚</div>
            <div className="stat-value">{clanStats.activeMembers}</div>
            <div className="stat-label">활성 멤버</div>
            <div className="stat-sublabel">{clanStats.activeRate}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{clanStats.avgGameTime}</div>
            <div className="stat-label">평균 게임 시간</div>
            <div className="stat-sublabel">일일 평균</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{clanStats.popularMode}</div>
            <div className="stat-label">인기 모드</div>
            <div className="stat-sublabel">가장 많이 플레이</div>
          </div>
        </div>

        {/* 2단 레이아웃 */}
        <div className="reports-two-column">
          {/* 왼쪽: 이번 달 생일자 */}
          <div className="section-container birthday-section">
            <div className="section-header">
              <h2 className="section-title">🎂 이번 달 생일자</h2>
              <span className="section-badge">{birthdays.length}명</span>
            </div>
            <div className="birthday-list">
              {birthdays.map(member => {
                const dday = getDaysUntilBirthday(member.birthday);
                return (
                  <div key={member.id} className="birthday-card">
                    <div className="birthday-avatar">{member.avatar}</div>
                    <div className="birthday-info">
                      <div className="birthday-name">{member.discordName}</div>
                      <div className="birthday-date">
                        {new Date(member.birthday).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className={`birthday-dday ${dday === 0 ? 'today' : ''}`}>
                      {dday === 0 ? '🎉 오늘!' : `D-${dday}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 최근 활동 타임라인 */}
          <div className="section-container activity-section">
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </Layout>
  );
}
