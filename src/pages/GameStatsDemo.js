import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import ActivityHeatmap from '../components/ActivityHeatmap';
import MatchTimeline from '../components/MatchTimeline';
import GameStatsCards from '../components/GameStatsCards';
import {
  generateActivityData,
  activitySummary,
  overallStats,
  recentMatches,
  statsByMode,
  mapStats,
  weaponStats
} from '../data/dummyGameStats';

/**
 * GameStatsDemo - 게임 통계 컴포넌트 데모 페이지
 * 새로 만든 컴포넌트들을 테스트하기 위한 페이지
 */
export default function GameStatsDemo() {
  const [activityData] = useState(generateActivityData());

  return (
    <Layout>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div style={{
            marginBottom: '2rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              margin: 0
            }}>
              Game Statistics Demo
            </h1>
            <p style={{
              fontSize: '1rem',
              opacity: 0.9,
              margin: '0.5rem 0 0 0'
            }}>
              GitHub 잔디 스타일 활동 히트맵 + 매치 이력 + 게임 통계
            </p>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap data={activityData} summary={activitySummary} />

          {/* Main Stats Cards */}
          <GameStatsCards stats={overallStats} />

          {/* Recent Matches */}
          <MatchTimeline matches={recentMatches} limit={10} />

          {/* Additional Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {/* 모드별 통계 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                모드별 통계
              </h3>
              {Object.entries(statsByMode).map(([mode, stats]) => (
                <div key={mode} style={{
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      textTransform: 'uppercase'
                    }}>
                      {mode}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {stats.totalMatches}경기
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <div style={{ color: '#6b7280' }}>K/D</div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>
                        {stats.kd.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280' }}>승률</div>
                      <div style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {stats.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280' }}>평균 DMG</div>
                      <div style={{ fontWeight: 700, color: '#f59e0b' }}>
                        {stats.avgDamage.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 선호 맵 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                맵별 통계
              </h3>
              {mapStats.map((map) => (
                <div key={map.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {map.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      승률 {map.winRate.toFixed(1)}% • K/D {map.kd.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#667eea'
                  }}>
                    {map.matches}경기
                  </div>
                </div>
              ))}
            </div>

            {/* 무기 통계 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: '0 0 1.5rem 0',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                무기별 통계
              </h3>
              {weaponStats.map((weapon) => (
                <div key={weapon.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {weapon.name}
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: 400
                      }}>
                        ({weapon.type})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      헤드샷 {weapon.headshotRate.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#ef4444'
                  }}>
                    {weapon.kills}킬
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Footer */}
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              💡 이 페이지는 더미 데이터로 새로운 게임 통계 컴포넌트들을 테스트하는 데모입니다.
              <br />
              실제 API 연동 시 <code style={{
                background: '#e5e7eb',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                fontSize: '0.8125rem'
              }}>/api/game/stats</code> 엔드포인트와 연결됩니다.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
