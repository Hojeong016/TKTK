import React from 'react';
import { getTierIcon, TIERS } from '../constants/tiers';
import useStore from '../store/useStore';

/**
 * data: [{...member}]
 * onSelect: function(member)
 */
export default function MemberTable({ data = [], onSelect }) {
  const { rightsConfig } = useStore();

  if (!data || data.length === 0) return <p>No members</p>;

  const fmtJoin = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="table-container" role="region" aria-label="Members table">
      <table className="member-table" role="table" aria-label="Members">
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Game</th>
            <th scope="col">Discord</th>
            <th scope="col">Joined</th>
            <th scope="col">Streams</th>
            <th scope="col">Staff</th>
            <th scope="col" aria-hidden="true">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => {
            const gamename = m.game?.gamename || m.info?.gamename || m.name || '—';
            const discordName = m.info?.discordname || '—';
            const rightValue = m.discord?.right || [];
            const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
            return (
              <tr key={m.id} onClick={() => onSelect?.(m)} tabIndex={0}>
                <td data-label="Member">{m.info?.koreaname || m.name}<div className="td-sub">{gamename}</div></td>
                <td data-label="Game">
                  <div className="td-game">
                    {getTierIcon(m.game?.tier, { className: 'tier-icon-img tiny', title: m.game?.tier })}
                    <span className="td-game-text">{m.game?.tier ?? 'Free'}</span>
                  </div>
                </td>
                <td data-label="Discord">
                  {discordName}
                  <div className="td-sub td-rights">
                    {rights.map((rightKey, idx) => {
                      const config = rightsConfig.find(rc => rc.key === rightKey);
                      if (!config) return null;
                      return (
                        <span
                          key={idx}
                          className="right-tag"
                          style={{
                            color: config.color,
                            backgroundColor: config.bgColor
                          }}
                        >
                          {config.label}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td data-label="Joined">{fmtJoin(m.discord?.join)}</td>
                <td data-label="Streams">
                  <div className="td-streams">
                    {m.streaming?.soop && <a className="stream-btn small" href={m.streaming.soop} target="_blank" rel="noreferrer">Soop</a>}
                    {m.streaming?.chzzk && <a className="stream-btn small" href={m.streaming.chzzk} target="_blank" rel="noreferrer">Chzzk</a>}
                  </div>
                </td>
                <td data-label="Staff">{m.memberofthestaff?.name || '—'}</td>
                <td data-label="Actions">
                  <div className="table-row-actions">
                    <button className="btn-ghost" onClick={(e)=>{ e.stopPropagation(); onSelect?.(m); }}>View</button>
                    <button className="btn-primary" onClick={(e)=>{ e.stopPropagation(); /* edit */ }}>Edit</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}