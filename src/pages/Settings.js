import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MemberManagementTable from '../components/MemberManagementTable';
import RightsManagement from '../components/RightsManagement';
import TierManagement from '../components/TierManagement';
import BlacklistManagement from '../components/BlacklistManagement';
import ClanStatusManagement from '../components/ClanStatusManagement';
import LedgerManagement from '../components/LedgerManagement';
import AchievementManagement from '../components/AchievementManagement';
import { isAuthenticated, isAdmin } from '../utils/discord-auth';
import useStore from '../store/useStore';
import '../styles/settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState('members'); // 'members', 'clan', 'rights', 'tier', 'ledger', 'blacklist', or 'achievements'
  const tabVersionsRef = React.useRef({
    members: 0,
    clan: 0,
    tier: 0,
    ledger: 0,
    rights: 0,
    blacklist: 0,
    achievements: 0
  });

  const incrementTabVersion = (tab) => {
    tabVersionsRef.current[tab] = (tabVersionsRef.current[tab] || 0) + 1;
  };
  const navigate = useNavigate();
  const loadRightsConfig = useStore(state => state.loadRightsConfig);

  // 권한 체크
  React.useEffect(() => {
    if (!isAuthenticated()) {
      // 로그인하지 않은 경우 홈으로 리다이렉트
      navigate('/');
      return;
    }

    if (!isAdmin()) {
      // 관리자가 아닌 경우 홈으로 리다이렉트
      alert('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }

    // 관리자인 경우에만 권한 설정 로드
    loadRightsConfig();
  }, [navigate, loadRightsConfig]);

  // 관리자가 아니면 아무것도 렌더링하지 않음
  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">관리자 설정 패널</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('members');
              incrementTabVersion('members');
            }}
          >
            멤버 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'clan' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('clan');
              incrementTabVersion('clan');
            }}
          >
            클랜 가입 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'tier' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tier');
              incrementTabVersion('tier');
            }}
          >
            클랜 정보 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ledger');
              incrementTabVersion('ledger');
            }}
          >
            공금 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'rights' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('rights');
              incrementTabVersion('rights');
            }}
          >
            권한 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'blacklist' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('blacklist');
              incrementTabVersion('blacklist');
            }}
          >
            블랙리스트 관리
          </button>
          <button
            className={`settings-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('achievements');
              incrementTabVersion('achievements');
            }}
          >
            업적 관리
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {activeTab === 'members' && (
            <MemberManagementTable key={`members-${tabVersionsRef.current.members}`} version={tabVersionsRef.current.members} />
          )}
          {activeTab === 'clan' && (
            <ClanStatusManagement key={`clan-${tabVersionsRef.current.clan}`} version={tabVersionsRef.current.clan} />
          )}
          {activeTab === 'tier' && (
            <TierManagement key={`tier-${tabVersionsRef.current.tier}`} version={tabVersionsRef.current.tier} />
          )}
          {activeTab === 'ledger' && (
            <LedgerManagement key={`ledger-${tabVersionsRef.current.ledger}`} version={tabVersionsRef.current.ledger} />
          )}
          {activeTab === 'rights' && (
            <RightsManagement key={`rights-${tabVersionsRef.current.rights}`} version={tabVersionsRef.current.rights} />
          )}
          {activeTab === 'blacklist' && (
            <BlacklistManagement key={`blacklist-${tabVersionsRef.current.blacklist}`} version={tabVersionsRef.current.blacklist} />
          )}
          {activeTab === 'achievements' && (
            <AchievementManagement key={`achievements-${tabVersionsRef.current.achievements}`} version={tabVersionsRef.current.achievements} />
          )}
        </div>
      </div>
    </Layout>
  );
}
