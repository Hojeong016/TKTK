import React from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { useFetchTiers, useFetchTierDetail } from '../api/useFetchTier';
import '../styles/tier.css';

const LEVELS = ['상', '중', '하'];
const PUBG_LEVEL_GROUPS = {
  '상': ['CONQUEROR', 'ACE', 'CHALLENGER', 'LEGEND', 'MYTHIC'],
  '중': ['MASTER', 'DIAMOND', 'PLATINUM'],
  '하': ['GOLD', 'SILVER', 'BRONZE', 'UNRANKED', 'UNKNOWN', 'NONE'],
};

const LEVEL_CODE_TO_LABEL = {
  UPPER: '상',
  MID: '중',
  LOW: '하',
};

const mapMemberToLevel = (member) => {
  if (member.tktkTierLevel) {
    const code = member.tktkTierLevel.toUpperCase();
    return LEVEL_CODE_TO_LABEL[code] || member.tktkTierLevel;
  }
  if (member.levelCode) {
    const code = member.levelCode.toUpperCase();
    return LEVEL_CODE_TO_LABEL[code] || member.levelCode;
  }
  const pubgTier = member.pubgTier;
  if (!pubgTier) return '하';
  const normalized = pubgTier.toUpperCase();
  if (PUBG_LEVEL_GROUPS['상'].includes(normalized)) return '상';
  if (PUBG_LEVEL_GROUPS['중'].includes(normalized)) return '중';
  return '하';
};

const formatMemberLabel = (member) => {
  const baseName = member.discordname || member.gamename || member.name;
  if (!baseName) return '이름 미상';
  return member.pubgTier ? `${member.discordname } (${member.gamename})` : baseName;
};

export default function Tier() {
  const {
    data: tiers,
    isLoading: tiersLoading,
    isError: tiersError,
    error: tiersErrorDetail,
  } = useFetchTiers();
  const [selectedTierKey, setSelectedTierKey] = React.useState(null);

  const groupedTiers = React.useMemo(() => {
    if (!Array.isArray(tiers)) return [];

    const map = new Map();
    tiers.forEach((tier) => {
      const key = tier.name || tier.tierName || tier.id;
      if (!key) {
        return;
      }

      if (!map.has(key)) {
        map.set(key, {
          ...tier,
          groupKey: key,
          primaryId: tier.id,
          memberCount: tier.memberCount ?? 0,
        });
        return;
      }

      const existing = map.get(key);
      existing.memberCount = Math.max(existing.memberCount ?? 0, tier.memberCount ?? 0);
      if (!existing.primaryId) existing.primaryId = tier.id;
      if (!existing.order && tier.order) existing.order = tier.order;
      if (!existing.color && tier.color) existing.color = tier.color;
      if (!existing.description && tier.description) existing.description = tier.description;
    });

    return Array.from(map.values()).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }, [tiers]);

  React.useEffect(() => {
    if (!selectedTierKey && groupedTiers.length > 0) {
      setSelectedTierKey(groupedTiers[0].groupKey);
    }
  }, [groupedTiers, selectedTierKey]);

  const selectedTier = React.useMemo(
    () => groupedTiers.find((tier) => tier.groupKey === selectedTierKey) ?? null,
    [groupedTiers, selectedTierKey]
  );

  const {
    data: tierDetail,
    isLoading: tierDetailLoading,
    isError: tierDetailError,
    error: tierDetailErrorDetail,
  } = useFetchTierDetail(selectedTier?.primaryId);

  const tierMembers = React.useMemo(() => {
    const buckets = { 상: [], 중: [], 하: [] };
    if (!tierDetail?.members) return buckets;

    tierDetail.members.forEach((member) => {
      const level = mapMemberToLevel(member);
      buckets[level].push(member);
    });

    return buckets;
  }, [tierDetail]);

  const levelStats = React.useMemo(() => {
    const base = LEVELS.reduce((acc, level) => {
      acc[level] = null;
      return acc;
    }, {});

    if (!Array.isArray(tierDetail?.levels)) {
      return base;
    }

    tierDetail.levels.forEach((lvl) => {
      let label = lvl.levelName;
      if (!label) {
        const normalized = lvl.levelCode?.toUpperCase();
        if (normalized === 'UPPER') label = '상';
        else if (normalized === 'MID') label = '중';
        else if (normalized === 'LOW') label = '하';
      }
      if (label && LEVELS.includes(label)) {
        base[label] = {
          kills: lvl.kills ?? 0,
          deal: lvl.deal ?? 0,
          killsDeal: lvl.killsDeal ?? 0,
        };
      }
    });

    return base;
  }, [tierDetail]);

  const totalMembers = React.useMemo(() => {
    if (!selectedTier) return 0;
    if (typeof tierDetail?.memberCount === 'number') {
      return tierDetail.memberCount;
    }
    return LEVELS.reduce((sum, level) => sum + tierMembers[level].length, 0);
  }, [selectedTier, tierDetail, tierMembers]);

  const handleTierClick = (tierKey) => {
    setSelectedTierKey((prev) => (prev === tierKey ? null : tierKey));
  };

  if (tiersLoading) {
    return (
      <Layout>
        <div className="tier-page">
          <p>티어 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (tiersError) {
    return (
      <Layout>
        <div className="tier-page">
          <p>티어 목록을 가져오지 못했습니다: {tiersErrorDetail?.message || '알 수 없는 오류'}</p>
        </div>
      </Layout>
    );
  }

  const levelConfig = {
    '상': { className: 'level-upper', icon: '👑' },
    '중': { className: 'level-middle', icon: '⭐' },
    '하': { className: 'level-lower', icon: '💎' }
  };

  return (
    <Layout>
      <div className="tier-page">
        <div className="tier-header">
          <h1 className="tier-title">TKTK CLAN TIER</h1>
          <p className="tier-subtitle">TKTK 멤버 티어</p>
        </div>

        <div className="tier-instruction">
          💡 각 카드를 클릭해서 티어의 상세 정보를 확인하세요
        </div>

        <div className="tier-cards-grid">
          {groupedTiers.length > 0 ? (
            groupedTiers.map((tier, idx) => {
              const stars = '⭐️'.repeat(tier.order ?? idx + 1) || '⭐️';
              return (
                <div
                  key={tier.groupKey}
                  className={`tier-card-wrapper ${selectedTierKey === tier.groupKey ? 'active' : ''}`}
                  onClick={() => handleTierClick(tier.groupKey)}
                >
                  <StatsCard
                    title={`${tier.name?.toUpperCase() || `TIER ${idx + 1}`}`}
                    value={tier.memberCount ?? 0}
                    icon={stars}
                  />
                </div>
              );
            })
          ) : (
            <div className="tier-empty-state">등록된 티어가 없습니다.</div>
          )}
        </div>

        {selectedTier && (
          <div className="tier-members-section">
            <div className="tier-members-header">
              <span>{selectedTier?.name?.toUpperCase() || '선택한'} TIER Member</span>
              <span className="tier-members-count">총 {totalMembers}명</span>
            </div>

            {tierDetailError ? (
              <div className="tier-members-error">
                티어 상세를 불러오지 못했습니다: {tierDetailErrorDetail?.message || '알 수 없는 오류'}
              </div>
            ) : tierDetailLoading ? (
              <div className="tier-members-loading">멤버 정보를 불러오는 중...</div>
            ) : (
              <div className="level-cards-grid">
                {LEVELS.map(level => (
                  <div key={level} className="level-card">
                    <div className={`level-card-header ${levelConfig[level].className}`}>
                      <div className="level-card-title-group">
                        <span className="level-card-icon">{levelConfig[level].icon}</span>
                        <span className="level-card-title">{level}</span>
                      </div>
                      <span className="level-card-badge">{tierMembers[level].length}</span>
                    </div>

              <div className="level-card-body">
                {levelStats[level] && (
                  <div className="team-stats">
                    <div className="team-stat-item">
                      <span className="team-stat-icon">🎯</span>
                      <span className="team-stat-label">킬내기</span>
                      <span className="team-stat-value">
                        {levelStats[level].kills}
                      </span>
                    </div>
                    <div className="team-stat-item">
                      <span className="team-stat-icon">⚔️</span>
                      <span className="team-stat-label">딜내기</span>
                      <span className="team-stat-value">
                        {levelStats[level].deal}
                      </span>
                    </div>
                    <div className="team-stat-item">
                      <span className="team-stat-icon">🏆</span>
                      <span className="team-stat-label">킬딜내기</span>
                      <span className="team-stat-value">
                        {levelStats[level].killsDeal}
                      </span>
                    </div>
                  </div>
                )}

                {tierMembers[level].length > 0 ? (
                        <div className="level-members-list">
                          {tierMembers[level].map(member => (
                            <div
                              key={member.id}
                              className={`level-member-item ${levelConfig[level].className}`}
                            >
                              {formatMemberLabel(member)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="level-empty-state">멤버가 없습니다</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
