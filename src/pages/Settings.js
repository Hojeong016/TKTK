import React from 'react';
import Layout from '../components/Layout';
import MemberManagementTable from '../components/MemberManagementTable';
import '../styles/settings.css';

export default function Settings() {
  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">멤버 관리 (관리자 전용)</p>
        </div>

        <MemberManagementTable />
      </div>
    </Layout>
  );
}
