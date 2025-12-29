import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getSignupToken, removeSignupToken, setAccessToken, setRefreshToken, setUser } from '../utils/discord-auth';

export default function SignupComplete() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gameName: '',
    name: '',
    birthday: '',
    soop: '',
    chzzk: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [gameSyncStatus, setGameSyncStatus] = useState(null); // 'success', 'warning', 'info'
  const [gameSyncMessage, setGameSyncMessage] = useState('');

  useEffect(() => {
    // signup token이 없으면 홈으로 리다이렉트
    const signupToken = getSignupToken();
    if (!signupToken) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // gameName 필수 검증
    if (!formData.gameName.trim()) {
      newErrors.gameName = 'PUBG 게임 닉네임은 필수입니다.';
    }

    // birthday 형식 검증 (선택이지만 입력했다면 검증)
    if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      newErrors.birthday = '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)';
    }

    // URL 형식 검증 (선택이지만 입력했다면 간단히 검증)
    if (formData.soop && !formData.soop.startsWith('http')) {
      newErrors.soop = 'URL은 http:// 또는 https://로 시작해야 합니다.';
    }

    if (formData.chzzk && !formData.chzzk.startsWith('http')) {
      newErrors.chzzk = 'URL은 http:// 또는 https://로 시작해야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const signupToken = getSignupToken();
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

      // 선택 필드는 값이 있을 때만 포함
      const payload = {
        gameName: formData.gameName.trim()
      };

      if (formData.name.trim()) payload.name = formData.name.trim();
      if (formData.birthday.trim()) payload.birthday = formData.birthday.trim();
      if (formData.soop.trim()) payload.soop = formData.soop.trim();
      if (formData.chzzk.trim()) payload.chzzk = formData.chzzk.trim();

      const response = await axios.post(
        `${apiBaseUrl}/api/auth/discord/complete-signup`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${signupToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      if (!result.success) {
        setSubmitError(result.error?.message || '회원가입 처리 중 오류가 발생했습니다.');
        setIsSubmitting(false);
        return;
      }

      if (!result.data) {
        setSubmitError('응답 데이터가 없습니다.');
        setIsSubmitting(false);
        return;
      }

      // 토큰 저장
      const { accessToken, refreshToken } = result.data;

      if (accessToken) {
        setAccessToken(accessToken);
      }

      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // signup token 제거
      removeSignupToken();

      // 프로필 조회하여 게임 연동 상태 확인
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
        const gameInfo = userData?.game;

        // 사용자 정보 저장
        if (userData) {
          setUser(userData);
        }

        // 게임 연동 상태에 따른 메시지 표시
        if (gameInfo?.syncStatus === 'SUCCESS') {
          setGameSyncStatus('success');
          setGameSyncMessage('회원가입 완료! PUBG 계정도 연동되었습니다.');
        } else if (gameInfo?.syncStatus === 'PENDING' || gameInfo?.syncStatus === 'REQUEST') {
          setGameSyncStatus('info');
          setGameSyncMessage('PUBG 계정 연동 중입니다. 잠시만 기다려주세요...');
        } else if (gameInfo?.syncStatus === 'FAILED') {
          setGameSyncStatus('warning');
          setGameSyncMessage(
            '회원가입은 완료되었으나, PUBG 계정 연동에 실패했습니다.\n' +
            '입력한 게임 닉네임이 정확한지 확인해주세요.\n' +
            '문제가 지속되면 관리자에게 문의해주세요.'
          );
        } else {
          setGameSyncStatus('warning');
          setGameSyncMessage('게임 정보가 등록되지 않았습니다.');
        }
      } catch (profileErr) {
        console.warn('프로필 조회 실패:', profileErr);
        // 프로필 조회 실패해도 회원가입은 완료된 상태이므로 경고만 표시
        setGameSyncStatus('info');
        setGameSyncMessage('회원가입이 완료되었습니다.');
      }

      setIsSubmitting(false);

      // 2초 후 홈으로 리다이렉트
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('회원가입 완료 실패:', err);

      // Signup token 만료 에러 처리
      if (err.response?.status === 401) {
        setSubmitError('회원가입 시간이 만료되었습니다. 다시 로그인해주세요.');
        removeSignupToken();
        setTimeout(() => navigate('/'), 3000);
      } else {
        setSubmitError(err.response?.data?.error?.message || '회원가입 처리 중 오류가 발생했습니다.');
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 118, 110, 0.8))',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: '#1e293b',
          textAlign: 'center'
        }}>
          회원가입 완료
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          추가 정보를 입력해주세요
        </p>

        {submitError && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
            fontSize: '0.9rem'
          }}>
            {submitError}
          </div>
        )}

        {gameSyncMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: gameSyncStatus === 'success' ? '#d1fae5' : gameSyncStatus === 'warning' ? '#fef3c7' : '#dbeafe',
              border: `1px solid ${gameSyncStatus === 'success' ? '#10b981' : gameSyncStatus === 'warning' ? '#f59e0b' : '#3b82f6'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: gameSyncStatus === 'success' ? '#065f46' : gameSyncStatus === 'warning' ? '#92400e' : '#1e40af',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line'
            }}
          >
            {gameSyncMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* PUBG 게임 닉네임 (필수) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              PUBG 게임 닉네임 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="gameName"
              value={formData.gameName}
              onChange={handleChange}
              placeholder="게임 닉네임을 입력하세요"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: errors.gameName ? '2px solid #ef4444' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.gameName) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.gameName) e.target.style.borderColor = '#e2e8f0';
              }}
            />
            {errors.gameName && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.gameName}
              </p>
            )}
          </div>

          {/* 이름 (선택) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              이름 또는 닉네임
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="선택사항"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* 생일 (선택) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              생일
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: errors.birthday ? '2px solid #ef4444' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.birthday) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.birthday) e.target.style.borderColor = '#e2e8f0';
              }}
            />
            {errors.birthday && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.birthday}
              </p>
            )}
          </div>

          {/* 숲 스트리밍 URL (선택) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              숲 스트리밍 URL
            </label>
            <input
              type="text"
              name="soop"
              value={formData.soop}
              onChange={handleChange}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: errors.soop ? '2px solid #ef4444' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.soop) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.soop) e.target.style.borderColor = '#e2e8f0';
              }}
            />
            {errors.soop && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.soop}
              </p>
            )}
          </div>

          {/* 치지직 스트리밍 URL (선택) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              치지직 스트리밍 URL
            </label>
            <input
              type="text"
              name="chzzk"
              value={formData.chzzk}
              onChange={handleChange}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: errors.chzzk ? '2px solid #ef4444' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.chzzk) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!errors.chzzk) e.target.style.borderColor = '#e2e8f0';
              }}
            />
            {errors.chzzk && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {errors.chzzk}
              </p>
            )}
          </div>

          {/* 제출 버튼 */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? '처리 중...' : '회원가입 완료'}
          </motion.button>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            * 표시는 필수 입력 항목입니다
          </p>
        </form>
      </motion.div>
    </div>
  );
}
