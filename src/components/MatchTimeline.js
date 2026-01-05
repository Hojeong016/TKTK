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

          return (
            <div key={match.matchId || index} className="match-card">
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
                  {match.result.headshotKills > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">헤드샷</span>
                      <span className="detail-value">{match.result.headshotKills}</span>
                    </div>
                  )}

                  {match.result.rideDistance > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">이동거리</span>
                      <span className="detail-value">
                        {(match.result.rideDistance / 1000).toFixed(1)}km
                      </span>
                    </div>
                  )}

                  {match.result.heals > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">회복</span>
                      <span className="detail-value">{match.result.heals}</span>
                    </div>
                  )}

                  {match.result.longestKill > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">최장 킬</span>
                      <span className="detail-value">{match.result.longestKill.toFixed(1)}m</span>
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
