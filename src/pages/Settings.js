import React from 'react';
import Layout from '../components/Layout';
import MemberManagementTable from '../components/MemberManagementTable';
import RightsManagement from '../components/RightsManagement';
import '../styles/settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState('members'); // 'members' or 'rights'

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">관리자 설정 패널</p>
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
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {activeTab === 'members' && <MemberManagementTable />}
          {activeTab === 'rights' && <RightsManagement />}
        </div>
      </div>
    </Layout>
  );
}
