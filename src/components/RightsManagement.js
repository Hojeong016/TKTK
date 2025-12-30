import React from 'react';
import useStore from '../store/useStore';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';

/**
 * RightsManagement - 권한 설정 CRUD 관리
 */
export default function RightsManagement() {
  const { rightsConfig, addRight, updateRight, deleteRight } = useStore();
  const [editingId, setEditingId] = React.useState(null);
  const [editData, setEditData] = React.useState(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newRight, setNewRight] = React.useState({
    key: '',
    label: '',
    color: '#000000',
    bgColor: '#ffffff',
    description: ''
  });
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const { toast, showToast } = useToast();

  const handleEdit = (right) => {
    setEditingId(right.id);
    setEditData({ ...right });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (editData) {
      try {
        await updateRight(editingId, editData);
        setEditingId(null);
        setEditData(null);
        showToast('success', '권한이 수정되었습니다.');
      } catch (error) {
        console.error('Failed to update right', error);
        showToast('error', '권한 수정에 실패했습니다.');
      }
    }
  };

  const handleDelete = (id) => {
    const target = rightsConfig.find((right) => right.id === id);
    setDeleteTarget(target || null);
  };

  const handleAddRight = async (e) => {
    e.preventDefault();
    if (!newRight.key || !newRight.label) {
      showToast('error', '키와 라벨은 필수입니다.');
      return;
    }
    try {
      await addRight(newRight);
      setNewRight({
        key: '',
        label: '',
        color: '#000000',
        bgColor: '#ffffff',
        description: ''
      });
      setShowAddModal(false);
      showToast('success', '새 권한이 추가되었습니다.');
    } catch (error) {
      console.error('Failed to add right', error);
      showToast('error', '권한 추가에 실패했습니다.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRight(deleteTarget.id);
      showToast('success', '권한이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete right', error);
      showToast('error', '권한 삭제에 실패했습니다.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="rights-management">
      <div className="table-controls">
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>권한 관리</h3>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 권한 추가
        </button>
      </div>

      <div className="table-wrapper" style={{ marginTop: '20px' }}>
        <table className="management-table">
          <thead>
            <tr>
              <th>키</th>
              <th>라벨</th>
              <th>텍스트 색상</th>
              <th>배경 색상</th>
              <th>설명</th>
              <th style={{ width: '80px' }}>미리보기</th>
              <th style={{ width: '150px' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {rightsConfig.map((right) => {
              const isEditing = editingId === right.id;
              const data = isEditing ? editData : right;

              return (
                <tr key={right.id} className={isEditing ? 'editing-row' : ''}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="table-input"
                        value={data.key}
                        onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                      />
                    ) : (
                      <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                        {right.key}
                      </code>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="table-input"
                        value={data.label}
                        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                      />
                    ) : (
                      right.label
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={data.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="table-input"
                          value={data.color}
                          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                          style={{ width: '80px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', background: right.color, border: '1px solid #e5e7eb', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{right.color}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={data.bgColor}
                          onChange={(e) => setEditData({ ...editData, bgColor: e.target.value })}
                          style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="table-input"
                          value={data.bgColor}
                          onChange={(e) => setEditData({ ...editData, bgColor: e.target.value })}
                          style={{ width: '80px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', background: right.bgColor, border: '1px solid #e5e7eb', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{right.bgColor}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="table-input"
                        value={data.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{right.description || '—'}</span>
                    )}
                  </td>
                  <td>
                    <div
                      className="badge badge-small"
                      style={{
                        color: data.color,
                        backgroundColor: data.bgColor,
                        display: 'inline-block'
                      }}
                    >
                      {data.label}
                    </div>
                  </td>
                  <td className="action-cell">
                    {isEditing ? (
                      <div className="action-buttons">
                        <button className="btn-save" onClick={handleSaveEdit}>저장</button>
                        <button className="btn-cancel" onClick={handleCancelEdit}>취소</button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(right)}>수정</button>
                        <button className="btn-delete" onClick={() => handleDelete(right.id)}>삭제</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">새 권한 추가</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddRight} className="modal-body">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label htmlFor="right-key">키 (영문, 소문자) *</label>
                  <input
                    id="right-key"
                    type="text"
                    className="form-input"
                    value={newRight.key}
                    onChange={(e) => setNewRight({ ...newRight, key: e.target.value })}
                    placeholder="예: vip, moderator"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="right-label">라벨 (표시명) *</label>
                  <input
                    id="right-label"
                    type="text"
                    className="form-input"
                    value={newRight.label}
                    onChange={(e) => setNewRight({ ...newRight, label: e.target.value })}
                    placeholder="예: VIP, 운영자"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="right-color">텍스트 색상</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="color"
                      value={newRight.color}
                      onChange={(e) => setNewRight({ ...newRight, color: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      id="right-color"
                      type="text"
                      className="form-input"
                      value={newRight.color}
                      onChange={(e) => setNewRight({ ...newRight, color: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="right-bgcolor">배경 색상</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="color"
                      value={newRight.bgColor}
                      onChange={(e) => setNewRight({ ...newRight, bgColor: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      id="right-bgcolor"
                      type="text"
                      className="form-input"
                      value={newRight.bgColor}
                      onChange={(e) => setNewRight({ ...newRight, bgColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="right-description">설명</label>
                  <input
                    id="right-description"
                    type="text"
                    className="form-input"
                    value={newRight.description}
                    onChange={(e) => setNewRight({ ...newRight, description: e.target.value })}
                    placeholder="권한에 대한 설명"
                  />
                </div>

                <div className="form-group">
                  <label>미리보기</label>
                  <div
                    className="badge badge-small"
                    style={{
                      color: newRight.color,
                      backgroundColor: newRight.bgColor,
                      display: 'inline-block',
                      fontSize: '12px',
                      padding: '6px 12px'
                    }}
                  >
                    {newRight.label || '라벨 입력'}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowAddModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-submit-modal">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!deleteTarget}
        title="권한 삭제"
        description={`"${deleteTarget?.label || deleteTarget?.key || '해당 권한'}" 권한을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
