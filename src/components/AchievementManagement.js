import React, { useState } from 'react';
import AchievementModal from './AchievementModal';
import '../styles/achievement-management.css';

export default function AchievementManagement({ version }) {
  const [achievements, setAchievements] = useState([
    // 더미 데이터
    {
      id: 1,
      achievementCode: 'chicken_master',
      name: '치킨 마스터',
      description: '10회 이상 우승',
      category: 'combat',
      rarity: 'rare',
      conditionType: 'total',
      conditionField: 'wins',
      conditionOperator: '>=',
      conditionValue: 10,
      badgeImage: 'https://via.placeholder.com/100/667eea/ffffff?text=🏆',
      points: 50,
      isActive: true
    },
    {
      id: 2,
      achievementCode: 'killer_instinct',
      name: '킬러 본능',
      description: '총 300킬 달성',
      category: 'combat',
      rarity: 'epic',
      conditionType: 'total',
      conditionField: 'kills',
      conditionOperator: '>=',
      conditionValue: 300,
      badgeImage: 'https://via.placeholder.com/100/9333ea/ffffff?text=⚔️',
      points: 100,
      isActive: true
    },
    {
      id: 3,
      achievementCode: 'betrayer',
      name: '배신자',
      description: '팀킬 1회... 실수였겠지?',
      category: 'dishonor',
      rarity: 'common',
      conditionType: 'total',
      conditionField: 'teamKills',
      conditionOperator: '>=',
      conditionValue: 1,
      badgeImage: 'https://via.placeholder.com/100/ef4444/ffffff?text=💀',
      points: -10,
      isActive: true
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    setSelectedAchievement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('이 업적을 삭제하시겠습니까?')) {
      setAchievements(achievements.filter(a => a.id !== id));
    }
  };

  const handleToggle = (id) => {
    setAchievements(achievements.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleSave = (achievementData) => {
    if (selectedAchievement) {
      // 수정
      setAchievements(achievements.map(a =>
        a.id === selectedAchievement.id ? { ...achievementData, id: a.id } : a
      ));
    } else {
      // 추가
      setAchievements([...achievements, { ...achievementData, id: Date.now(), completionRate: 0 }]);
    }
    setIsModalOpen(false);
  };

  // 필터링
  const filteredAchievements = achievements.filter(a => {
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (filterRarity !== 'all' && a.rarity !== filterRarity) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryLabel = (category) => {
    const labels = {
      combat: '전투',
      survival: '생존',
      support: '서포트',
      special: '특수',
      dishonor: '불명예'
    };
    return labels[category] || category;
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary'
    };
    return labels[rarity] || rarity;
  };

  return (
    <div className="achievement-management">
      <div className="management-header">
        <div className="header-left">
          <h2>업적 관리</h2>
          <p className="subtitle">게임 업적을 추가하고 관리합니다</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          + 새 업적 추가
        </button>
      </div>

      {/* 필터/검색 */}
      <div className="filters">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">전체 카테고리</option>
          <option value="combat">전투</option>
          <option value="survival">생존</option>
          <option value="support">서포트</option>
          <option value="special">특수</option>
          <option value="dishonor">불명예</option>
        </select>

        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="filter-select"
        >
          <option value="all">전체 희귀도</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>

        <input
          type="text"
          placeholder="업적 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 통계 카드 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">전체 업적</div>
          <div className="stat-value">{achievements.length}개</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">활성 업적</div>
          <div className="stat-value">{achievements.filter(a => a.isActive).length}개</div>
        </div>
      </div>

      {/* 업적 카드 그리드 */}
      <div className="achievements-grid">
        {filteredAchievements.length === 0 ? (
          <div className="empty-achievements">
            <p>업적이 없습니다</p>
          </div>
        ) : (
          filteredAchievements.map(achievement => (
            <div key={achievement.id} className="achievement-card-item">
              {/* 배지 이미지 */}
              <div className="card-badge">
                {achievement.badgeImage ? (
                  <img src={achievement.badgeImage} alt={achievement.name} />
                ) : (
                  <div className="badge-placeholder">
                    {achievement.achievementCode.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* 업적 정보 */}
              <div className="card-content">
                <div className="card-header">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <span className={`rarity-badge ${achievement.rarity}`}>
                    {getRarityLabel(achievement.rarity)}
                  </span>
                </div>

                <p className="achievement-description">{achievement.description}</p>

                <div className="card-info">
                  <span className={`category-badge ${achievement.category}`}>
                    {getCategoryLabel(achievement.category)}
                  </span>
                  <code className="condition-code">
                    {achievement.conditionField} {achievement.conditionOperator} {achievement.conditionValue}
                  </code>
                  <span className={`points ${achievement.points < 0 ? 'negative' : ''}`}>
                    {achievement.points > 0 ? '+' : ''}{achievement.points}pt
                  </span>
                </div>
              </div>

              {/* 카드 액션 */}
              <div className="card-actions">
                <div className="status-toggle">
                  <span className="status-label">상태</span>
                  <button
                    className={`toggle-switch ${achievement.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggle(achievement.id)}
                    title={achievement.isActive ? '활성' : '비활성'}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(achievement)}
                  >
                    수정
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(achievement.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
