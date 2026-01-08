import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Tier from './pages/Tier';
import PubgRank from './pages/PubgRank';
import Reports from './pages/Reports';
import Blacklist from './pages/Blacklist';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import DiscordCallback from './pages/DiscordCallback';
import SignupComplete from './pages/SignupComplete';
import Profile from './pages/Profile';
import GameStatsDemo from './pages/GameStatsDemo';
import GameStatsAdvanced from './pages/GameStatsAdvanced';
import useStore from './store/useStore';

function App() {
  const loadRightsConfig = useStore(state => state.loadRightsConfig);

  // 앱 시작 시 권한 설정 로드 (모든 사용자가 권한 배지를 볼 수 있도록)
  useEffect(() => {
    loadRightsConfig();
  }, [loadRightsConfig]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tier" element={<Tier />} />
      <Route path="/pubg-rank" element={<PubgRank />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/blacklist" element={<Blacklist />} />
      <Route path="/ledger" element={<Ledger />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/auth/callback" element={<DiscordCallback />} />
      <Route path="/signup/complete" element={<SignupComplete />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game-stats-demo" element={<GameStatsDemo />} />
      <Route path="/game-stats-advanced" element={<GameStatsAdvanced />} />
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

export default App;
