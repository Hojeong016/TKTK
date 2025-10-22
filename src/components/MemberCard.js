import React from 'react';
import { getTierIcon } from '../constants/tiers';

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
  const right = (member.discord?.right || 'member').toLowerCase();
  const joinRaw = member.discord?.join;
  const joined = joinRaw ? new Date(joinRaw) : null;
  const joinedText = joined ? `${joined.getFullYear()}/${String(joined.getMonth()+1).padStart(2,'0')}/${String(joined.getDate()).padStart(2,'0')}` : '—';
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
            <div className={`badge badge-right badge-${right}`}>{right}</div>
          </div>
        </div>

        {member.info?.birthday && <div className="member-birthday">Birthday: {member.info.birthday}</div>}

        <div className="member-desc">{member.info?.description || member.desc || ''}</div>

        <div className="member-footer">
          <div className="member-meta">
            <span className="chip">Joined: {joinedText}</span>
            {staff && <span className="chip">Staff: {staff}</span>}
          </div>

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