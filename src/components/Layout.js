import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingButton from './FloatingButton';
import '../styles/layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-root">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
      <FloatingButton />
    </div>
  );
}