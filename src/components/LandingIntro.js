import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingIntro({ isVisible, isMobile, onSkip }) {
  const navigate = useNavigate();
  const exitOffset = isMobile ? -30 : -90;
  const initialOffset = isMobile ? 10 : 25;
  const headlineDelay = isMobile ? 0.1 : 0.2;

  const handleSecondaryAction = () => {
    navigate('/pubg-rank');
  };

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
            <span className="intro-kicker">TKTK CLAN</span>
            <motion.h1
              className="intro-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: headlineDelay, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              One Squad <br /> Last One Standing.
            </motion.h1>
            <motion.p
              className="intro-subtext"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: headlineDelay + 0.1, duration: 0.7 }}
            >
              클랜의 모든 순간을 기록하다
            </motion.p>

            <motion.div
              className="intro-cta"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: headlineDelay + 0.3, duration: 0.7 }}
            >
              <div className="intro-cta-buttons">
                <motion.button
                  className="intro-cta-button secondary"
                  onClick={handleSecondaryAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  클랜 랭킹 보기
                </motion.button>
              </div>
            </motion.div>
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
