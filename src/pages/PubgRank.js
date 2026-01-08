import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useRankStream from '../hooks/useRankStream';
import { formatSecondsToClock, formatSecondsToDurationLabel, formatTimestamp } from '../utils/time';
import { canAccessRestrictedPages } from '../utils/discord-auth';
import '../styles/pubg-rank.css';

const DEFAULT_COUNT = 20;

const STREAM_STATUS_LABELS = {
  idle: '대기 중',
  connecting: '실시간 연결 중…',
  open: '실시간 업데이트 연결됨',
  error: '연결 끊김 - 재시도 중',
  unsupported: '브라우저에서 SSE를 지원하지 않습니다',
};

const formatLastPlayed = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const dateLabel = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return {
    dateLabel,
    timeLabel: formatTimestamp(date),
  };
};

const getPlayerAvatarUrl = (player) => {
  if (!player) return null;
  return (
    player.discordAvatarUrl ||
    player.avatarUrl ||
    player.profileImageUrl ||
    player.memberAvatarUrl ||
    player.memberAvatar ||
    player.avatar ||
    null
  );
};

const getPlayerInitial = (player) => {
  if (!player?.memberName) return 'P';
  return player.memberName.charAt(0).toUpperCase();
};

export default function PubgRank() {
  const navigate = useNavigate();
  const count = DEFAULT_COUNT;
  const hasAccess = canAccessRestrictedPages();

  const {
    rankings,
    isLoading,
    isRefreshing,
    error,
    lastUpdatedAt,
    streamStatus,
  } = useRankStream({ count });

  const podiumPlayers = React.useMemo(() => {
    const topThree = rankings.slice(0, 3);
    while (topThree.length < 3) {
      topThree.push(null);
    }
    return [
      { rank: 2, asset: '2p.svg', player: topThree[1] },
      { rank: 1, asset: '1p.svg', player: topThree[0] },
      { rank: 3, asset: '3p.svg', player: topThree[2] },
    ];
  }, [rankings]);

  const streamLabel = STREAM_STATUS_LABELS[streamStatus] ?? STREAM_STATUS_LABELS.idle;

  // 권한 체크 (MEMBER만 있는 사용자나 로그인 안한 사용자는 접근 불가)
  React.useEffect(() => {
    if (!hasAccess) {
      alert('이 페이지에 접근할 수 있는 권한이 없습니다.');
      navigate('/');
    }
  }, [hasAccess, navigate]);

  // 권한이 없는 경우 렌더링하지 않음
  if (!hasAccess) {
    return null;
  }

  const renderTableBody = () => (
    <tbody>
      {rankings.map((entry, index) => {
        const displayRank = entry.rank ?? index + 1;
        const key = `${entry.gameCode || entry.memberName || 'rank'}-${index}`;
        const lastPlayed = formatLastPlayed(entry.lastPlayedAt);
        const entryAvatarUrl = getPlayerAvatarUrl(entry);
        const entryInitial = getPlayerInitial(entry);
        return (
          <tr key={key}>
            <td className="col-rank">
              <span className="rank-badge">#{displayRank}</span>
            </td>
            <td className="col-member">
              <div className="member-info">
                <div className={`member-avatar ${entryAvatarUrl ? '' : 'placeholder'}`}>
                  {entryAvatarUrl ? (
                    <img src={entryAvatarUrl} alt={`${entry.memberName || '랭커'} 아바타`} />
                  ) : (
                    <span>{entryInitial}</span>
                  )}
                </div>
                <div className="member-text">
                  <div className="member-name">{entry.memberName || 'Unknown'}</div>
                  <div className="member-sub">{entry.discordName || 'PUBG Player'}</div>
                </div>
              </div>
            </td>
            <td className="col-playtime">
              <div className="playtime-cell">
                <div className="playtime-primary">
                  {formatSecondsToClock(entry.totalPlayTime)}
                </div>
                <div className="playtime-secondary">
                  {formatSecondsToDurationLabel(entry.totalPlayTime)}
                </div>
              </div>
            </td>
            <td className="col-last-played">
              {entry.lastPlayTime ? (
                (() => {
                  const formatted = formatLastPlayed(entry.lastPlayTime);
                  return (
                    <div className="last-played-cell">
                      <span className="last-played-date">{formatted?.dateLabel || '정보 없음'}</span>
                      {formatted?.timeLabel && (
                        <span className="last-played-time">{formatted.timeLabel}</span>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="last-played-empty">-</div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <Layout>
      <div className="pubg-rank-page">
        <div className="rank-header">
          <div className="rank-intro">
            <h1 className="rank-title">PUBG 실시간 랭킹</h1>
          </div>
        </div>

        <div className="vanguard-card">
          <div className="rank-podium-wrapper">
            {podiumPlayers.map(({ rank, asset, player }, idx) => {
              const avatarUrl = getPlayerAvatarUrl(player);
              const initials = getPlayerInitial(player);
              return (
                <div className={`podium-slot podium-rank-${rank}`} key={`podium-${rank}`}>
                  <div className="podium-figure">
                    <img
                      className="podium-base"
                      src={`/assets/tiers/${asset}`}
                      alt={`${rank}위 포디움`}
                      draggable="false"
                    />
                    <div
                      className={`podium-avatar ${avatarUrl ? '' : 'placeholder'}`}
                      style={{ animationDelay: `${idx * 0.15}s` }}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={`${player?.memberName || '랭커'} 아바타`} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </div>
                  <div className="podium-meta">
                    <div className="podium-name">{player?.memberName || '대기 중'}</div>
                    <div className="podium-rank-label">{rank}위</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="stream-status-inline">
            <span className={`stream-indicator stream-${streamStatus}`} aria-label={streamLabel} />
            <span className="stream-status-inline-text">{streamLabel}</span>
            <span className="stream-status-inline-divider">·</span>
            <span className="stream-updated-inline">
              {lastUpdatedAt ? `마지막 스냅샷 ${formatTimestamp(lastUpdatedAt)}` : '스냅샷을 불러오는 중…'}
            </span>
          </div>
        </div>

        {isRefreshing && (
          <div className="stream-refresh-inline">데이터 갱신 중…</div>
        )}

        {error && (
          <div className="error-banner">
            <p>데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            <pre>{error.message}</pre>
          </div>
        )}

        <div className="rank-table-card">
          {isLoading ? (
            <div className="loading-state">
              <span className="loading-spinner" />
              <p>랭킹 데이터를 불러오는 중입니다…</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="empty-state">
              <p>표시할 랭킹 데이터가 없습니다.</p>
              <p>서버에 새로운 데이터가 들어오면 자동으로 채워집니다.</p>
            </div>
          ) : (
            <table className="rank-table">
              <thead>
                <tr>
              <th className="col-rank">순위</th>
              <th className="col-member">멤버</th>
              <th className="col-playtime">누적 플레이 타임</th>
              <th className="col-last-played">마지막 플레이</th>
            </tr>
          </thead>
              {renderTableBody()}
            </table>
          )}
        </div>

        <div className="rank-guideline">
          <h3>🕒 랭킹 반영 안내</h3>
          <ul>
            <li><strong>오늘 처음 가입하셨나요?</strong>
      게임 시간이 랭킹에 반영되기까지 약 <strong>10분 ~ 최대 1시간</strong> 정도 걸릴 수 있어요.</li>

  <li>매치 결과가 서버에 업데이트되면
      랭킹은 보통 <strong>1~5분 내로 자동 반영</strong>됩니다.</li>

  <li>랭킹 기록은 <strong>가입일 이후 플레이한 매치부터</strong> 누적됩니다.</li>

  <li>⚠️ <strong>매치 종료 전에 나간 게임은</strong> 정상적인 플레이로 인정되지 않아 누적 시간에 포함되지 않습니다.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
