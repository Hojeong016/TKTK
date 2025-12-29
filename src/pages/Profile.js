import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { getUser, isAuthenticated } from '../utils/discord-auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로그인 확인
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    // 저장된 사용자 정보 로드
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setLoading(false);
    } else {
      // 사용자 정보가 없으면 API에서 가져오기
      fetchUserProfile();
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('discord_access_token');

      const response = await axios.get(`${apiBaseUrl}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      } else {
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatusInfo = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { text: '연동 완료', color: '#10b981', bg: '#d1fae5' };
      case 'PENDING':
      case 'REQUEST':
        return { text: '연동 중', color: '#3b82f6', bg: '#dbeafe' };
      case 'FAILED':
        return { text: '연동 실패', color: '#ef4444', bg: '#fee2e2' };
      default:
        return { text: '미연동', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getTierColor = (tier) => {
    const tierColors = {
      MASTER: '#a855f7',
      DIAMOND: '#3b82f6',
      PLATINUM: '#06b6d4',
      GOLD: '#f59e0b',
      SILVER: '#94a3b8',
      BRONZE: '#d97706',
      UNRANKED: '#6b7280'
    };
    return tierColors[tier] || '#6b7280';
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%'
            }}
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const syncStatus = getSyncStatusInfo(user.game?.syncStatus);

  return (
    <Layout>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '2rem',
            color: '#1e293b'
          }}>
            My Profile
          </h1>

          {/* 기본 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              {user.info?.avatar ? (
                <img
                  src={user.info.avatar}
                  alt={user.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid #e5e7eb'
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: 'white',
                  fontWeight: 700
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.25rem'
                }}>
                  {user.name}
                </h2>
                {user.info?.koreaname && (
                  <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    {user.info.koreaname}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <InfoItem label="Discord 이름" value={user.info?.discordname || '-'} />
              <InfoItem label="생일" value={user.info?.birthday || '-'} />
            </div>
          </motion.div>

          {/* 게임 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🎮</span>
              게임 정보
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <InfoItem label="PUBG 닉네임" value={user.game?.gamename || '-'} />
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontWeight: 500
                }}>
                  티어
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: getTierColor(user.game?.tier)
                  }}>
                    {user.game?.tier || 'UNRANKED'}
                  </span>
                </div>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontWeight: 500
                }}>
                  연동 상태
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    background: syncStatus.bg,
                    border: `1px solid ${syncStatus.color}`,
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: syncStatus.color
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: syncStatus.color
                    }} />
                    {syncStatus.text}
                  </span>
                </div>
                {user.game?.syncStatus === 'FAILED' && user.game?.failReason && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    marginTop: '0.5rem'
                  }}>
                    {user.game.failReason}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* 스트리밍 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📺</span>
              스트리밍 정보
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <StreamingLink label="숲" url={user.streaming?.soop} />
              <StreamingLink label="치지직" url={user.streaming?.chzzk} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}

// 정보 아이템 컴포넌트
function InfoItem({ label, value }) {
  return (
    <div>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '0.5rem',
        fontWeight: 500
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '1rem',
        color: '#1e293b',
        fontWeight: 600
      }}>
        {value}
      </p>
    </div>
  );
}

// 스트리밍 링크 컴포넌트
function StreamingLink({ label, url }) {
  if (!url) {
    return (
      <div>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
          fontWeight: 500
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#9ca3af'
        }}>
          미등록
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '0.5rem',
        fontWeight: 500
      }}>
        {label}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '1rem',
          color: '#3b82f6',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontWeight: 500
        }}
      >
        <span>바로가기</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}
