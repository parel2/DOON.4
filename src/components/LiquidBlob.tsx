import { motion } from 'framer-motion';
import { useTheme } from './ThemeEngine';

export default function LiquidBlob() {
  const { colors } = useTheme();

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      <motion.div
        animate={{
          x: [0, 35, -25, 15, 0],
          y: [0, -25, 20, -15, 0],
          scale: [1, 1.35, 0.85, 1.2, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-6 -left-6 w-44 h-44 rounded-full blur-3xl"
        style={{ background: `${colors.accent}35` }}
      />
      <motion.div
        animate={{
          x: [0, -30, 20, -15, 0],
          y: [0, 25, -20, 15, 0],
          scale: [1, 0.85, 1.25, 0.9, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full blur-3xl"
        style={{ background: `${colors.accentSecondary}30` }}
      />
      <motion.div
        animate={{
          x: [0, 20, -15, 25, 0],
          y: [0, -15, 25, -10, 0],
          scale: [1, 1.15, 0.9, 1.25, 1],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl"
        style={{ background: `${colors.accent}28` }}
      />
      <motion.div
        animate={{
          x: [0, -20, 30, -10, 0],
          y: [0, 30, -10, 20, 0],
          scale: [1, 1.1, 0.95, 1.2, 1],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl"
        style={{ background: `${colors.accentSecondary}22` }}
      />
    </div>
  );
}
