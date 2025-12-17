import React from 'react';
import Layout from '../components/Layout';
import useRankStream from '../hooks/useRankStream';
import { formatSecondsToClock, formatSecondsToDurationLabel, formatTimestamp } from '../utils/time';
import '../styles/pubg-rank.css';

const DEFAULT_COUNT = 20;

const STREAM_STATUS_LABELS = {
  idle: '대기 중',
  connecting: '실시간 연결 중…',
  open: '실시간 업데이트 연결됨',
  error: '연결 끊김 - 재시도 중',
  unsupported: '브라우저에서 SSE를 지원하지 않습니다',
};

export default function PubgRank() {
  const count = DEFAULT_COUNT;

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
      { podiumClass: 'podium-silver', circleClass: 'circle-silver', rankLabel: '2위', player: topThree[1] },
      { podiumClass: 'podium-gold', circleClass: 'circle-gold', rankLabel: '1위', player: topThree[0] },
      { podiumClass: 'podium-bronze', circleClass: 'circle-bronze', rankLabel: '3위', player: topThree[2] },
    ];
  }, [rankings]);

  const streamLabel = STREAM_STATUS_LABELS[streamStatus] ?? STREAM_STATUS_LABELS.idle;

  const renderTableBody = () => (
    <tbody>
      {rankings.map((entry, index) => {
        const displayRank = entry.rank ?? index + 1;
        const key = `${entry.gameCode || entry.memberName || 'rank'}-${index}`;
        return (
          <tr key={key}>
            <td className="col-rank">
              <span className="rank-badge">#{displayRank}</span>
            </td>
            <td className="col-member">
              <div className="member-name">{entry.memberName || 'Unknown'}</div>
              <div className="member-sub">{entry.memberRemark || 'PUBG Player'}</div>
            </td>
            <td className="col-playtime">
              <div className="playtime-primary">
                {formatSecondsToClock(entry.totalPlayTime)}
              </div>
              <div className="playtime-secondary">
                {formatSecondsToDurationLabel(entry.totalPlayTime)}
              </div>
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
            {podiumPlayers.map(({ podiumClass, circleClass, rankLabel, player }) => (
              <div className={`podium ${podiumClass}`} key={podiumClass}>
                <div className={`circle ${circleClass}`}>
                  <span className="circle-name">
                    {player?.memberName || '선발대 대기 중'}
                  </span>
                </div>
                <div className="podium-rank-label">{rankLabel}</div>
              </div>
            ))}
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
