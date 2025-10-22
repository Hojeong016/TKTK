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
        <button className="btn btn-icon" aria-label="Open search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}