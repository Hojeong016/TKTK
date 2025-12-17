import React from 'react';
import useStore from '../store/useStore';
import { useCreateItem } from '../api/useFetch';
import Toast from './Toast';
import useToast from '../hooks/useToast';

/**
 * 티어 값을 서버 형식으로 변환 (프론트: "Ace" -> 서버: "ACE")
 */
const toServerTier = (tier) => {
  if (!tier) return '';
  return String(tier).toUpperCase();
};

/**
 * AddMemberModal - 새 멤버 추가 모달
 * 직접 입력 또는 YAML 파일 업로드 지원
 */
export default function AddMemberModal({ isOpen, onClose }) {
  const { rightsConfig } = useStore();
  const createMutation = useCreateItem();
  const { toast, showToast } = useToast();
  const [inputMode, setInputMode] = React.useState('form'); // 'form' or 'yaml'
  const [formData, setFormData] = React.useState({
    name: '',
    koreaname: '',
    discordname: '',
    gamename: '',
    tier: '',
    rights: [],
    birthday: '',
    soopUrl: '',
    chzzkUrl: '',
    tktkTier: '',  // TKTK 티어 추가
    tktkTierLevel: '' // 상/중/하 선택
  });
  const [yamlContent, setYamlContent] = React.useState('');
  const [fileName, setFileName] = React.useState('');

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setYamlContent(content);

      // YAML 파싱 시도 (간단한 예시, 실제로는 yaml 라이브러리 사용 권장)
      try {
        // TODO: yaml 라이브러리로 파싱
        console.log('YAML content:', content);
      } catch (error) {
        console.error('YAML parsing error:', error);
        showToast('error', 'YAML 파일 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputMode === 'form') {
      // 폼 데이터를 서버 DTO 형식으로 변환
      const newMemberData = {
        name: formData.name,
        info: {
          discordname: formData.discordname,
          gamename: formData.gamename,
          koreaname: formData.koreaname,
          birthday: formData.birthday,
          description: ''
        },
        discord: {
          right: formData.rights,
          discordTier: null,
          join: new Date().toISOString()
        },
        game: {
          tier: toServerTier(formData.tier), // 프론트: "Ace" -> 서버: "ACE"
          gamename: formData.gamename
        },
        streaming: {
          soop: formData.soopUrl,
          chzzk: formData.chzzkUrl
        },
        memberofthestaff: {
          name: ''
        },
        tktkTier: formData.tktkTier,  // TKTK 티어 이름 추가
        tktkTierLevel: formData.tktkTierLevel
      };

      // API 호출
      createMutation.mutate(newMemberData, {
        onSuccess: () => {
          showToast('success', '멤버가 성공적으로 추가되었습니다.');
          handleClose();
        },
        onError: (error) => {
          console.error('Failed to create member:', error);
          showToast('error', `멤버 추가에 실패했습니다: ${error.message}`);
        },
      });
    } else {
      // YAML 모드
      // TODO: YAML 파싱 후 API 호출
      console.log('Submitting YAML data:', yamlContent);
      showToast('info', 'YAML 파일 업로드 기능은 추후 구현 예정입니다.');
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      koreaname: '',
      discordname: '',
      gamename: '',
      tier: '',
      rights: [],
      birthday: '',
      soopUrl: '',
      chzzkUrl: '',
      tktkTier: '',
      tktkTierLevel: ''
    });
    setYamlContent('');
    setFileName('');
    setInputMode('form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">새 멤버 추가</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${inputMode === 'form' ? 'active' : ''}`}
            onClick={() => setInputMode('form')}
          >
            직접 입력
          </button>
          <button
            className={`modal-tab ${inputMode === 'yaml' ? 'active' : ''}`}
            onClick={() => setInputMode('yaml')}
          >
            YAML 파일
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {inputMode === 'form' ? (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">이름 *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="discordname">디스코드 닉네임</label>
                <input
                  id="discordname"
                  type="text"
                  value={formData.discordname}
                  onChange={(e) => handleInputChange('discordname', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gamename">게임명</label>
                <input
                  id="gamename"
                  type="text"
                  value={formData.gamename}
                  onChange={(e) => handleInputChange('gamename', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tier">티어</label>
                <select
                  id="tier"
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

              <div className="form-group">
                <label htmlFor="birthday">생일</label>
                <input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tktkTier">TKTK 티어</label>
                <select
                  id="tktkTier"
                  value={formData.tktkTier}
                  onChange={(e) => handleInputChange('tktkTier', e.target.value)}
                  className="form-select"
                >
                  <option value="">선택</option>
                  <option value="1tier">1tier</option>
                  <option value="2tier">2tier</option>
                  <option value="3tier">3tier</option>
                  <option value="4tier">4tier</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tktkTierLevel">TKTK 티어 레벨</label>
                <select
                  id="tktkTierLevel"
                  value={formData.tktkTierLevel}
                  onChange={(e) => handleInputChange('tktkTierLevel', e.target.value)}
                  className="form-select"
                  disabled={!formData.tktkTier}
                >
                  <option value="">상/중/하 선택</option>
                  <option value="UPPER">상</option>
                  <option value="MID">중</option>
                  <option value="LOW">하</option>
                </select>
              </div>

              <div className="form-group form-group-full">
                <label>권한 (복수 선택 가능)</label>
                <div className="rights-checkboxes-modal">
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

              <div className="form-group">
                <label htmlFor="soopUrl">Soop URL</label>
                <input
                  id="soopUrl"
                  type="url"
                  value={formData.soopUrl}
                  onChange={(e) => handleInputChange('soopUrl', e.target.value)}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="chzzkUrl">Chzzk URL</label>
                <input
                  id="chzzkUrl"
                  type="url"
                  value={formData.chzzkUrl}
                  onChange={(e) => handleInputChange('chzzkUrl', e.target.value)}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : (
            <div className="yaml-upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleFileUpload}
                  id="yaml-file-input"
                  className="file-input"
                />
                <label htmlFor="yaml-file-input" className="file-label">
                  <div className="upload-icon">📄</div>
                  <div className="upload-text">
                    {fileName ? fileName : 'YAML 파일을 선택하세요'}
                  </div>
                  <div className="upload-hint">
                    또는 파일을 여기에 드래그하세요
                  </div>
                </label>
              </div>

              {yamlContent && (
                <div className="yaml-preview">
                  <h4>파일 미리보기</h4>
                  <pre className="yaml-content">{yamlContent}</pre>
                </div>
              )}

              <div className="yaml-format-hint">
                <strong>YAML 형식 예시:</strong>
                <pre className="format-example">{`name: PlayerName
info:
  koreaname: 한글이름
  discordname: discord#1234
  gamename: GameName
  birthday: 1990-01-01
game:
  tier: Master
  gamename: GameName
discord:
  right: member
streaming:
  soop: https://soop.url
  chzzk: https://chzzk.url`}</pre>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel-modal"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit-modal"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
    <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </>
  );
}
