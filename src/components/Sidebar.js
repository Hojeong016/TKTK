import React from 'react';
import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import '../styles/components.css';

export default function Sidebar() {
  const showSidebar = useStore((s) => s.showSidebar);
  return (
    <aside className={`sidebar ${showSidebar ? 'open' : ''}`} aria-label="Sidebar">
      <nav>
        <ul>
          <li><NavLink to="/" end>Members</NavLink></li>
          <li><NavLink to="/tier">TKTK Tier</NavLink></li>
          <li><NavLink to="/pubg-rank">PUBG Rank</NavLink></li>
          <li><NavLink to="/reports">Reports</NavLink></li>
          <li><NavLink to="/settings">Settings</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}