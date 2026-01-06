import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import MatchDetailModal from './MatchDetailModal';
import '../styles/match-timeline.css';

/**
 * MatchTimeline - 최근 매치 타임라인
 *
 * @param {Array} matches - 매치 데이터 배열
 * @param {Number} limit - 표시할 매치 수 (기본: 5)
 * @param {Boolean} showDetails - 상세 정보 표시 여부
 */
export default function MatchTimeline({ matches = [], limit = 5, showDetails = true }) {
  const displayMatches = matches.slice(0, limit);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [carouselPositions, setCarouselPositions] = useState({});
  const DETAIL_CARD_WIDTH = 200;
  const DETAILS_PER_VIEW = 3;

  // 순위 배지
  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: '#1', class: 'rank-1', label: 'WIN' };
    if (rank === 2) return { icon: '#2', class: 'rank-2', label: 'RUNNER-UP' };
    if (rank === 3) return { icon: '#3', class: 'rank-3', label: 'THIRD' };
    if (rank <= 10) return { icon: `#${rank}`, class: 'rank-top10', label: 'TOP 10' };
    return { icon: `#${rank}`, class: 'rank-other', label: '' };
  };

  // 모드 한글 변환
  const getModeLabel = (mode) => {
    const modeMap = {
      'solo': '솔로',
      'duo': '듀오',
      'squad': '스쿼드'
    };
    return modeMap[mode] || mode;
  };

  // 시간 포맷
  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko
      });
    } catch (error) {
      return '알 수 없음';
    }
  };

  // 생존 시간 포맷 (초 -> 분:초)
  const formatSurvivalTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistanceKm = (meters = 0) => {
    if (!meters || meters <= 0) return '0km';
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatMemberDamage = (damage) => {
    if (damage === null || damage === undefined) return '0';
    const numeric = Number(damage);
    if (Number.isNaN(numeric)) return '0';
    return numeric.toFixed(0);
  };

  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!matches || matches.length === 0) {
    return (
      <div className="match-timeline-container">
        <div className="no-matches">
          <p>최근 매치 기록이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-timeline-container">
      <div className="match-timeline-header">
        <h3 className="match-timeline-title">최근 매치</h3>
        {matches.length > limit && (
          <button className="view-all-btn">
            전체보기 ({matches.length})
          </button>
        )}
      </div>

      <div className="match-timeline">
        {displayMatches.map((match, index) => {
          const rankBadge = getRankBadge(match.result.rank);
          const modeLabel = getModeLabel(match.mode);
          const timeAgo = getTimeAgo(match.playedAt);
          const matchKey = match.matchId || `match-${index}`;
          const totalDistance = (match.result.rideDistance || 0) + (match.result.walkDistance || 0);
          const detailStats = [
            match.result.teamRank ? { label: '팀 순위', value: `#${match.result.teamRank}` } : null,
            { label: '헤드샷', value: match.result.headshotKills ?? 0 },
            match.result.longestKill !== undefined
              ? { label: '최장 킬', value: `${match.result.longestKill.toFixed(1)}m` }
              : null,
            { label: '이동 거리', value: formatDistanceKm(totalDistance) },
            { label: '힐 / 부스트', value: `${match.result.heals ?? 0} / ${match.result.boosts ?? 0}` },
            match.result.dbno !== undefined ? { label: 'DBNO', value: match.result.dbno } : null,
            match.result.revives !== undefined ? { label: 'Revives', value: match.result.revives } : null,
            match.result.weaponsAcquired !== undefined
              ? { label: '무기 획득', value: match.result.weaponsAcquired }
              : null
          ].filter(Boolean);
          const hasTeamMembers = match.teamMembers && match.teamMembers.length > 0;
          const storedIndex = carouselPositions[matchKey] || 0;
          const maxCarouselIndex = Math.max(detailStats.length - DETAILS_PER_VIEW, 0);
          const carouselIndex = Math.min(storedIndex, maxCarouselIndex);
          const handlePrev = () =>
            setCarouselPositions((prev) => ({
              ...prev,
              [matchKey]: Math.max(carouselIndex - 1, 0)
            }));
          const handleNext = () =>
            setCarouselPositions((prev) => ({
              ...prev,
              [matchKey]: Math.min(carouselIndex + 1, maxCarouselIndex)
            }));

          return (
            <div key={matchKey} className="match-card">
              {/* 헤더 */}
              <div className="match-card-header">
                <div className="match-header-left">
                  <span className={`match-rank-badge ${rankBadge.class}`}>
                    {rankBadge.icon}
                  </span>
                  <span className="match-mode">{modeLabel.toUpperCase()}</span>
                  <span className="match-divider">|</span>
                  <span className="match-map">{match.map}</span>
                </div>
                <div className="match-time-ago">{timeAgo}</div>
              </div>

              {/* 주요 통계 */}
              <div className="match-stats-primary">
                <div className="stat-group">
                  <span className="stat-label">K/D/A</span>
                  <span className="stat-value kda">
                    <span className="kills">{match.result.kills}</span>
                    <span className="divider">/</span>
                    <span className="deaths">{match.result.deaths}</span>
                    <span className="divider">/</span>
                    <span className="assists">{match.result.assists}</span>
                  </span>
                </div>

                <div className="stat-group">
                  <span className="stat-label">데미지</span>
                  <span className="stat-value damage">
                    {match.result.damage.toFixed(1)}
                  </span>
                </div>

                <div className="stat-group">
                  <span className="stat-label">생존시간</span>
                  <span className="stat-value survival">
                    {formatSurvivalTime(match.result.survivalTime)}
                  </span>
                </div>
              </div>

              {/* 상세 통계 */}
              {showDetails && (
                <div className="match-stats-details">
                  <div className="detail-carousel">
                    <button
                      className="carousel-btn prev"
                      onClick={handlePrev}
                      disabled={carouselIndex === 0}
                    >
                      ‹
                    </button>

                    <div className="detail-carousel-viewport">
                      <div
                        className="detail-grid"
                        style={{
                          transform: `translateX(-${carouselIndex * DETAIL_CARD_WIDTH}px)`
                        }}
                      >
                        {detailStats.map((detail) => (
                          <div key={detail.label} className="detail-item">
                            <span className="detail-label">{detail.label}</span>
                            <span className="detail-value">{detail.value}</span>
                          </div>
                        ))}
                        {detailStats.length === 0 && (
                          <div className="detail-item detail-empty">
                            <span className="detail-label">추가 데이터</span>
                            <span className="detail-value">준비 중</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="carousel-btn next"
                      onClick={handleNext}
                      disabled={carouselIndex >= maxCarouselIndex}
                    >
                      ›
                    </button>
                  </div>

                  {hasTeamMembers && (
                    <div className="team-members">
                      <span className="team-members-label">TEAM</span>
                      <div className="team-member-list">
                        {match.teamMembers.map((member) => (
                          <div key={`${matchKey}-${member.name}`} className="team-member-badge">
                            <span className="team-member-name">{member.name}</span>
                            <span className="team-member-stats">
                              {member.kills}K / {formatMemberDamage(member.damage)}D
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 상세보기 버튼 */}
              <div className="match-card-footer">
                <button className="view-detail-btn" onClick={() => setSelectedMatch(match)}>
                  상세보기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 상세보기 모달 */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
