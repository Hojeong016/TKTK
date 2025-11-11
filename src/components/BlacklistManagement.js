import React from 'react';
import { useFetchItems } from '../api/useFetch';
import {
  useFetchBlacklist,
  useWarnMember,
  useRemoveWarning,
  useBlacklistMember,
  useReleaseMember,
} from '../api/useBlacklist';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

/**
 * BlacklistManagement - 블랙리스트 및 경고 관리
 */
export default function BlacklistManagement() {
  const { data: members, isLoading, isError } = useFetchItems();
  const {
    data: blacklistEntries,
    isLoading: blacklistLoading,
    isError: blacklistError,
    error: blacklistErrorDetail,
  } = useFetchBlacklist();
  const warnMember = useWarnMember();
  const removeWarning = useRemoveWarning();
  const blacklistMember = useBlacklistMember();
  const releaseMember = useReleaseMember();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modalState, setModalState] = React.useState({
    open: false,
    mode: null,
    member: null,
  });
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  const showToast = (type, message) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  React.useEffect(() => () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
  }, []);

  const blacklistStatus = React.useMemo(() => {
    if (!Array.isArray(blacklistEntries)) return {};
    return blacklistEntries.reduce((acc, entry) => {
      const memberId =
        entry.memberId ||
        entry.member?.id ||
        entry.memberResponse?.id ||
        entry.members?.id;
      if (!memberId) return acc;

      acc[memberId] = {
        entryId: entry.id,
        status: entry.status || (entry.isBlacklisted ? 'BLACKLISTED' : 'WARNED'),
        warningCount: entry.warningCount ?? 0,
        reason: entry.reason,
      };
      return acc;
    }, {});
  }, [blacklistEntries]);


  const handleAction = (mode, member) => {
    const config = ACTION_CONFIG[mode];
    if (!config) return;

    if (config.needsDialog) {
      setModalState({
        open: true,
        mode,
        member,
      });
      return;
    }

    executeAction(mode, member, null);
  };

  const closeModal = () => {
    setModalState({
      open: false,
      mode: null,
      member: null,
    });
  };

  const executeAction = (mode, member, inputValue) => {
    if (!member || !mode) return;
    const memberId = member.id;
    const config = ACTION_CONFIG[mode] || {};
    const successMessage = config.successMessage || '처리가 완료되었습니다.';
    const errorMessage = config.errorMessage || '처리에 실패했습니다.';

    const handleSuccess = () => {
      showToast('success', successMessage);
      closeModal();
    };

    const handleError = (error) => {
      console.error(errorMessage, error);
      showToast('error', errorMessage);
    };

    switch (mode) {
      case 'warn':
        warnMember.mutate(
          { memberId, payload: { reason: inputValue || null } },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
        break;
      case 'removeWarn':
        removeWarning.mutate(
          { memberId, payload: {} },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
        break;
      case 'blacklist':
        if (!inputValue) {
          showToast('error', '사유를 입력해주세요.');
          return;
        }
        blacklistMember.mutate(
          { memberId, payload: { reason: inputValue } },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
        break;
      case 'release':
        releaseMember.mutate(
          { memberId, payload: { memo: inputValue || null } },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
        break;
      default:
        break;
    }
  };

  const handleModalConfirm = (inputValue) => {
    if (!modalState.member || !modalState.mode) return;
    executeAction(modalState.mode, modalState.member, inputValue);
  };

  // 검색 필터링
  const filteredMembers = React.useMemo(() => {
    if (!members || !Array.isArray(members)) return [];
    if (!searchTerm) return members;

    const term = searchTerm.toLowerCase();
    return members.filter(m =>
      m.name?.toLowerCase().includes(term) ||
      m.info?.discordname?.toLowerCase().includes(term) ||
      m.info?.koreaname?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  return (
    <div className="management-table-container">
      <div className="table-controls">
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>블랙리스트 관리</h3>
        <input
          type="text"
          className="search-input"
          placeholder="멤버 검색 (이름, Discord 닉네임)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '300px'
          }}
        />
      </div>

      {isLoading || blacklistLoading ? (
        <div style={{ marginTop: '20px' }}>Loading...</div>
      ) : isError || blacklistError ? (
        <div style={{ marginTop: '20px' }}>
          데이터를 불러오는 중 오류가 발생했습니다.
          <br />
          {blacklistErrorDetail?.message}
        </div>
      ) : !members || members.length === 0 ? (
        <div style={{ marginTop: '20px' }}>No members found</div>
      ) : (
        <div className="table-wrapper" style={{ marginTop: '20px' }}>
        <table className="management-table">
          <thead>
            <tr>
              <th style={{ display: 'none' }}>ID</th>
              <th>Discord 닉네임</th>
              <th>한글명</th>
              <th>게임명</th>
              <th style={{ textAlign: 'center' }}>경고 횟수</th>
              <th style={{ textAlign: 'center' }}>블랙리스트</th>
              <th style={{ width: '300px' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const statusInfo = blacklistStatus[member.id] || { status: 'NORMAL' };
              const warningCount = statusInfo.warningCount || 0;
              const memberStatus = statusInfo.status || 'NORMAL';

              return (
                <tr key={member.id}>
                  <td style={{ display: 'none' }}>{member.id}</td>
                  <td>{member.info?.discordname || '—'}</td>
                  <td>{member.info?.koreaname || '—'}</td>
                  <td>{member.game?.gamename || member.info?.gamename || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="warning-count-display"
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        background: warningCount >= 3 ? '#fecaca' :
                                   warningCount >= 2 ? '#fed7aa' :
                                   warningCount >= 1 ? '#fef3c7' : '#f3f4f6',
                        color: warningCount >= 3 ? '#dc2626' :
                               warningCount >= 2 ? '#ea580c' :
                               warningCount >= 1 ? '#d97706' : '#6b7280'
                      }}
                    >
                      {warningCount}회
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {memberStatus === 'BLACKLISTED' ? (
                      <span
                        className="blacklist-badge"
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: '#fecaca',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        🚫 등록됨
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      {memberStatus === 'BLACKLISTED' ? (
                        <button
                          className="btn-save"
                          onClick={() => handleAction('release', member)}
                        >
                          해제
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-delete"
                            onClick={() => handleAction('blacklist', member)}
                          >
                            등록
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleAction('warn', member)}
                          >
                            경고
                          </button>
                          {warningCount > 0 && (
                            <button
                              className="btn-cancel"
                              onClick={() => handleAction('removeWarn', member)}
                            >
                              차감
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <ActionModal
        state={modalState}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
      <Toast open={!!toast} message={toast?.message} type={toast?.type} />
    </div>
  );
}

const ACTION_CONFIG = {
  warn: {
    needsDialog: false,
    confirmLabel: '경고 부여',
    title: () => '경고 부여',
    description: (name) => `“${name}”에게 경고를 부여하시겠습니까?`,
    requireInput: false,
    successMessage: '경고가 부여되었습니다.',
    errorMessage: '경고 부여에 실패했습니다.',
  },
  removeWarn: {
    needsDialog: false,
    confirmLabel: '경고 차감',
    title: () => '경고 차감',
    description: (name) => `“${name}”의 경고를 1회 차감하시겠습니까?`,
    requireInput: false,
    successMessage: '경고가 차감되었습니다.',
    errorMessage: '경고 차감에 실패했습니다.',
  },
  blacklist: {
    needsDialog: true,
    confirmLabel: '블랙리스트 등록',
    title: (name) => '블랙리스트 등록',
    description: (name) => `“${name}”의 블랙리스트 사유를 입력하세요.`,
    requireInput: true,
    inputLabel: '블랙리스트 사유',
    placeholder: '예: 팀킬 및 비매너 행위',
    successMessage: '블랙리스트에 등록되었습니다.',
    errorMessage: '블랙리스트 등록에 실패했습니다.',
  },
  release: {
    needsDialog: false,
    confirmLabel: '해제',
    title: () => '블랙리스트 해제',
    description: (name) => `“${name}”을(를) 블랙리스트에서 해제하시겠습니까?`,
    requireInput: false,
    successMessage: '블랙리스트에서 해제되었습니다.',
    errorMessage: '해제에 실패했습니다.',
  },
};

function ActionModal({ state, onClose, onConfirm }) {
  if (!state.open || !state.mode || !state.member) return null;
  const config = ACTION_CONFIG[state.mode];
  const name = state.member.name || state.member.info?.discordname || '해당 멤버';

  return (
    <ConfirmModal
      open={state.open}
      title={config.title(name)}
      description={config.description(name)}
      showInput={config.requireInput}
      inputLabel={config.inputLabel}
      inputPlaceholder={config.placeholder}
      confirmLabel={config.confirmLabel}
      autoClose={config.autoClose}
      autoCloseDuration={2000}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
