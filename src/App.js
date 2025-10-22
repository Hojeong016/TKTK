import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
 return (
    <Routes>
      {/* 한 페이지 프로젝트: 모든 경로를 Home으로 라우팅 */}
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

export default App;
