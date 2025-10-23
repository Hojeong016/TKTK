import React from 'react';
import Layout from '../components/Layout';
import TierDistribution from '../components/TierDistribution';
import ActivityTimeline from '../components/ActivityTimeline';
import TopPerformers from '../components/TopPerformers';
import '../styles/reports.css';

export default function Reports() {

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">멤버 통계 및 분석</p>
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
