import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { isDBInitialized } from './db';
import { ThemeProvider, useTheme } from './components/ThemeEngine';
import SplashScreen from './components/SplashScreen';
import InitModal from './components/InitModal';
import BottomNav, { type TabId } from './components/BottomNav';
import AmbientParticles from './components/AmbientParticles';
import HomePage from './pages/HomePage';
import SavingsPage from './pages/SavingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MarketPage from './pages/MarketPage';

const TAB_ORDER: TabId[] = ['home', 'savings', 'analytics', 'market'];

const pageVariants = {
  enter: (direction: number) => ({
    x: `${100 * direction}%`,
    opacity: 0.3,
    scale: 0.95,
    rotateY: direction * 3,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    x: `${-100 * direction}%`,
    opacity: 0.3,
    scale: 0.95,
    rotateY: -direction * 3,
  }),
};

function AppInner() {
  const { colors } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [[page, direction], setPage] = useState<[TabId, number]>(['home', 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (splashDone) {
      isDBInitialized().then((ok) => { if (ok) setInitialized(true); });
    }
  }, [splashDone]);

  const navigateToTab = useCallback((tab: TabId) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(tab);
    const dir = newIndex - currentIndex;
    setPage([tab, dir]);
    setActiveTab(tab);
  }, [activeTab]);

  const handleTabChange = (tab: TabId) => navigateToTab(tab);

  const handleSwipe = useCallback((swipeDirection: 'left' | 'right') => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (swipeDirection === 'left' && currentIndex < TAB_ORDER.length - 1) {
      navigateToTab(TAB_ORDER[currentIndex + 1]);
    } else if (swipeDirection === 'right' && currentIndex > 0) {
      navigateToTab(TAB_ORDER[currentIndex - 1]);
    }
  }, [activeTab, navigateToTab]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) handleSwipe('left');
    else if (info.offset.x > threshold) handleSwipe('right');
  }, [handleSwipe]);

  const handleInitComplete = () => setInitialized(true);
  const handleDBCleared = () => { setInitialized(false); setRefreshKey((k) => k + 1); };

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: colors.bg, color: colors.text }}
      transition={{ duration: 0.5 }}
      className="h-[100dvh] overflow-hidden relative"
      style={{ perspective: 1200 }}
    >
      <AmbientParticles />

      {!splashDone ? (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      ) : !initialized ? (
        <InitModal onComplete={handleInitComplete} />
      ) : (
        <>
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ height: 'calc(100dvh - 56px)' }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 250, damping: 28 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {page === 'home' && <HomePage key={`home-${refreshKey}`} onDBCleared={handleDBCleared} />}
                {page === 'savings' && <SavingsPage key={`savings-${refreshKey}`} />}
                {page === 'analytics' && <AnalyticsPage key={`analytics-${refreshKey}`} />}
                {page === 'market' && <MarketPage key={`market-${refreshKey}`} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <BottomNav active={activeTab} onChange={handleTabChange} />
        </>
      )}
    </motion.div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
