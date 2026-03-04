import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { isAuthenticated, setUser as saveUser } from '../utils/discord-auth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import memberService from '../api/memberService';
import ActivityHeatmap from '../components/ActivityHeatmap';
import MatchTimeline from '../components/MatchTimeline';
import GameStatsCards from '../components/GameStatsCards';
import PerformanceTrendChart from '../components/PerformanceTrendChart';
import StatsComparisonBar from '../components/StatsComparisonBar';
import MapStatsGrid from '../components/MapStatsGrid';
import { AchievementGrid } from '../components/AchievementCard';
import gameStatsService from '../api/gameStatsService';
import '../styles/profile.css';

/**
 * TKTK 티어 레벨 코드를 한글로 변환
 */
const getLevelCodeLabel = (levelCode) => {
  const levelMap = {
    'UPPER': '상',
    'MID': '중',
    'LOW': '하'
  };
  return levelMap[levelCode] || levelCode;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'stats'
  const [statsTab, setStatsTab] = useState('summary'); // 'summary', 'trends', 'maps', 'matches', 'achievements'
  const [activityData, setActivityData] = useState([]);
  const [activitySummary, setActivitySummary] = useState({});
  const [overallStats, setOverallStats] = useState(null);
  const [modeComparison, setModeComparison] = useState({});
  const [performanceTrends, setPerformanceTrends] = useState([]);
  const [mapStats, setMapStats] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [achievements] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [syncRetrying, setSyncRetrying] = useState(false);
  const [gameNameInput, setGameNameInput] = useState('');
  const [showGameNameModal, setShowGameNameModal] = useState(false);
  const [modalGameName, setModalGameName] = useState('');
  const [gameNameModalSubmitting, setGameNameModalSubmitting] = useState(false);
  const [modalGameNameError, setModalGameNameError] = useState('');
  const memberId = user?.id;

  useEffect(() => {
    // 로그인 확인
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    // 항상 최신 데이터를 API에서 가져오기
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/me');

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        console.log('User profile loaded:', userData);
        console.log('User name:', userData.name);
        console.log('clanJoinStatus:', userData.clanJoinStatus);
        setUser(userData);
        setGameNameInput(userData.game?.gamename || '');
        // 로컬 저장소에도 저장
        saveUser(userData);
      } else {
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const retryGameSyncRequest = async (targetGameName, { loadingSetter, successMessage } = {}) => {
    if (!targetGameName) return false;

    loadingSetter?.(true);
    try {
      await memberService.retryGameSync(targetGameName);
      await fetchUserProfile();
      alert(successMessage || '게임 연동을 다시 시도했습니다. 잠시 후 상태를 확인해주세요.');
      return true;
    } catch (err) {
      console.error('게임 연동 재시도 실패:', err);
      alert('연동 재시도에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      loadingSetter?.(false);
    }
  };

  const openGameNameChangeModal = () => {
    setModalGameName(user?.game?.gamename || '');
    setModalGameNameError('');
    setShowGameNameModal(true);
  };

  const closeGameNameChangeModal = () => {
    if (gameNameModalSubmitting) return;
    setShowGameNameModal(false);
    setModalGameNameError('');
  };

  const handleGameNameModalSubmit = async () => {
    const targetGameName = modalGameName.trim();
    if (!targetGameName) {
      setModalGameNameError('PUBG 닉네임을 입력해주세요.');
      return;
    }

    const success = await retryGameSyncRequest(targetGameName, {
      loadingSetter: setGameNameModalSubmitting,
      successMessage: '새 닉네임으로 연동을 다시 시도했습니다. 잠시 후 상태를 확인해주세요.'
    });

    if (success) {
      setShowGameNameModal(false);
      setGameNameInput(targetGameName);
    }
  };

  const fetchGameStats = useCallback(async (memberId) => {
    if (!memberId) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const [
        activityResult,
        statsResult,
        trendsResult,
        mapResult,
        seasonResult,
        matchResult
      ] = await Promise.allSettled([
        gameStatsService.getActivity(memberId),
        gameStatsService.getStats(memberId),
        gameStatsService.getTrends(memberId),
        gameStatsService.getMapStats(memberId),
        gameStatsService.getSeasonStats(memberId),
        gameStatsService.getMatches(memberId, { limit: 20 })
      ]);

      let hasPartialError = false;
      let hasCriticalError = false;

      const handleError = (label, reason, critical = false) => {
        console.error(`${label} 로드 실패:`, reason);
        if (critical) {
          hasCriticalError = true;
        } else {
          hasPartialError = true;
        }
      };

      if (activityResult.status === 'fulfilled') {
        const activities = activityResult.value?.activities || [];
        const summary = activityResult.value?.summary || {};
        setActivityData(activities);
        setActivitySummary(summary);
      } else {
        handleError('활동 히트맵', activityResult.reason, true);
      }

      if (statsResult.status === 'fulfilled') {
        const byModeRaw = statsResult.value?.byMode || {};
        const normalizedByMode = Object.entries(byModeRaw).reduce((acc, [key, value]) => {
          acc[key.toLowerCase()] = value;
          return acc;
        }, {});

        setOverallStats(statsResult.value?.overall || null);
        setModeComparison(normalizedByMode);
      } else {
        handleError('기본 통계', statsResult.reason, true);
      }

      if (trendsResult.status === 'fulfilled') {
        setPerformanceTrends(trendsResult.value?.trends || []);
      } else {
        handleError('성적 추이', trendsResult.reason, false);
      }

      if (mapResult.status === 'fulfilled') {
        setMapStats(mapResult.value?.maps || []);
      } else {
        handleError('맵 통계', mapResult.reason, false);
      }

      if (seasonResult.status === 'rejected') {
        handleError('시즌 통계', seasonResult.reason, false);
      }

      if (matchResult.status === 'fulfilled') {
        setRecentMatches(matchResult.value?.matches || []);
      } else {
        handleError('매치 이력', matchResult.reason, true);
      }

      if (hasCriticalError) {
        setStatsError('게임 통계를 불러오는 중 오류가 발생했습니다.');
      } else if (hasPartialError) {
        setStatsError('일부 통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setStatsError(null);
      }
    } catch (err) {
      console.error('게임 통계 로드 실패:', err);
      setStatsError('게임 통계를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (memberId) {
      fetchGameStats(memberId);
    }
  }, [memberId, fetchGameStats]);

  const getSyncStatusInfo = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { text: '연동 완료', color: '#10b981', bg: '#d1fae5' };
      case 'PENDING':
      case 'REQUEST':
        return { text: '연동 중', color: '#3b82f6', bg: '#dbeafe' };
      case 'FAILED':
        return { text: '연동 실패', color: '#ef4444', bg: '#fee2e2' };
      default:
        return { text: '미연동', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getTierColor = (tier) => {
    const tierColors = {
      MASTER: '#a855f7',
      DIAMOND: '#3b82f6',
      PLATINUM: '#06b6d4',
      GOLD: '#f59e0b',
      SILVER: '#94a3b8',
      BRONZE: '#d97706',
      UNRANKED: '#6b7280'
    };
    return tierColors[tier] || '#6b7280';
  };

  const formatSyncError = (reason) => {
    if (!reason) return '';
    if (reason.includes('404 Not Found')) {
      return '게임 내에서 존재하지 않는 닉네임입니다. 공백과 대/소문자를 다시 확인해주세요.';
    }
    return reason;
  };

  const getClanStatusInfo = (status) => {
    switch (status) {
      case 'APPROVED':
        return { text: '클랜원', color: '#10b981', bg: '#d1fae5', icon: '✓' };
      case 'PENDING':
        return { text: '신청 중', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' };
      case 'NONE':
      default:
        return { text: '미가입', color: '#6b7280', bg: '#f3f4f6', icon: '○' };
    }
  };

  const handleClanJoinRequest = async () => {
    if (isJoining) return;

    try {
      setIsJoining(true);
      await memberService.requestClanJoin();

      // 프로필 다시 로드
      await fetchUserProfile();

      // 로컬 저장소의 사용자 정보도 업데이트
      const updatedUser = { ...user, clanJoinStatus: 'PENDING' };
      setUser(updatedUser);
      saveUser(updatedUser);

      alert('클랜 가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.');
    } catch (err) {
      console.error('클랜 가입 신청 실패:', err);
      alert('클랜 가입 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRetryGameSync = async () => {
    if (syncRetrying) return;
    const targetGameName = gameNameInput?.trim();
    if (!targetGameName) {
      alert('연동할 게임 닉네임을 입력해주세요.');
      return;
    }

    await retryGameSyncRequest(targetGameName, {
      loadingSetter: setSyncRetrying,
      successMessage: '게임 연동을 다시 시도했습니다. 잠시 후 상태를 확인해주세요.'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%'
            }}
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const syncStatus = getSyncStatusInfo(user.game?.syncStatus);
  const clanStatus = getClanStatusInfo(user.clanJoinStatus);

  return (
    <Layout>
      <div className="profile-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="profile-title">
            My Profile
          </h1>

          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button
              onClick={() => setActiveTab('basic')}
              className={`profile-tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            >
              기본 정보
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`profile-tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            >
              게임 통계
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'basic' && (
            <div>
              {/* 기본 정보 카드 */}
              <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="profile-user-header">
                  {user.info?.avatar ? (
                    <img
                      src={user.info.avatar}
                      alt={user.name}
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="profile-user-info">
                    <h2>{user.name}</h2>
                    {user.info?.koreaname && (
                      <p className="profile-user-meta">
                        {user.info.discordname} · {user.info.koreaname}
                      </p>
                    )}
                  </div>
                </div>

                <div className="profile-info-grid">
                  <InfoItem label="Discord 이름" value={user.info?.discordname || '-'} />
                  <InfoItem label="생일" value={user.info?.birthday || '-'} />
                </div>
              </motion.div>

              {/* 게임 정보 카드 */}
              <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="profile-card-header">
                  <span className="profile-card-icon">🎮</span>
                  게임 정보
                </h3>

                <div className="profile-info-grid">
                  <InfoItem label="PUBG 닉네임" value={user.game?.gamename || '-'} />
                  <div className="profile-info-item">
                    <p className="profile-info-label">티어</p>
                    <p className="profile-tier-value" style={{ color: getTierColor(user.game?.tier) }}>
                      {user.game?.tier || 'UNRANKED'}
                    </p>
                  </div>
                  <div className="profile-info-item">
                    <p className="profile-info-label">연동 상태</p>
                    <div className="profile-sync-row">
                      <span
                        className="profile-status-badge"
                        style={{
                          background: syncStatus.bg,
                          borderColor: syncStatus.color,
                          color: syncStatus.color
                        }}
                      >
                        <div
                          className="profile-status-indicator"
                          style={{ background: syncStatus.color }}
                        />
                        {syncStatus.text}
                      </span>
                      <button
                        type="button"
                        className="profile-change-button"
                        onClick={openGameNameChangeModal}
                      >
                        변경하기
                      </button>
                    </div>
                    {user.game?.syncStatus === 'FAILED' && user.game?.failReason && (
                      <p className="profile-sync-error">
                        {formatSyncError(user.game.failReason)}
                      </p>
                    )}
                    {user.game?.syncStatus === 'FAILED' && (
                      <div className="profile-retry-section">
                        <input
                          value={gameNameInput}
                          onChange={(e) => setGameNameInput(e.target.value)}
                          placeholder="PUBG 닉네임을 입력하세요"
                          className="profile-input"
                        />
                        <button
                          onClick={handleRetryGameSync}
                          disabled={syncRetrying}
                          className="profile-retry-button"
                        >
                          {syncRetrying ? '재시도 중...' : '연동 재시도'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* TKTK 클랜 정보 카드 */}
              <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <h3 className="profile-card-header">
                  <span className="profile-card-icon">🏆</span>
                  TKTK 클랜 정보
                </h3>

                <div className="profile-info-grid">
                  <InfoItem
                    label="TKTK 티어"
                    value={user.clanJoinStatus === 'APPROVED' ? (user.tier?.tktkTierName || '미배정') : '미배정'}
                  />
                  <InfoItem
                    label="티어 레벨"
                    value={
                      user.clanJoinStatus === 'APPROVED' && user.tier?.tktkTierLevelCode
                        ? getLevelCodeLabel(user.tier.tktkTierLevelCode)
                        : '미배정'
                    }
                  />
                  <div className="profile-info-item">
                    <p className="profile-info-label">클랜 상태</p>
                    <div className="profile-clan-actions">
                      <span
                        className="profile-status-badge"
                        style={{
                          background: clanStatus.bg,
                          borderColor: clanStatus.color,
                          color: clanStatus.color
                        }}
                      >
                        <span>{clanStatus.icon}</span>
                        {clanStatus.text}
                      </span>
                      {user.clanJoinStatus === 'NONE' && (
                        <button
                          onClick={handleClanJoinRequest}
                          disabled={isJoining}
                          className="profile-join-button"
                        >
                          {!isJoining && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <line x1="19" y1="8" x2="19" y2="14" />
                              <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                          )}
                          {isJoining ? '신청 중...' : '클랜 가입 신청'}
                        </button>
                      )}
                      {user.clanJoinStatus === 'PENDING' && (
                        <p className="profile-pending-message">
                          관리자의 승인을 기다리는 중입니다
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 스트리밍 정보 카드 */}
              <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="profile-card-header">
                  <span className="profile-card-icon">📺</span>
                  스트리밍 정보
                </h3>

                <div className="profile-info-grid">
                  <StreamingLink label="숲" url={user.streaming?.soop} />
                  <StreamingLink label="치지직" url={user.streaming?.chzzk} />
                </div>
              </motion.div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div>
              {statsLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#3b82f6',
                      borderRadius: '50%'
                    }}
                  />
                </div>
              )}

              {statsError && (
                <div style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  border: '1px solid #fecaca',
                  fontSize: '0.9rem'
                }}>
                  {statsError}
                </div>
              )}

              {/* Activity Heatmap - Always visible */}
              <div style={{ marginBottom: '2rem' }}>
                <ActivityHeatmap data={activityData} summary={activitySummary} />
              </div>

              {/* Stats Sub-Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                borderBottom: '2px solid #e5e7eb',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setStatsTab('summary')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: statsTab === 'summary' ? '#667eea' : '#6b7280',
                    border: 'none',
                    borderBottom: statsTab === 'summary' ? '2px solid #667eea' : '2px solid transparent',
                    marginBottom: '-2px',
                    fontSize: '0.875rem',
                    fontWeight: statsTab === 'summary' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  기본 통계
                </button>
                <button
                  onClick={() => setStatsTab('trends')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: statsTab === 'trends' ? '#667eea' : '#6b7280',
                    border: 'none',
                    borderBottom: statsTab === 'trends' ? '2px solid #667eea' : '2px solid transparent',
                    marginBottom: '-2px',
                    fontSize: '0.875rem',
                    fontWeight: statsTab === 'trends' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  성적 추이
                </button>
                <button
                  onClick={() => setStatsTab('maps')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: statsTab === 'maps' ? '#667eea' : '#6b7280',
                    border: 'none',
                    borderBottom: statsTab === 'maps' ? '2px solid #667eea' : '2px solid transparent',
                    marginBottom: '-2px',
                    fontSize: '0.875rem',
                    fontWeight: statsTab === 'maps' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  맵/시즌
                </button>
                <button
                  onClick={() => setStatsTab('matches')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: statsTab === 'matches' ? '#667eea' : '#6b7280',
                    border: 'none',
                    borderBottom: statsTab === 'matches' ? '2px solid #667eea' : '2px solid transparent',
                    marginBottom: '-2px',
                    fontSize: '0.875rem',
                    fontWeight: statsTab === 'matches' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  매치 이력
                </button>
                <button
                  onClick={() => setStatsTab('achievements')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: statsTab === 'achievements' ? '#667eea' : '#6b7280',
                    border: 'none',
                    borderBottom: statsTab === 'achievements' ? '2px solid #667eea' : '2px solid transparent',
                    marginBottom: '-2px',
                    fontSize: '0.875rem',
                    fontWeight: statsTab === 'achievements' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  업적
                </button>
              </div>

              {/* 1. 기본 통계 탭 - 게임 통계 카드만 */}
              {statsTab === 'summary' && (
                <div>
                  <GameStatsCards stats={overallStats || {}} />
                </div>
              )}

              {/* 2. 성적 추이 탭 - 추이 차트 + 모드 비교 */}
              {statsTab === 'trends' && (
                <div>
                  <PerformanceTrendChart performanceTrends={performanceTrends} />
                  <div style={{ marginTop: '1.5rem' }}>
                    <StatsComparisonBar modeComparison={modeComparison} />
                  </div>
                </div>
              )}

              {/* 3. 맵/시즌 탭 - 맵 통계 + 시즌 비교 */}
              {statsTab === 'maps' && (
                <div>
                  <MapStatsGrid maps={mapStats} />
                  <div style={{
                    marginTop: '1.5rem',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px dashed #cbd5f5',
                    color: '#4b5563'
                  }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>시즌 비교 기능 준비 중</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      시즌별 통계는 곧 제공될 예정입니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. 매치 이력 탭 */}
              {statsTab === 'matches' && (
                <div>
                  <MatchTimeline matches={recentMatches} limit={20} />
                </div>
              )}

              {/* 5. 업적 탭 */}
              {statsTab === 'achievements' && (
                <div>
                  <AchievementGrid achievements={achievements} filter="all" />
                </div>
              )}
            </div>
        )}

          {/* AI 분석 봇 - Profile 페이지에서 항상 표시 */}
      </motion.div>
      {showGameNameModal && (
        <div
          className="profile-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeGameNameChangeModal}
        >
          <div
            className="profile-modal"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-modal-close"
              aria-label="게임 닉네임 변경 모달 닫기"
              onClick={closeGameNameChangeModal}
            >
              ×
            </button>
            <h3 className="profile-modal-title">게임 닉네임 변경</h3>
            <p className="profile-modal-description">
              PUBG 닉네임을 수정하고 연동을 다시 시도합니다. 5~10분 후 연동 상태를 다시 확인해주세요.
            </p>
            <input
              className="profile-modal-input"
              value={modalGameName}
              onChange={(e) => {
                setModalGameName(e.target.value);
                if (modalGameNameError) {
                  setModalGameNameError('');
                }
              }}
              placeholder="새 PUBG 닉네임을 입력하세요"
            />
            {modalGameNameError && (
              <p className="profile-modal-error">{modalGameNameError}</p>
            )}
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-button profile-modal-cancel"
                onClick={closeGameNameChangeModal}
                disabled={gameNameModalSubmitting}
              >
                취소
              </button>
              <button
                type="button"
                className="profile-modal-button profile-modal-submit"
                onClick={handleGameNameModalSubmit}
                disabled={gameNameModalSubmitting}
              >
                {gameNameModalSubmitting ? '변경 중...' : '변경 및 재연동'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
  );
}

// 정보 아이템 컴포넌트
function InfoItem({ label, value }) {
  return (
    <div className="profile-info-item">
      <p className="profile-info-label">{label}</p>
      <p className="profile-info-value">{value}</p>
    </div>
  );
}

// 스트리밍 링크 컴포넌트
function StreamingLink({ label, url }) {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case '숲':
        // SOOP (구 AfreecaTV) 로고
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.94-7-5.05-7-9V8.3l7-3.5 7 3.5V11c0 3.95-3.13 8.06-7 9z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
      case '치지직':
        // Chzzk (네이버) 로고
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 13H4V8h16v11z"/>
            <path d="M6 10h4v2H6zm0 4h8v2H6zm10-4h2v6h-2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case '숲':
        return '#00d8ff'; // SOOP 브랜드 컬러
      case '치지직':
        return '#00e080'; // Chzzk 브랜드 컬러
      default:
        return '#3b82f6';
    }
  };

  if (!url) {
    return (
      <div className="profile-streaming-link">
        <p className="profile-streaming-header">
          <span style={{ color: '#9ca3af' }}>{getPlatformIcon(label)}</span>
          {label}
        </p>
        <p className="profile-streaming-empty">미등록</p>
      </div>
    );
  }

  const platformColor = getPlatformColor(label);

  return (
    <div className="profile-streaming-link">
      <p className="profile-streaming-header">
        <span style={{ color: platformColor }}>{getPlatformIcon(label)}</span>
        {label}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-streaming-button"
        style={{
          color: platformColor,
          background: `${platformColor}15`,
          borderColor: `${platformColor}30`
        }}
      >
        <span>채널 바로가기</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}
