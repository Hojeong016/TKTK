import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingIntro({ isVisible, isMobile, onSkip }) {
  const exitOffset = isMobile ? -30 : -90;
  const initialOffset = isMobile ? 10 : 25;
  const headlineDelay = isMobile ? 0.1 : 0.2;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          className="intro-section"
          initial={{ opacity: 0, y: initialOffset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: exitOffset }}
          transition={{ duration: isMobile ? 0.45 : 0.75, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="intro-background">
            <div className="intro-gradient-layer" />
            <div className="intro-orb intro-orb-left" />
            <div className="intro-orb intro-orb-right" />
          </div>

          <motion.button
            type="button"
            className="skip-intro-button"
            onClick={onSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip intro
          </motion.button>

          <div className="intro-hero-content">
            <span className="intro-kicker">TK PUBG COMMUNITY</span>
            <motion.h1
              className="intro-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: headlineDelay, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              실시간 멤버 랭킹 허브에 오신 것을 환영합니다
            </motion.h1>
            <motion.p
              className="intro-subtext"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: headlineDelay + 0.1, duration: 0.7 }}
            >
              활동량, 플레이 타임, 기여도를 한눈에 파악하고 팀 운영에 필요한 인사이트를 확보하세요.
            </motion.p>
          </div>

          <motion.div
            className="intro-scroll-cue"
            onClick={onSkip}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Scroll to enter</span>
            <div className="intro-scroll-cue-line" />
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
