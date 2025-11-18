import React from 'react';
import authService from '../api/authService';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import '../styles/login.css';

/**
 * Login - 관리자 로그인 컴포넌트
 */
export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [userName, setUserName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast, showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !password) {
      showToast('error', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(userName, password);
      showToast('success', '로그인 성공!');

      // 로그인 성공 콜백
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('error', `로그인 실패: ${error.message || '아이디 또는 비밀번호를 확인해주세요.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">관리자 로그인</h1>
          <p className="login-subtitle">TKTK CLAN Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="form-input-login"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="form-input-login"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <div className="auth-switch">
            계정이 없으신가요?{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={onSwitchToSignup}
              disabled={isLoading}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>

      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
