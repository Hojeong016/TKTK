import React from 'react';
import useStore from '../store/useStore';
import '../styles/components.css';

/**
 * EditMemberModal - 멤버 정보 수정 모달
 */
export default function EditMemberModal({
  open,
  member,
  onClose,
  onSave,
  isSaving = false
}) {
  const { rightsConfig } = useStore();
  const [formData, setFormData] = React.useState({
    discordname: '',
    birthday: '',
    rights: [],
    tier: '',
    soopUrl: '',
    chzzkUrl: '',
    staffName: ''
  });

  // member가 변경되면 폼 데이터 초기화
  React.useEffect(() => {
    if (open && member) {
      const rightValue = member.discord?.right || [];
      const rights = Array.isArray(rightValue) ? rightValue : [rightValue];

      // birthday 날짜 형식 변환 (ISO 형식이면 YYYY-MM-DD만 추출)
      let birthdayValue = member.info?.birthday || '';
      if (birthdayValue && birthdayValue.includes('T')) {
        birthdayValue = birthdayValue.split('T')[0];
      }

      // 티어 값 정규화 (서버: "ACE" -> 프론트: "Ace")
      const normalizeTier = (tier) => {
        if (!tier) return '';
        const tierStr = String(tier);
        return tierStr.charAt(0).toUpperCase() + tierStr.slice(1).toLowerCase();
      };

      setFormData({
        discordname: member.info?.discordname || '',
        birthday: birthdayValue,
        rights: rights,
        tier: normalizeTier(member.game?.tier),
        soopUrl: member.streaming?.soop?.url || member.streaming?.soop || '',
        chzzkUrl: member.streaming?.chzzk?.url || member.streaming?.chzzk || '',
        staffName: member.memberofthestaff?.name || ''
      });
    }
  }, [open, member]);

  if (!open || !member) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRightToggle = (rightValue) => {
    setFormData(prev => {
      const currentRights = prev.rights || [];
      const newRights = currentRights.includes(rightValue)
        ? currentRights.filter(r => r !== rightValue)
        : [...currentRights, rightValue];
      return { ...prev, rights: newRights };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">멤버 정보 수정</h2>
          <button className="modal-close" onClick={onClose} disabled={isSaving}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 이름 (읽기 전용) */}
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={member.name || ''}
                readOnly
                disabled
                className="form-input disabled"
              />
            </div>

            {/* Discord 닉네임 */}
            <div className="form-group">
              <label>Discord 닉네임</label>
              <input
                type="text"
                value={formData.discordname}
                onChange={(e) => handleInputChange('discordname', e.target.value)}
                className="form-input"
                placeholder="Discord 닉네임 입력"
              />
            </div>

            {/* 생일 */}
            <div className="form-group">
              <label>생일</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                className="form-input"
              />
            </div>

            {/* 권한 */}
            <div className="form-group">
              <label>권한</label>
              <div className="rights-checkboxes">
                {rightsConfig.map(rightOpt => (
                  <label key={rightOpt.key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.rights || []).includes(rightOpt.key)}
                      onChange={() => handleRightToggle(rightOpt.key)}
                    />
                    <span>{rightOpt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 게임명 (읽기 전용) */}
            <div className="form-group">
              <label>게임명</label>
              <input
                type="text"
                value={member.game?.gamename || ''}
                readOnly
                disabled
                className="form-input disabled"
              />
            </div>

            {/* 티어 */}
            <div className="form-group">
              <label>티어</label>
              <select
                value={formData.tier}
                onChange={(e) => handleInputChange('tier', e.target.value)}
                className="form-select"
              >
                <option value="">선택</option>
                <option value="Conqueror">Conqueror</option>
                <option value="Master">Master</option>
                <option value="Ace">Ace</option>
                <option value="Crown">Crown</option>
                <option value="Diamond">Diamond</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
                <option value="Unranked">Unranked</option>
              </select>
            </div>

            {/* Soop URL */}
            <div className="form-group">
              <label>Soop URL</label>
              <input
                type="url"
                value={formData.soopUrl}
                onChange={(e) => handleInputChange('soopUrl', e.target.value)}
                className="form-input"
                placeholder="https://soop.tv/..."
              />
            </div>

            {/* Chzzk URL */}
            <div className="form-group">
              <label>Chzzk URL</label>
              <input
                type="url"
                value={formData.chzzkUrl}
                onChange={(e) => handleInputChange('chzzkUrl', e.target.value)}
                className="form-input"
                placeholder="https://chzzk.naver.com/..."
              />
            </div>

            {/* 담당 스태프 */}
            <div className="form-group">
              <label>담당 스태프</label>
              <input
                type="text"
                value={formData.staffName}
                onChange={(e) => handleInputChange('staffName', e.target.value)}
                className="form-input"
                placeholder="담당 스태프 이름 입력"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel-modal"
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit-modal"
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
