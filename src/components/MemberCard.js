import React from 'react';
import { getTierIcon } from '../constants/tiers';
import { getRightLabel } from '../constants/rights';

/**
 * member shape:
 * {
 *  id, name,
 *  info: { discordname, gamename, koreaname, birthday, description },
 *  discord: { right, join },
 *  game: { tier, gamename },
 *  streaming: { soop, chzzk },
 *  memberofthestaff: { name }
 * }
 */
export default function MemberCard({ member, onSelect }) {
  if (!member) return null;

  const gamename = member.game?.gamename || member.info?.gamename || member.name || 'Unknown';
  const displayName = member.info?.koreaname || member.name || gamename;
  const discordName = member.info?.discordname || '—';
  const tier = member.game?.tier || 'free';

  // right를 배열로 처리
  const rightValue = member.discord?.right || [];
  const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
  const joinRaw = member.discord?.join;
  const joined = joinRaw ? new Date(joinRaw) : null;
  const joinedText = joined ? `${joined.getFullYear()}년 ${String(joined.getMonth()+1).padStart(2,'0')}월 ${String(joined.getDate()).padStart(2,'0')}일` : '—';

  // Format birthday
  const birthdayRaw = member.info?.birthday;
  const formatBirthday = (bd) => {
    if (!bd) return null;
    const match = bd.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}년 ${match[2]}월 ${match[3]}일`;
    }
    return bd;
  };
  const birthdayText = formatBirthday(birthdayRaw);

  const streaming = member.streaming || {};
  const staff = member.memberofthestaff?.name || null;

  return (
    <article
      className="member-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(member)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect?.(member); }}
      aria-label={`Open ${displayName}`}
    >
      <div className="tier-avatar-wrap" aria-hidden="true">
        {getTierIcon(tier, { className: 'tier-avatar-img', title: `Tier: ${tier}` })}
      </div>

      <div className="member-body">
        <div className="member-header">
          <div className="member-name-block">
            <div className="member-name">{gamename}</div>
            <div className="member-sub">{discordName} · {displayName}</div>
          </div>

          <div className="member-actions-block">
            {rights.map((r, index) => {
              const rightLower = String(r).toLowerCase();
              const rightLabel = getRightLabel(r) || r;
              return (
                <div key={index} className={`badge badge-right badge-${rightLower}`}>
                  {rightLabel}
                </div>
              );
            })}
          </div>
        </div>

        <div className="member-desc">{member.info?.description || member.desc || ''}</div>

        <div className="member-info-grid">
          <div className="info-item">
            <div className="info-content">
              <span className="info-label">생일</span>
              <span className="info-value">{birthdayText || '정보 없음'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-content">
              <span className="info-label">가입일</span>
              <span className="info-value">{joinedText}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-content">
              <span className="info-label">담당 일진</span>
              <span className="info-value">{staff || '정보 없음'}</span>
            </div>
          </div>
        </div>

        <div className="member-footer">
          <div className="member-streams-footer">
            {streaming.soop && (
              <a className="stream-btn" href={streaming.soop} target="_blank" rel="noreferrer">Soop</a>
            )}
            {streaming.chzzk && (
              <a className="stream-btn" href={streaming.chzzk} target="_blank" rel="noreferrer">Chzzk</a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}