import React from 'react';
import { useFetchItems } from '../api/useFetch';
import { useFetchTiers } from '../api/useFetchTier';
import tierService from '../api/tierService';
import memberService from '../api/memberService';
import Toast from './Toast';
import useToast from '../hooks/useToast';

const LEVELS = ['상', '중', '하'];
const LEVEL_CODE_BY_LABEL = {
  '상': 'UPPER',
  '중': 'MID',
  '하': 'LOW',
};
const LEVEL_CODE_TO_LABEL = {
  UPPER: '상',
  MID: '중',
  LOW: '하',
};
const SCORE_TYPES = ['킬내기', '딜내기', '킬딜내기'];
const SCORE_FIELD_MAP = {
  '킬내기': 'kills',
  '딜내기': 'deal',
  '킬딜내기': 'killsDeal',
};
const TIER_OPTIONS = ['1tier', '2tier', '3tier', '4tier'];

export default function TierManagement() {
  const { data: members, isLoading: membersLoading } = useFetchItems();
  const {
    data: tierList,
    isLoading: tiersLoading,
    isError: tiersError,
    error: tiersErrorDetail,
  } = useFetchTiers();
  const [teamScores, setTeamScores] = React.useState({});
  const [scoresLoading, setScoresLoading] = React.useState(true);
  const [scoresError, setScoresError] = React.useState(null);
  const [editingKey, setEditingKey] = React.useState(null);
  const [editValue, setEditValue] = React.useState('');
  const [memberAssignments, setMemberAssignments] = React.useState({});
  const [openSections, setOpenSections] = React.useState({
    scores: false,
    members: false,
  });
  const { toast, showToast } = useToast();

  React.useEffect(() => {
    if (!Array.isArray(members)) return;
    setMemberAssignments(
      members.reduce((acc, member) => {
        const tierInfo = member.tier || {};
        acc[member.id] = {
          tier:
            tierInfo.tktkTierName ||
            member.tktkTier ||
            member.discord?.tierName ||
            detectTierFromRights(member),
          level:
            tierInfo.tktkTierLevelCode ||
            member.tktkTierLevel ||
            member.discord?.tierLevel ||
            null,
        };
        return acc;
      }, {})
    );
  }, [members]);

  const detectTierFromRights = (member) => {
    const rights = Array.isArray(member.discord?.right)
      ? member.discord.right
      : [member.discord?.right];
    const tierRight = rights.find((r) => r && r.endsWith('tier'));
    return tierRight || null;
  };

  const groupedTiers = React.useMemo(() => {
    if (!Array.isArray(tierList)) return [];
    const map = new Map();
    tierList.forEach((tier) => {
      const key = tier.name || tier.tierName || tier.id;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          key,
          id: tier.id,
          order: tier.order ?? tier.tierOrder ?? 99,
          color: tier.color,
          description: tier.description,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }, [tierList]);

  const tierKeys = React.useMemo(
    () => groupedTiers.map((tier) => tier.key),
    [groupedTiers]
  );

  const normalizeTierScores = React.useCallback((details) => {
    if (!Array.isArray(details)) return {};
    return details.reduce((acc, detail) => {
      const tierKey = detail.name || detail.tierName || detail.id;
      if (!tierKey) return acc;
      const levelMap = LEVELS.reduce((map, label) => {
        const targetCode = LEVEL_CODE_BY_LABEL[label];
        const levelData = detail.levels?.find(
          (lvl) =>
            lvl.levelCode === targetCode ||
            lvl.levelName === label
        );
        map[label] = {
          levelCode: levelData?.levelCode || targetCode,
          kills: levelData?.kills ?? 0,
          deal: levelData?.deal ?? 0,
          killsDeal: levelData?.killsDeal ?? 0,
        };
        return map;
      }, {});
      acc[tierKey] = {
        tierId: detail.id,
        levels: levelMap,
      };
      return acc;
    }, {});
  }, []);

  const loadTierScores = React.useCallback(async () => {
    if (!Array.isArray(groupedTiers) || groupedTiers.length === 0) {
      setTeamScores({});
      setScoresLoading(false);
      return;
    }
    setScoresLoading(true);
    try {
      const details = await Promise.all(
        groupedTiers.map((tier) => tierService.getTierDetail(tier.id))
      );
      setTeamScores(normalizeTierScores(details));
      setScoresError(null);
    } catch (error) {
      console.error('Failed to load tier scores:', error);
      setScoresError(error);
    } finally {
      setScoresLoading(false);
    }
  }, [groupedTiers, normalizeTierScores]);

  React.useEffect(() => {
    loadTierScores();
  }, [loadTierScores]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleScoreEdit = (tier, level, type) => {
    const field = SCORE_FIELD_MAP[type];
    const value = teamScores?.[tier]?.levels?.[level]?.[field] ?? 0;
    setEditingKey(`${tier}__${level}__${type}`);
    setEditValue(value);
  };

  const handleScoreSave = async () => {
    if (!editingKey) return;
    const [tier, level, type] = editingKey.split('__');
    const tierData = teamScores?.[tier];
    const levelData = tierData?.levels?.[level];
    if (!tierData || !levelData) {
      showToast('error', '티어 정보를 찾을 수 없습니다.');
      return;
    }

    const newValue = parseInt(editValue, 10);
    if (Number.isNaN(newValue) || newValue < 0) {
      showToast('error', '올바른 숫자를 입력하세요.');
      return;
    }

    const field = SCORE_FIELD_MAP[type];
    try {
      await tierService.updateTierLevelScores(
        tierData.tierId,
        levelData.levelCode || LEVEL_CODE_BY_LABEL[level],
        { [field]: newValue }
      );
      setTeamScores((prev) => ({
        ...prev,
        [tier]: {
          ...prev[tier],
          levels: {
            ...prev[tier]?.levels,
            [level]: {
              ...prev[tier]?.levels?.[level],
              [field]: newValue,
            },
          },
        },
      }));
      setEditingKey(null);
      setEditValue('');
      showToast('success', '점수가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update score:', error);
      showToast('error', '점수 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleScoreCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const updateMemberAssignment = async (memberId, partial) => {
    const current = memberAssignments[memberId] || { tier: null, level: null };
    const next = {
      tier: partial.tier !== undefined ? partial.tier : current.tier,
      level: partial.level !== undefined ? partial.level : current.level,
    };

    setMemberAssignments((prev) => ({ ...prev, [memberId]: next }));

    try {
      await memberService.updateTierAssignment(memberId, {
        tierName: next.tier,
        levelCode: next.level,
      });
    } catch (error) {
      console.error('Failed to update member tier:', error);
      showToast('error', '멤버 티어 변경에 실패했습니다. 다시 시도해주세요.');
      setMemberAssignments((prev) => ({ ...prev, [memberId]: current }));
    }
  };

  const handleTierSelectChange = (memberId, tierValue) => {
    const normalized = tierValue === 'none' ? null : tierValue;
    const defaultLevel = normalized ? (memberAssignments[memberId]?.level || 'UPPER') : null;
    updateMemberAssignment(memberId, { tier: normalized, level: defaultLevel });
  };

  const handleLevelSelectChange = (memberId, levelCode) => {
    updateMemberAssignment(memberId, { level: levelCode || null });
  };

  const getMemberDisplay = (assignment) => {
    if (!assignment?.tier) return '티어 없음';
    const levelLabel = assignment.level ? (LEVEL_CODE_TO_LABEL[assignment.level] || assignment.level) : '레벨 미지정';
    return `${assignment.tier} / ${levelLabel}`;
  };

  const getLevelSelectValue = (assignment) => assignment?.level || '';

  const isEditingCell = (tier, level, type) => editingKey === `${tier}__${level}__${type}`;

  const getScoreValue = (tier, level, type) => {
    const field = SCORE_FIELD_MAP[type];
    return teamScores?.[tier]?.levels?.[level]?.[field] ?? 0;
  };

  if (membersLoading || tiersLoading || scoresLoading) {
    return (
      <div className="tier-management">
        <p>Loading...</p>
      </div>
    );
  }

  if (tiersError || scoresError) {
    return (
      <div className="tier-management">
        <p>
          티어 정보를 불러오지 못했습니다:{' '}
          {(tiersErrorDetail?.message || scoresError?.message || '알 수 없는 오류')}
        </p>
      </div>
    );
  }

  if (!tierKeys.length) {
    return (
      <div className="tier-management">
        <p>등록된 티어가 없습니다. 서버에서 티어 데이터를 먼저 설정해주세요.</p>
      </div>
    );
  }

  return (
    <div className="tier-management">
      <div className="tier-accordion">
        <div className={`tier-panel ${openSections.scores ? 'open' : 'collapsed'}`}>
          <button className="tier-panel-header" onClick={() => toggleSection('scores')}>
            <div>
              <p className="tier-panel-overline">TKTK CLAN SCORE</p>
              <h3>점수 관리</h3>
              <span className="tier-panel-desc">티어별 상·중·하 대표 점수를 조정합니다.</span>
            </div>
            <span className="tier-panel-toggle">{openSections.scores ? '▲' : '▼'}</span>
          </button>
          {openSections.scores && (
            <div className="tier-panel-body tier-scores-section">
              <div className="table-wrapper">
                <table className="management-table tier-scores-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">티어</th>
                      <th rowSpan="2">레벨</th>
                      <th colSpan="3">점수</th>
                    </tr>
                    <tr>
                      <th>킬내기</th>
                      <th>딜내기</th>
                      <th>킬딜내기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierKeys.map((tier) =>
                      LEVELS.map((level, levelIndex) => (
                        <tr key={`${tier}-${level}`}>
                          {levelIndex === 0 && (
                            <td rowSpan="3" className="tier-name-cell">
                              {tier}
                            </td>
                          )}
                          <td className={`level-cell level-${level}`}>{level}</td>
                          {SCORE_TYPES.map((type) => {
                            const cellKey = `${tier}__${level}__${type}`;
                            const editing = isEditingCell(tier, level, type);
                            const value = getScoreValue(tier, level, type);
                            return (
                              <td key={cellKey} className="score-cell">
                                {editing ? (
                                  <div className="score-edit-group">
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="score-input"
                                      autoFocus
                                      min="0"
                                    />
                                    <div className="score-edit-buttons">
                                      <button className="btn-score-save" onClick={handleScoreSave}>
                                        ✓
                                      </button>
                                      <button className="btn-score-cancel" onClick={handleScoreCancel}>
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="score-value"
                                    onClick={() => handleScoreEdit(tier, level, type)}
                                  >
                                    {value}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className={`tier-panel ${openSections.members ? 'open' : 'collapsed'}`}>
          <button className="tier-panel-header" onClick={() => toggleSection('members')}>
            <div>
              <p className="tier-panel-overline">TKTK CLAN MEMBERS</p>
              <h3>멤버 티어 관리</h3>
              <span className="tier-panel-desc">멤버별 티어와 레벨을 한 번에 관리하세요.</span>
            </div>
            <span className="tier-panel-toggle">{openSections.members ? '▲' : '▼'}</span>
          </button>
          {openSections.members && (
            <div className="tier-panel-body tier-members-section">
              <div className="table-wrapper">
                <table className="management-table tier-members-table">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>Discord 닉네임</th>
                      <th>게임명</th>
                      <th>현재 티어</th>
                      <th>티어 변경</th>
                      <th>레벨 변경</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members && members.map((member) => {
                      const assignment = memberAssignments[member.id] || { tier: null, level: null };
                      return (
                        <tr key={member.id}>
                          <td>{member.name || '—'}</td>
                          <td>{member.info?.discordname || '—'}</td>
                          <td>{member.game?.gamename || member.info?.gamename || '—'}</td>
                          <td>
                            <span className={`tier-badge tier-badge-${assignment.tier || 'none'}`}>
                              {getMemberDisplay(assignment)}
                            </span>
                          </td>
                          <td>
                            <select
                              className="tier-select"
                              value={assignment.tier || 'none'}
                              onChange={(e) => handleTierSelectChange(member.id, e.target.value)}
                            >
                              <option value="none">티어 없음</option>
                              {TIER_OPTIONS.map((tier) => (
                                <option key={tier} value={tier}>
                                  {tier}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="tier-select"
                              value={getLevelSelectValue(assignment)}
                              onChange={(e) => handleLevelSelectChange(member.id, e.target.value)}
                              disabled={!assignment.tier}
                            >
                              <option value="">레벨 선택</option>
                              <option value="UPPER">상</option>
                              <option value="MID">중</option>
                              <option value="LOW">하</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
