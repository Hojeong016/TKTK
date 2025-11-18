import React from 'react';
import authService from '../api/authService';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import '../styles/login.css';

/**
 * Signup - 관리자 회원가입 컴포넌트
 */
export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = React.useState({
    userName: '',
    nickName: '',
    password: '',
    passwordConfirm: '',
    adminCode: ''
  });
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast, showToast } = useToast();

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 사용자 이름 검증
    if (!formData.userName) {
      newErrors.userName = '사용자 이름은 필수입니다.';
    } else if (formData.userName.length < 4 || formData.userName.length > 20) {
      newErrors.userName = '사용자 이름은 4자 이상 20자 이하여야 합니다.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.userName)) {
      newErrors.userName = "사용자 이름은 영문, 숫자, '_', '-'만 사용 가능합니다.";
    }

    // 닉네임 검증
    if (!formData.nickName) {
      newErrors.nickName = '닉네임은 필수입니다.';
    } else if (formData.nickName.length < 2 || formData.nickName.length > 20) {
      newErrors.nickName = '닉네임은 2자 이상 20자 이하여야 합니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호는 필수입니다.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.';
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 관리자 코드 검증
    if (!formData.adminCode) {
      newErrors.adminCode = '관리자 코드는 필수입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 입력 시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', '입력 내용을 확인해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const {
        passwordConfirm,
        userName,
        nickName,
        ...rest
      } = formData;

      // 백엔드 DTO와 필드명을 맞춰 전송
      await authService.signup({
        ...rest,
        userName: userName,
        nickName: nickName
      });

      showToast('success', '회원가입에 성공했습니다. 로그인 페이지로 이동합니다.');

      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
      showToast('error', `회원가입 실패: ${error.message || '입력 정보를 확인해주세요.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">관리자 회원가입</h1>
          <p className="login-subtitle">TKTK CLAN Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* 사용자 이름 */}
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              사용자 이름 *
            </label>
            <input
              id="userName"
              type="text"
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              placeholder="영문, 숫자, _, - 사용 (4-20자)"
              className={`form-input-login ${errors.userName ? 'error' : ''}`}
              disabled={isLoading}
              autoFocus
            />
            {errors.userName && <span className="error-message">{errors.userName}</span>}
          </div>

          {/* 닉네임 */}
          <div className="form-group">
            <label htmlFor="nickName" className="form-label">
              닉네임 *
            </label>
            <input
              id="nickName"
              type="text"
              value={formData.nickName}
              onChange={(e) => handleChange('nickName', e.target.value)}
              placeholder="닉네임 (2-20자)"
              className={`form-input-login ${errors.nickName ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.nickName && <span className="error-message">{errors.nickName}</span>}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="영문, 숫자, 특수문자 포함 (8자 이상)"
              className={`form-input-login ${errors.password ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인 *
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => handleChange('passwordConfirm', e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className={`form-input-login ${errors.passwordConfirm ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.passwordConfirm && <span className="error-message">{errors.passwordConfirm}</span>}
          </div>

          {/* 관리자 코드 */}
          <div className="form-group">
            <label htmlFor="adminCode" className="form-label">
              관리자 코드 *
            </label>
            <input
              id="adminCode"
              type="text"
              value={formData.adminCode}
              onChange={(e) => handleChange('adminCode', e.target.value)}
              placeholder="관리자 코드를 입력하세요"
              className={`form-input-login ${errors.adminCode ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.adminCode && <span className="error-message">{errors.adminCode}</span>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '회원가입 중...' : '회원가입'}
          </button>

          <div className="auth-switch">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              로그인
            </button>
          </div>
        </form>
      </div>

      <Toast open={!!toast} message={toast?.message} type={toast?.type || 'success'} />
    </div>
  );
}
