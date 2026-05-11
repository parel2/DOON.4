import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeEngine';

const COINS = [
  { id: 0, x: -70, delay: 0.3, rotate: 720 },
  { id: 1, x: -35, delay: 0.4, rotate: 540 },
  { id: 2, x: 0, delay: 0.35, rotate: 900 },
  { id: 3, x: 35, delay: 0.45, rotate: 630 },
  { id: 4, x: 70, delay: 0.5, rotate: 810 },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<'idle' | 'opening' | 'coins' | 'fadeout'>('idle');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('opening'), 200);
    const t2 = setTimeout(() => setPhase('coins'), 600);
    const t3 = setTimeout(() => setPhase('fadeout'), 2200);
    const t4 = setTimeout(() => onComplete(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: colors.bg }}
      >
        {/* Background rings */}
        <motion.div
          className="absolute w-64 h-64 rounded-full border"
          style={{ borderColor: `${colors.accent}15` }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full border"
          style={{ borderColor: `${colors.accentSecondary}15` }}
          animate={{ scale: [1.5, 1, 1.5], opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <div className="relative">
          {/* Glow behind wallet */}
          <motion.div
            className="absolute inset-0 -m-8 rounded-full blur-2xl"
            style={{ background: colors.glow }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Wallet body */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: -90 }}
            animate={{
              scale: phase === 'opening' || phase === 'coins' ? 1 : 0,
              opacity: 1,
              rotateY: phase === 'opening' || phase === 'coins' ? 0 : -90,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-16 rounded-lg relative"
            style={{ background: colors.gradient, boxShadow: `0 0 40px ${colors.glow}` }}
          >
            {/* Wallet flap */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: phase === 'opening' || phase === 'coins' ? -110 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute -top-3 left-2 right-2 h-5 rounded-t-lg origin-bottom"
              style={{ background: colors.gradientSecondary }}
            />
            {/* Wallet clasp */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2"
              style={{ background: colors.bg, borderColor: colors.accent }}
              animate={phase === 'coins' ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: phase === 'coins' ? 2 : 0 }}
            />
          </motion.div>

          {/* Coins with physics */}
          {(phase === 'coins' || phase === 'fadeout') &&
            COINS.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ x: 0, y: -20, opacity: 0, rotate: 0, scale: 0 }}
                animate={{
                  x: [0, coin.x * 0.3, coin.x],
                  y: [-20, 40, 80, 60, 80, 70, 80],
                  opacity: [0, 1, 1, 1, 1, 1, phase === 'fadeout' ? 0 : 1],
                  rotate: [0, coin.rotate * 0.3, coin.rotate],
                  scale: [0, 1, 1, 1, 1, 1, 0.8],
                }}
                transition={{
                  duration: 1.8,
                  delay: coin.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  times: [0, 0.1, 0.3, 0.5, 0.7, 0.85, 1],
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 0 12px rgba(245,158,11,0.5)',
                    color: '#78350f',
                  }}
                >
                  Rp
                </div>
              </motion.div>
            ))}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 200 }}
          className="mt-10 text-3xl font-bold tracking-wider"
          style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          DOON
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.3em' }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-1 text-xs tracking-widest"
          style={{ color: colors.textMuted }}
        >
          DOMPET ONLINE
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="mt-8 w-32 h-0.5 rounded-full overflow-hidden"
          style={{ background: colors.borderSubtle }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: colors.gradient }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
