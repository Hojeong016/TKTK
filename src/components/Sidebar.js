import React from 'react';
import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { isAdmin, isAuthenticated, getRoleFromToken } from '../utils/discord-auth';
import '../styles/components.css';

export default function Sidebar() {
  const showSidebar = useStore((s) => s.showSidebar);
  const userIsAdmin = isAuthenticated() && isAdmin();
  const userRole = isAuthenticated() ? getRoleFromToken() : null;
  const memberOnly = userRole === 'MEMBER';

  const navItems = [
    { to: '/', label: 'Members', end: true },
    { to: '/tier', label: 'TKTK Tier' },
    { to: '/pubg-rank', label: 'PUBG Rank' },
    { to: '/reports', label: 'Reports' },
    { to: '/blacklist', label: 'Blacklist' },
    { to: '/ledger', label: 'Fund Ledger' }
  ];

  const visibleItems = memberOnly ? navItems.filter((item) => item.to === '/') : navItems;

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
      </nav>
    </aside>
  );
}
