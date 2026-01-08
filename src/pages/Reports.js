import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import Layout from '../components/Layout';
import notice from '../data/reportsNotice.json';
import noticeAnimation from '../assets/reportsNoticeAnimation.json';
import { canAccessRestrictedPages } from '../utils/discord-auth';
import '../styles/reports.css';

export default function Reports() {
  const navigate = useNavigate();
  const hasAccess = canAccessRestrictedPages();

  const lastUpdated = notice?.lastUpdated
    ? new Date(notice.lastUpdated).toLocaleString('ko-KR')
    : null;

  // 권한 체크 (MEMBER만 있는 사용자나 로그인 안한 사용자는 접근 불가)
  React.useEffect(() => {
    if (!hasAccess) {
      alert('이 페이지에 접근할 수 있는 권한이 없습니다.');
      navigate('/');
    }
  }, [hasAccess, navigate]);

  // 권한이 없는 경우 렌더링하지 않음
  if (!hasAccess) {
    return null;
  }

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
