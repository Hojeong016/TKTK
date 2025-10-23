import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tier from './pages/Tier';
import PubgRank from './pages/PubgRank';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import useStore from './store/useStore';

function App() {
  const loadRightsConfig = useStore(state => state.loadRightsConfig);

  // Load rights configuration on mount
  React.useEffect(() => {
    loadRightsConfig();
  }, [loadRightsConfig]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tier" element={<Tier />} />
      <Route path="/pubg-rank" element={<PubgRank />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

export default App;
