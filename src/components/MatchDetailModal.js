import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import '../styles/match-detail-modal.css';

/**
 * MatchDetailModal - 매치 상세 정보 모달
 */
export default function MatchDetailModal({ match, onClose }) {
  if (!match) return null;

  // 모드 한글 변환
  const getModeLabel = (mode) => {
    const modeMap = {
      'solo': '솔로',
      'duo': '듀오',
      'squad': '스쿼드'
    };
    return modeMap[mode] || mode;
  };

  // 생존 시간 포맷 (초 -> 분:초)
  const formatSurvivalTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  // 순위 배지 정보
  const getRankInfo = (rank) => {
    if (rank === 1) return { label: 'WINNER', class: 'rank-1' };
    if (rank === 2) return { label: 'RUNNER-UP', class: 'rank-2' };
    if (rank === 3) return { label: 'THIRD PLACE', class: 'rank-3' };
    if (rank <= 10) return { label: `TOP ${rank}`, class: 'rank-top10' };
    return { label: `#${rank}`, class: 'rank-other' };
  };

  const rankInfo = getRankInfo(match.result.rank);

  // 백드롭 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className={`modal-rank-badge ${rankInfo.class}`}>
              #{match.result.rank}
            </div>
            <div className="modal-match-info">
              <h2 className="modal-title">{getModeLabel(match.mode)}</h2>
              <p className="modal-subtitle">
                {match.map} · {format(new Date(match.playedAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body">
          {/* 주요 통계 */}
          <div className="modal-section">
            <h3 className="section-title">주요 통계</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-label">순위</div>
                <div className="stat-card-value">{rankInfo.label}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">킬</div>
                <div className="stat-card-value">{match.result.kills}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">데스</div>
                <div className="stat-card-value">{match.result.deaths}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">어시스트</div>
                <div className="stat-card-value">{match.result.assists}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">데미지</div>
                <div className="stat-card-value">{match.result.damage.toFixed(1)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">생존시간</div>
                <div className="stat-card-value">{formatSurvivalTime(match.result.survivalTime)}</div>
              </div>
            </div>
          </div>

          {/* 상세 통계 */}
          <div className="modal-section">
            <h3 className="section-title">상세 통계</h3>
            <div className="detail-stats-list">
              {match.result.headshotKills > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">헤드샷 킬</span>
                  <span className="detail-stat-value">{match.result.headshotKills}</span>
                </div>
              )}
              {match.result.longestKill > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">최장 킬 거리</span>
                  <span className="detail-stat-value">{match.result.longestKill.toFixed(1)}m</span>
                </div>
              )}
              {match.result.rideDistance > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">이동 거리</span>
                  <span className="detail-stat-value">{(match.result.rideDistance / 1000).toFixed(2)}km</span>
                </div>
              )}
              {match.result.walkDistance > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">도보 거리</span>
                  <span className="detail-stat-value">{(match.result.walkDistance / 1000).toFixed(2)}km</span>
                </div>
              )}
              {match.result.heals > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">회복 아이템 사용</span>
                  <span className="detail-stat-value">{match.result.heals}</span>
                </div>
              )}
              {match.result.boosts > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">부스트 아이템 사용</span>
                  <span className="detail-stat-value">{match.result.boosts}</span>
                </div>
              )}
              {match.result.weaponsAcquired > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">획득한 무기</span>
                  <span className="detail-stat-value">{match.result.weaponsAcquired}</span>
                </div>
              )}
              {match.result.damageDealt > 0 && (
                <div className="detail-stat-row">
                  <span className="detail-stat-label">총 피해량</span>
                  <span className="detail-stat-value">{match.result.damageDealt.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 매치 ID */}
          <div className="modal-section">
            <div className="match-id-section">
              <span className="match-id-label">매치 ID</span>
              <code className="match-id-value">{match.matchId}</code>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button className="modal-close-footer-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
