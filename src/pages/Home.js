import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import MemberList from '../components/MemberList';
import LandingIntro from '../components/LandingIntro';
import '../styles/home-intro.css';

const INTRO_STORAGE_KEY = 'pubg-intro-dismissed';

const useIsMobile = () => {
  const getMatches = React.useCallback(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(max-width: 768px)').matches;
  }, []);

  const [isMobile, setIsMobile] = React.useState(getMatches);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const media = window.matchMedia('(max-width: 768px)');
    const handleChange = (event) => setIsMobile(event.matches);

    handleChange(media);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [getMatches]);

  return isMobile;
};

export default function Home() {
  const isMobile = useIsMobile();
  const [introDismissed, setIntroDismissed] = React.useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';
  });

  const completeIntro = React.useCallback(() => {
    setIntroDismissed((prev) => {
      if (prev) {
        return prev;
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
      }
      return true;
    });
  }, []);

  // 휠/터치 제스처로 인트로 닫기
  React.useEffect(() => {
    if (introDismissed) {
      return undefined;
    }

    let touchStartY = 0;
    let isScrolling = false;

    const handleWheel = (e) => {
      if (isScrolling) return;

      // 아래로 스크롤 시 인트로 닫기
      if (e.deltaY > 50) {
        isScrolling = true;
        completeIntro();
      }
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isScrolling) return;

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      // 위로 스와이프 시 인트로 닫기
      if (deltaY > 100) {
        isScrolling = true;
        completeIntro();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [introDismissed, completeIntro]);

  // 인트로가 표시 중일 때는 Layout 없이 fullscreen으로 렌더링
  if (!introDismissed) {
    return (
      <div className="home-page">
        <LandingIntro isVisible isMobile={isMobile} onSkip={completeIntro} />
      </div>
    );
  }

  // 인트로 완료 후 Layout과 함께 메인 컨텐츠 렌더링
  return (
    <Layout>
      <motion.div
        className="main-content-wrapper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <MemberList />
      </motion.div>
    </Layout>
  );
}
