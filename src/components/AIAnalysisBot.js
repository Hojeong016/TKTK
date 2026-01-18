import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ai-analysis-bot.css';

/**
 * AIAnalysisBot - AI 통계 분석 챗봇
 * 우측 하단에 귀여운 로봇이 통통 튀며, 클릭 시 챗봇 인터페이스 표시
 */
export default function AIAnalysisBot({ stats, isVisible = true }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 챗봇 열릴 때 환영 메시지
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          type: 'bot',
          text: '안녕하세요! 통계 분석 AI입니다. 어떤 분석이 필요하신가요?',
          timestamp: new Date()
        }]);
      }, 300);
    }
  }, [isChatOpen, messages.length]);

  // 분석 데이터 생성 함수 (기간별)
  const generateAnalysis = (period) => {
    const analyses = {
      'week': {
        title: '이번주 통계 분석',
        summary: "이번주 20경기를 분석한 결과, 평균 K/D 2.1로 지난주 대비 24% 향상되었습니다. Top 10 진입률 45%로 안정적인 플레이를 보이고 있습니다.",
        details: [
          "• 승률: 18% (3승/20경기)",
          "• 평균 킬: 3.8개 (지난주 대비 +0.9)",
          "• 평균 데미지: 487 (지난주 대비 +65)",
          "• 평균 생존시간: 26분 12초",
          "• 헤드샷 비율: 17% (지난주 대비 +3%)",
          "• 최장 킬 거리: 428m"
        ]
      },
      'month': {
        title: '한달 통계 분석',
        summary: "최근 한달 85경기를 분석한 결과, 평균 K/D 1.9로 전월 대비 15% 향상되었습니다. Top 10 진입률 42%로 꾸준한 성장세를 보이고 있습니다.",
        details: [
          "• 승률: 16% (14승/85경기)",
          "• 평균 킬: 3.4개 (전월 대비 +0.5)",
          "• 평균 데미지: 465 (전월 대비 +48)",
          "• 평균 생존시간: 24분 45초",
          "• 헤드샷 비율: 15% (전월 대비 +2%)",
          "• 총 플레이 시간: 35시간 18분"
        ]
      },
      'season': {
        title: '시즌 통계 분석',
        summary: "현재 시즌 전체 328경기를 분석한 결과, 평균 K/D 1.8로 시즌 초반 대비 22% 향상되었습니다. Top 10 진입률 40%로 플래티넘 티어 달성에 근접했습니다.",
        details: [
          "• 승률: 15% (49승/328경기)",
          "• 평균 킬: 3.2개",
          "• 평균 데미지: 452",
          "• 평균 생존시간: 23분 58초",
          "• 헤드샷 비율: 14%",
          "• 시즌 최고 킬: 12킬",
          "• 총 플레이 시간: 131시간 24분"
        ]
      }
    };
    return analyses[period];
  };

  // 빠른 선택 버튼 클릭
  const handleQuickAction = (action) => {
    // 사용자 메시지 추가
    const userMessage = {
      type: 'user',
      text: action === 'week' ? '이번주 통계 분석' :
            action === 'month' ? '한달 통계 분석' : '시즌 통계 분석',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // AI 응답 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      const analysis = generateAnalysis(action);
      const botMessage = {
        type: 'bot',
        text: analysis.title,
        analysis: analysis,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 사용자 메시지 추가
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // AI 응답 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      let botMessage;
      const text = inputValue.toLowerCase();

      if (text.includes('주') || text.includes('week')) {
        const analysis = generateAnalysis('week');
        botMessage = {
          type: 'bot',
          text: analysis.title,
          analysis: analysis,
          timestamp: new Date()
        };
      } else if (text.includes('달') || text.includes('month')) {
        const analysis = generateAnalysis('month');
        botMessage = {
          type: 'bot',
          text: analysis.title,
          analysis: analysis,
          timestamp: new Date()
        };
      } else if (text.includes('시즌') || text.includes('season')) {
        const analysis = generateAnalysis('season');
        botMessage = {
          type: 'bot',
          text: analysis.title,
          analysis: analysis,
          timestamp: new Date()
        };
      } else {
        botMessage = {
          type: 'bot',
          text: '죄송합니다. 현재는 "이번주", "한달", "시즌" 통계 분석을 제공하고 있습니다. 원하시는 분석을 선택해주세요!',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 플로팅 로봇 버튼 */}
      <motion.button
        className="ai-bot-button"
        onClick={handleToggleChat}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          y: [0, -10, 0]
        }}
        transition={{
          scale: { duration: 0.3 },
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI 통계 분석 챗봇"
        title="AI가 내 통계를 분석해줘요!"
      >
        {/* 귀여운 로봇 아이콘 */}
        <svg
          className="robot-icon"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 안테나 */}
          <motion.circle
            cx="32"
            cy="8"
            r="3"
            fill="#667eea"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <line x1="32" y1="11" x2="32" y2="16" stroke="#667eea" strokeWidth="2" />

          {/* 머리 */}
          <rect x="20" y="16" width="24" height="20" rx="4" fill="#667eea" />

          {/* 눈 */}
          <motion.circle
            cx="26"
            cy="24"
            r="3"
            fill="#fff"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.circle
            cx="38"
            cy="24"
            r="3"
            fill="#fff"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />

          {/* 입 */}
          <path
            d="M 26 30 Q 32 33 38 30"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* 몸통 */}
          <rect x="18" y="36" width="28" height="18" rx="3" fill="#764ba2" />

          {/* 팔 */}
          <rect x="12" y="38" width="6" height="12" rx="3" fill="#667eea" />
          <rect x="46" y="38" width="6" height="12" rx="3" fill="#667eea" />

          {/* 다리 */}
          <rect x="22" y="54" width="6" height="8" rx="2" fill="#764ba2" />
          <rect x="36" y="54" width="6" height="8" rx="2" fill="#764ba2" />
        </svg>

        {/* 말풍선 힌트 */}
        {!isChatOpen && (
          <motion.div
            className="ai-bot-hint"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            분석해줄게요!
          </motion.div>
        )}

        {/* 새 메시지 알림 배지 */}
        {!isChatOpen && messages.length > 0 && (
          <motion.div
            className="ai-bot-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {messages.length}
          </motion.div>
        )}
      </motion.button>

      {/* AI 챗봇 창 */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="ai-chatbot"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* 챗봇 헤더 */}
            <div className="ai-chatbot-header">
              <div className="ai-chatbot-header-info">
                <div className="ai-chatbot-avatar">
                  <svg viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="8" r="3" fill="#fff" />
                    <line x1="32" y1="11" x2="32" y2="16" stroke="#fff" strokeWidth="2" />
                    <rect x="20" y="16" width="24" height="20" rx="4" fill="#fff" />
                    <circle cx="26" cy="24" r="2" fill="#667eea" />
                    <circle cx="38" cy="24" r="2" fill="#667eea" />
                    <path d="M 26 30 Q 32 33 38 30" stroke="#667eea" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <rect x="18" y="36" width="28" height="18" rx="3" fill="#fff" opacity="0.8" />
                  </svg>
                </div>
                <div className="ai-chatbot-header-text">
                  <h3>AI 통계 분석</h3>
                  <span className="ai-chatbot-status">
                    <span className="ai-chatbot-status-dot"></span>
                    온라인
                  </span>
                </div>
              </div>
              <button
                className="ai-chatbot-close"
                onClick={handleToggleChat}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 챗봇 메시지 영역 */}
            <div className="ai-chatbot-messages">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`ai-message ${message.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'bot' && (
                    <div className="ai-message-avatar">
                      <svg viewBox="0 0 64 64" fill="none">
                        <rect x="20" y="16" width="24" height="20" rx="4" fill="#667eea" />
                        <circle cx="26" cy="24" r="2" fill="#fff" />
                        <circle cx="38" cy="24" r="2" fill="#fff" />
                      </svg>
                    </div>
                  )}
                  <div className="ai-message-content">
                    <div className="ai-message-bubble">
                      {message.text}
                      {message.analysis && (
                        <div className="ai-analysis-card">
                          <p className="ai-analysis-summary">{message.analysis.summary}</p>
                          <div className="ai-analysis-details">
                            {message.analysis.details.map((detail, idx) => (
                              <div key={idx} className="ai-analysis-detail-item">
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="ai-message-time">
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* 타이핑 인디케이터 */}
              {isTyping && (
                <motion.div
                  className="ai-message bot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="ai-message-avatar">
                    <svg viewBox="0 0 64 64" fill="none">
                      <rect x="20" y="16" width="24" height="20" rx="4" fill="#667eea" />
                      <circle cx="26" cy="24" r="2" fill="#fff" />
                      <circle cx="38" cy="24" r="2" fill="#fff" />
                    </svg>
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-message-bubble">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 빠른 선택 버튼 */}
            {messages.length <= 1 && (
              <div className="ai-quick-actions">
                <button onClick={() => handleQuickAction('week')}>
                  📊 이번주 통계 분석
                </button>
                <button onClick={() => handleQuickAction('month')}>
                  📈 한달 통계 분석
                </button>
                <button onClick={() => handleQuickAction('season')}>
                  🏆 시즌 통계 분석
                </button>
              </div>
            )}

            {/* 입력 영역 */}
            <form className="ai-chatbot-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="분석이 필요한 내용을 입력하세요..."
                disabled={isTyping}
              />
              <button type="submit" disabled={isTyping || !inputValue.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
