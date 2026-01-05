import React, { useState } from 'react';
import AchievementCard from './AchievementCard';
import '../styles/achievement-modal.css';

export default function AchievementModal({ achievement, onClose, onSave }) {
  const [formData, setFormData] = useState(achievement || {
    achievementCode: '',
    name: '',
    description: '',
    category: 'combat',
    rarity: 'common',
    conditionType: 'total',
    conditionField: 'kills',
    conditionOperator: '>=',
    conditionValue: 10,
    badgeImage: '',
    points: 10,
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.achievementCode || !formData.name || !formData.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Base64로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, badgeImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{achievement ? '업적 수정' : '새 업적 추가'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-sections">
            {/* 기본 정보 */}
            <section className="form-section">
              <h3>기본 정보</h3>
              <div className="form-group">
                <label>업적 코드 *</label>
                <input
                  type="text"
                  placeholder="예: chicken_master"
                  value={formData.achievementCode}
                  onChange={(e) => handleChange('achievementCode', e.target.value)}
                  required
                />
                <small>영문, 숫자, 언더스코어만 사용 (고유값)</small>
              </div>

              <div className="form-group">
                <label>업적 이름 *</label>
                <input
                  type="text"
                  placeholder="예: 치킨 마스터"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>설명 *</label>
                <textarea
                  placeholder="업적 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </section>

            {/* 분류 */}
            <section className="form-section">
              <h3>분류</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="combat">전투</option>
                    <option value="survival">생존</option>
                    <option value="support">서포트</option>
                    <option value="special">특수</option>
                    <option value="dishonor">불명예</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>희귀도</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => handleChange('rarity', e.target.value)}
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 달성 조건 */}
            <section className="form-section">
              <h3>달성 조건</h3>

              <div className="form-group">
                <label>조건 타입</label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => handleChange('conditionType', e.target.value)}
                >
                  <option value="total">누적 통계</option>
                  <option value="single_match">단일 경기</option>
                  <option value="streak">연속 기록</option>
                </select>
                <small>
                  {formData.conditionType === 'total' && '전체 경기에서 누적된 통계'}
                  {formData.conditionType === 'single_match' && '한 경기에서 달성'}
                  {formData.conditionType === 'streak' && '연속으로 달성'}
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>통계 필드</label>
                  <select
                    value={formData.conditionField}
                    onChange={(e) => handleChange('conditionField', e.target.value)}
                  >
                    <optgroup label="전투">
                      <option value="kills">킬</option>
                      <option value="deaths">데스</option>
                      <option value="assists">어시스트</option>
                      <option value="damageDealt">데미지</option>
                      <option value="headshotKills">헤드샷</option>
                    </optgroup>
                    <optgroup label="순위/생존">
                      <option value="wins">우승</option>
                      <option value="top10">TOP10</option>
                      <option value="timeSurvived">생존 시간</option>
                    </optgroup>
                    <optgroup label="서포트">
                      <option value="revives">부활</option>
                      <option value="DBNOs">기절</option>
                      <option value="heals">힐 사용</option>
                      <option value="boosts">부스터 사용</option>
                    </optgroup>
                    <optgroup label="특수">
                      <option value="roadKills">차량 킬</option>
                      <option value="vehicleDestroys">차량 파괴</option>
                      <option value="swimDistance">수영 거리</option>
                      <option value="walkDistance">걷기 거리</option>
                      <option value="rideDistance">탑승 거리</option>
                      <option value="longestKill">최장거리 킬</option>
                      <option value="weaponsAcquired">무기 습득</option>
                      <option value="teamKills">팀킬</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label>연산자</label>
                  <select
                    value={formData.conditionOperator}
                    onChange={(e) => handleChange('conditionOperator', e.target.value)}
                  >
                    <option value=">=">&gt;= (이상)</option>
                    <option value="<=">&lt;= (이하)</option>
                    <option value="==">=== (같음)</option>
                    <option value=">">&gt; (초과)</option>
                    <option value="<">&lt; (미만)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>목표 값</label>
                  <input
                    type="number"
                    value={formData.conditionValue}
                    onChange={(e) => handleChange('conditionValue', parseInt(e.target.value))}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="condition-preview">
                <strong>조건:</strong>{' '}
                <code>
                  {formData.conditionField} {formData.conditionOperator} {formData.conditionValue}
                </code>
              </div>
            </section>

            {/* 표시 설정 */}
            <section className="form-section">
              <h3>표시 설정</h3>
              <div className="form-group">
                <label>배지 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="badge-image-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="badge-image-upload" className="image-upload-box">
                  {formData.badgeImage ? (
                    <div className="image-preview-wrapper">
                      <img
                        src={formData.badgeImage}
                        alt="배지 미리보기"
                        className="uploaded-image"
                      />
                      <div className="image-overlay">
                        <span>클릭하여 변경</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleChange('badgeImage', '');
                        }}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="upload-text">클릭하여 이미지 업로드</span>
                      <span className="upload-hint">5MB 이하, JPG/PNG/GIF</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="form-group">
                <label>포인트</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleChange('points', parseInt(e.target.value))}
                />
                <small>음수 가능 (불명예 업적)</small>
              </div>
            </section>

            {/* 옵션 */}
            <section className="form-section">
              <h3>옵션</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                  활성화
                </label>
              </div>
            </section>

            {/* 미리보기 */}
            <section className="form-section">
              <h3>미리보기</h3>
              <div className="preview-container">
                <AchievementCard
                  achievement={{
                    id: 'preview',
                    name: formData.name || '업적 이름',
                    description: formData.description || '업적 설명',
                    rarity: formData.rarity,
                    icon: formData.badgeImage,
                    unlocked: false,
                    progress: 5,
                    target: formData.conditionValue
                  }}
                />
              </div>
            </section>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-save">
              {achievement ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
