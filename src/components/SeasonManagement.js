import React, { useState, useEffect, useCallback } from 'react';
import seasonService from '../api/seasonService';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

const SEASON_STATUS = {
  UPCOMING: { label: '예정', className: 'season-mgmt-upcoming' },
  ACTIVE: { label: '진행 중', className: 'season-mgmt-active' },
  ENDED: { label: '종료', className: 'season-mgmt-ended' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const toDatetimeLocal = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.slice(0, 16);
};

export default function SeasonManagement() {
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = React.useRef(null);

  // 모달 상태
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // season object or null
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', description: '', onConfirm: null });

  // 폼 상태
  const [form, setForm] = useState({ seasonName: '', startDate: '', endDate: '', description: '' });

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const fetchSeasons = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await seasonService.getAdminSeasons();
      setSeasons(Array.isArray(list) ? list : []);
    } catch {
      showToast('error', '시즌 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  // 생성
  const openCreateModal = () => {
    setForm({ seasonName: '', startDate: '', endDate: '', description: '' });
    setCreateModal(true);
  };

  const handleCreate = async () => {
    if (!form.seasonName.trim() || !form.startDate) {
      showToast('error', '시즌 이름과 시작일은 필수입니다.');
      return;
    }
    try {
      await seasonService.createSeason({
        seasonName: form.seasonName.trim(),
        startDate: form.startDate,
        endDate: form.endDate || null,
        description: form.description.trim() || null,
      });
      showToast('success', '시즌이 생성되었습니다.');
      setCreateModal(false);
      fetchSeasons();
    } catch {
      showToast('error', '시즌 생성에 실패했습니다.');
    }
  };

  // 수정
  const openEditModal = (season) => {
    setForm({
      seasonName: season.seasonName || '',
      startDate: toDatetimeLocal(season.startDate) || '',
      endDate: toDatetimeLocal(season.endDate) || '',
      description: season.description || '',
    });
    setEditModal(season);
  };

  const handleEdit = async () => {
    if (!editModal) return;
    if (!form.seasonName.trim() || !form.startDate) {
      showToast('error', '시즌 이름과 시작일은 필수입니다.');
      return;
    }
    try {
      await seasonService.updateSeason(editModal.seasonId, {
        seasonName: form.seasonName.trim(),
        startDate: form.startDate,
        endDate: form.endDate || null,
        description: form.description.trim() || null,
      });
      showToast('success', '시즌이 수정되었습니다.');
      setEditModal(null);
      fetchSeasons();
    } catch {
      showToast('error', '시즌 수정에 실패했습니다.');
    }
  };

  // 시작
  const handleStart = (season) => {
    setConfirmModal({
      open: true,
      title: '시즌을 시작하시겠습니까?',
      description: '현재 활성 시즌이 있으면 자동 종료되고, 기존 랭킹이 아카이빙 후 초기화됩니다. 이 작업은 되돌릴 수 없습니다.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await seasonService.startSeason(season.seasonId);
          showToast('success', `${season.seasonName} 시즌이 시작되었습니다.`);
          fetchSeasons();
        } catch {
          showToast('error', '시즌 시작에 실패했습니다.');
        }
      },
    });
  };

  // 종료
  const handleEnd = (season) => {
    setConfirmModal({
      open: true,
      title: '시즌을 종료하시겠습니까?',
      description: '현재 랭킹이 아카이빙되고, 랭킹 데이터가 초기화됩니다.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await seasonService.endSeason(season.seasonId);
          showToast('success', `${season.seasonName} 시즌이 종료되었습니다.`);
          fetchSeasons();
        } catch {
          showToast('error', '시즌 종료에 실패했습니다.');
        }
      },
    });
  };

  // 삭제
  const handleDelete = (season) => {
    setConfirmModal({
      open: true,
      title: '시즌을 삭제하시겠습니까?',
      description: `"${season.seasonName}"을(를) 삭제합니다. 이 작업은 되돌릴 수 없습니다.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await seasonService.deleteSeason(season.seasonId);
          showToast('success', '시즌이 삭제되었습니다.');
          fetchSeasons();
        } catch {
          showToast('error', '시즌 삭제에 실패했습니다.');
        }
      },
    });
  };

  const renderSeasonCard = (season) => {
    const status = SEASON_STATUS[season.status] || SEASON_STATUS.UPCOMING;
    return (
      <div className={`season-mgmt-card ${status.className}`} key={season.seasonId}>
        <div className="season-mgmt-card-header">
          <div className="season-mgmt-card-title">
            <span className="season-mgmt-card-name">{season.seasonName}</span>
            <span className={`season-mgmt-badge ${status.className}`}>{status.label}</span>
          </div>
          <span className="season-mgmt-card-number">#{season.seasonNumber}</span>
        </div>
        <div className="season-mgmt-card-body">
          <div className="season-mgmt-card-dates">
            {formatDate(season.startDate)} ~ {formatDate(season.endDate)}
          </div>
          {season.description && (
            <div className="season-mgmt-card-desc">{season.description}</div>
          )}
        </div>
        <div className="season-mgmt-card-actions">
          {season.status === 'UPCOMING' && (
            <>
              <button className="btn-edit" onClick={() => openEditModal(season)}>수정</button>
              <button className="btn-save" onClick={() => handleStart(season)}>시작하기</button>
              <button className="btn-delete" onClick={() => handleDelete(season)}>삭제</button>
            </>
          )}
          {season.status === 'ACTIVE' && (
            <button className="btn-delete" onClick={() => handleEnd(season)}>종료하기</button>
          )}
          {season.status === 'ENDED' && (
            <span className="season-mgmt-archived-label">아카이빙 완료</span>
          )}
        </div>
      </div>
    );
  };

  const renderFormModal = (isEdit) => {
    const isOpen = isEdit ? !!editModal : createModal;
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={() => isEdit ? setEditModal(null) : setCreateModal(false)}>
        <div className="modal-content season-form-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{isEdit ? '시즌 수정' : '새 시즌 만들기'}</h2>
            <button className="modal-close" onClick={() => isEdit ? setEditModal(null) : setCreateModal(false)}>
              &#10005;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label>시즌 이름 *</label>
                <input
                  className="form-input"
                  value={form.seasonName}
                  onChange={(e) => setForm((f) => ({ ...f, seasonName: e.target.value }))}
                  placeholder="예: 시즌 3"
                />
              </div>
              <div className="form-group">
                <label>시작 예정일 *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>종료 예정일</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <div className="form-group form-group-full">
                <label>설명</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="시즌에 대한 설명 (선택)"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel-modal" onClick={() => isEdit ? setEditModal(null) : setCreateModal(false)}>
                취소
              </button>
              <button className="btn-submit-modal" onClick={isEdit ? handleEdit : handleCreate}>
                {isEdit ? '수정하기' : '만들기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="management-table-container">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="table-controls">
        <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>시즌 목록</h2>
        <button className="btn-primary" onClick={openCreateModal}>
          + 새 시즌 만들기
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state" style={{ padding: '40px 20px' }}>
          <span className="loading-spinner" style={{
            width: 32, height: 32, borderRadius: '9999px',
            border: '3px solid #e2e8f0', borderTopColor: '#2563eb',
            animation: 'spin 0.8s linear infinite', display: 'inline-block'
          }} />
          <p>시즌 목록을 불러오는 중…</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <p>등록된 시즌이 없습니다.</p>
          <p>위의 "새 시즌 만들기" 버튼으로 첫 시즌을 만들어보세요.</p>
        </div>
      ) : (
        <div className="season-mgmt-list">
          {seasons.map(renderSeasonCard)}
        </div>
      )}

      <div className="season-mgmt-warning">
        &#9888;&#65039; 시즌 시작 시 기존 활성 시즌이 자동 종료되고, 랭킹이 아카이빙 후 초기화됩니다.
      </div>

      {renderFormModal(false)}
      {renderFormModal(true)}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
