import React from 'react';
import Layout from '../components/Layout';
import MemberManagementTable from '../components/MemberManagementTable';
import RightsManagement from '../components/RightsManagement';
import TierManagement from '../components/TierManagement';
import BlacklistManagement from '../components/BlacklistManagement';
import Login from '../components/Login';
import Signup from '../components/Signup';
import authService from '../api/authService';
import '../styles/settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState('members'); // 'members', 'rights', 'tier', or 'blacklist'
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login'); // 'login' or 'signup'
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // 인증 체크
  React.useEffect(() => {
    const checkAuth = () => {
      setIsCheckingAuth(true);
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignupSuccess = () => {
    // 회원가입 성공 후 로그인 화면으로 전환
    setAuthMode('login');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 나도 일단 로그아웃 처리
      setIsAuthenticated(false);
    }
  };

  // 인증 체크 중
  if (isCheckingAuth) {
    return (
      <Layout>
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  // 인증되지 않은 경우 로그인/회원가입 화면 표시
  if (!isAuthenticated) {
    return (
      <Layout>
        {authMode === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        ) : (
          <Signup
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">관리자 설정 패널</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            멤버 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'rights' ? 'active' : ''}`}
            onClick={() => setActiveTab('rights')}
          >
            권한 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'tier' ? 'active' : ''}`}
            onClick={() => setActiveTab('tier')}
          >
            TKTK CLAN TIER
          </button>
          <button
            className={`settings-tab ${activeTab === 'blacklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('blacklist')}
          >
            블랙리스트 관리
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {activeTab === 'members' && <MemberManagementTable />}
          {activeTab === 'rights' && <RightsManagement />}
          {activeTab === 'tier' && <TierManagement />}
          {activeTab === 'blacklist' && <BlacklistManagement />}
        </div>
      </div>
    </Layout>
  );
}
