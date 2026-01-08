import React from 'react';
import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { isAdmin, isAuthenticated, getRoleFromToken, canAccessRestrictedPages } from '../utils/discord-auth';
import '../styles/components.css';

export default function Sidebar() {
  const showSidebar = useStore((s) => s.showSidebar);
  const userIsAdmin = isAuthenticated() && isAdmin();
  const userRole = isAuthenticated() ? getRoleFromToken() : null;
  const memberOnly = userRole === 'MEMBER';
  const hasRestrictedAccess = canAccessRestrictedPages();

  // 제한된 페이지 목록 (MEMBER 권한만 있거나 로그인 안한 사용자는 접근 불가)
  const restrictedPages = ['/tier', '/pubg-rank', '/blacklist', '/ledger', '/reports'];

  const navItems = [
    { to: '/', label: 'Members', end: true },
    { to: '/tier', label: 'TKTK Tier' },
    { to: '/pubg-rank', label: 'PUBG Rank' },
    { to: '/reports', label: 'Reports' },
    { to: '/blacklist', label: 'Blacklist' },
    { to: '/ledger', label: 'Fund Ledger' }
  ];

  // 접근 권한이 없는 경우 제한된 페이지 필터링
  const visibleItems = hasRestrictedAccess
    ? navItems
    : navItems.filter((item) => !restrictedPages.includes(item.to));

  return (
    <aside className={`sidebar ${showSidebar ? 'open' : ''}`} aria-label="Sidebar">
      <nav>
        <ul>
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            </li>
          ))}
          {userIsAdmin && <li><NavLink to="/settings">Settings</NavLink></li>}
        </ul>
        {!hasRestrictedAccess && isAuthenticated() && (
          <div className="sidebar-info-box">
            <p>
              클랜 가입을 완료하면 랭킹, 리포트, 장부 등 다양한 기능을 이용할 수 있어요.
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
}
