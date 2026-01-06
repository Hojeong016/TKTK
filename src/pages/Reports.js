import React from 'react';
import Lottie from 'lottie-react';
import Layout from '../components/Layout';
import notice from '../data/reportsNotice.json';
import noticeAnimation from '../assets/reportsNoticeAnimation.json';
import '../styles/reports.css';

export default function Reports() {
  const lastUpdated = notice?.lastUpdated
    ? new Date(notice.lastUpdated).toLocaleString('ko-KR')
    : null;

  return (
    <Layout>
      <div className="reports-page notice-only">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">클랜 활동 리포트</p>
        </div>

        <div className="reports-notice-card">
          <Lottie
            className="reports-illustration"
            animationData={noticeAnimation}
            loop
            autoplay
          />
          <h2>{notice?.message || 'Reports 페이지는 준비 중입니다.'}</h2>
          <p>{notice?.description}</p>
          {lastUpdated && (
            <p className="notice-updated">마지막 업데이트: {lastUpdated}</p>
          )}

          {Array.isArray(notice?.upcomingFeatures) && notice.upcomingFeatures.length > 0 && (
            <div className="notice-list">
              <p>곧 만나볼 기능들:</p>
              <ul>
                {notice.upcomingFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
