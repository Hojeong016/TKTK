import React from 'react';

/**
 * TierManagement - TKTK CLAN TIER 정보 관리
 */
export default function TierManagement() {
  return (
    <div className="tier-management">
      <div className="table-controls">
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>TKTK CLAN TIER 관리</h3>
        <button className="btn-primary">
          + 새 티어 추가
        </button>
      </div>

      <div className="table-wrapper" style={{ marginTop: '20px' }}>
        {/* 나중에 구현될 내용 */}
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            TKTK CLAN TIER 관리
          </p>
          <p style={{ fontSize: '14px' }}>
            티어 정보 관리 기능이 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
