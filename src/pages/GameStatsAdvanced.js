import React from 'react';
import PerformanceTrendChart from '../components/PerformanceTrendChart';
import StatsComparisonBar from '../components/StatsComparisonBar';
import MapStatsGrid from '../components/MapStatsGrid';
import SeasonComparison from '../components/SeasonComparison';
import { AchievementGrid } from '../components/AchievementCard';
import {
  performanceTrends,
  modeComparison,
  maps,
  seasons,
  achievements
} from '../data/dummyGameStats';
import '../styles/game-stats-advanced.css';

/**
 * GameStatsAdvanced - 고급 게임 통계 페이지
 * 모든 차트 및 그래프 컴포넌트를 한 곳에서 확인
 */
export default function GameStatsAdvanced() {
  return (
    <div className="game-stats-advanced">
      <div className="page-header">
        <h1 className="page-title">고급 게임 통계</h1>
        <p className="page-description">
          상세한 성적 분석과 다양한 통계를 확인하세요
        </p>
      </div>

      <div className="stats-sections">
        {/* 성적 추이 차트 */}
        <section className="stats-section">
          <PerformanceTrendChart performanceTrends={performanceTrends} />
        </section>

        {/* 모드별 비교 */}
        <section className="stats-section">
          <StatsComparisonBar modeComparison={modeComparison} />
        </section>

        {/* 시즌별 비교 */}
        <section className="stats-section">
          <SeasonComparison seasons={seasons} currentSeason="2024-06" />
        </section>

        {/* 맵별 통계 */}
        <section className="stats-section">
          <MapStatsGrid maps={maps} />
        </section>

        {/* 업적 */}
        <section className="stats-section">
          <AchievementGrid achievements={achievements} filter="all" />
        </section>
      </div>
    </div>
  );
}
