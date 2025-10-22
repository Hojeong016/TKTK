import React from 'react';
import '../styles/components.css';
import useStore from '../store/useStore';

export default function Header() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const showSidebar = useStore((s) => s.showSidebar);

  return (
    <header className="header">
      <button
        className="btn-hamburger"
        aria-label="Toggle menu"
        aria-controls="app-sidebar"
        aria-expanded={showSidebar}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div className="brand">TKTK CLAN</div>

      <div className="header-actions">
        <input className="header-search" placeholder="Search members..." aria-label="Search members" />
        <button className="btn" aria-label="Open user menu">User</button>
      </div>
    </header>
  );
}