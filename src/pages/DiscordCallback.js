import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { verifyState, setAccessToken, setRefreshToken, setUser, setSignupToken } from '../utils/discord-auth';

export default function DiscordCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // 에러가 있는 경우
        if (errorParam) {
          setError('사용자가 인증을 취소했습니다.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // code가 없는 경우
        if (!code) {
          setError('인증 코드를 받지 못했습니다.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // state 검증 (CSRF 방지)
        if (!verifyState(state)) {
          setError('잘못된 요청입니다. 다시 시도해주세요.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // 백엔드로 code 전송하여 토큰 교환
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
        const response = await axios.post(`${apiBaseUrl}/api/auth/discord`, { code });

        // 백엔드 응답 구조: ApiResponse<SignupRequired | AuthTokens>
        const result = response.data;

        if (!result.success) {
          setError(result.error?.message || '로그인 처리 중 오류가 발생했습니다.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!result.data) {
          setError('응답 데이터가 없습니다.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // 신규 회원 (token 필드가 있는 경우)
        if ('token' in result.data) {
          setSignupToken(result.data.token);
          setStatus('success');

          // 1초 후 회원가입 페이지로 리다이렉트
          setTimeout(() => {
            navigate('/signup/complete');
          }, 1000);
        }
        // 기존 회원 (tokenType, accessToken, refreshToken 필드가 있는 경우)
        else {
          const { accessToken, refreshToken } = result.data;

          // 토큰 저장
          if (accessToken) {
            setAccessToken(accessToken);
          }

          if (refreshToken) {
            setRefreshToken(refreshToken);
          }

          // 프로필 조회하여 사용자 정보 저장
          try {
            const profileResponse = await axios.get(
              `${apiBaseUrl}/api/me`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              }
            );

            const profileResult = profileResponse.data;
            const userData = profileResult.data;

            // 사용자 정보 저장
            if (userData) {
              setUser(userData);
            }
          } catch (profileErr) {
            console.warn('프로필 조회 실패:', profileErr);
          }

          setStatus('success');

          // 1초 후 홈으로 리다이렉트
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }

      } catch (err) {
        console.error('Discord 로그인 실패:', err);
        setError(err.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.');
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9'
        }}
      >
        {status === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                margin: '0 auto 1.5rem'
              }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              로그인 처리 중...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Discord 계정을 확인하고 있습니다.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: '56px',
                height: '56px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem'
              }}
            >
              ✓
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              로그인 성공!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              메인 페이지로 이동합니다...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: '56px',
                height: '56px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem'
              }}
            >
              ✕
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              로그인 실패
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>
              {error}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              잠시 후 홈으로 돌아갑니다...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
