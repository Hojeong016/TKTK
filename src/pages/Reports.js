import React from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import TierDistribution from '../components/TierDistribution';
import ActivityTimeline from '../components/ActivityTimeline';
import TopPerformers from '../components/TopPerformers';
import { useFetchItems } from '../api/useFetch';
import '../styles/reports.css';

export default function Reports() {
  const { data, isLoading } = useFetchItems();

  // 통계 계산
  const stats = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        averageTier: 'N/A',
        newMembers: 0
      };
    }

    const totalMembers = data.length;

    // 최근 7일 내 가입자 (예시)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newMembers = data.filter((m) => {
      const joinDate = m.discord?.join ? new Date(m.discord.join) : null;
      return joinDate && joinDate >= sevenDaysAgo;
    }).length;

    // 티어 분포
    const tiers = data.map(m => m.game?.tier).filter(Boolean);
    const averageTier = tiers.length > 0 ? `${tiers.length} tiers` : 'N/A';

    // 활성 멤버 (예: 티어가 있는 멤버)
    const activeMembers = data.filter(m => m.game?.tier).length;

    return {
      totalMembers,
      activeMembers,
      averageTier,
      newMembers
    };
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <div className="reports-page">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">멤버 통계 및 분석</p>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="stats-grid">
          <StatsCard
            title="전체 멤버"
            value={stats.totalMembers}
            subtitle="Total Members"
            icon="👥"
          />
          <StatsCard
            title="활성 멤버"
            value={stats.activeMembers}
            subtitle="With Game Tier"
            icon="🎮"
          />
          <StatsCard
            title="신규 가입"
            value={stats.newMembers}
            subtitle="Last 7 Days"
            trend={stats.newMembers > 0 ? `+${stats.newMembers}` : '0'}
            icon="✨"
          />
          <StatsCard
            title="평균 활동"
            value={`${((stats.activeMembers / stats.totalMembers) * 100).toFixed(0)}%`}
            subtitle="Activity Rate"
            icon="📊"
          />
        </div>

        {/* 분포 차트 */}
        <div className="reports-charts">
          <div className="chart-container chart-full-width">
            <TierDistribution />
          </div>
        </div>

        {/* 활동 및 성적 섹션 */}
        <div className="reports-activity-section">
          <div className="activity-container">
            <ActivityTimeline />
          </div>
          <div className="performers-container">
            <TopPerformers />
          </div>
        </div>
      </div>
    </Layout>
  );
}
