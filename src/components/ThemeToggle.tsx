import { motion } from 'framer-motion';
import { useTheme, type ThemeId } from './ThemeEngine';

const OPTIONS: { id: ThemeId; label: string; color: string; glow: string }[] = [
  { id: 'gelap', label: 'Gelap', color: '#000000', glow: 'rgba(6,182,212,0.4)' },
  { id: 'terang', label: 'Terang', color: '#FAFAFA', glow: 'rgba(8,145,178,0.3)' },
  { id: 'spesial', label: 'Spesial', color: '#1A1A2E', glow: 'rgba(255,215,0,0.4)' },
];

export default function ThemeToggle() {
  const { theme, setTheme, colors } = useTheme();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const isActive = theme === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all overflow-hidden"
            style={{
              background: isActive ? `${opt.color}40` : 'transparent',
              color: isActive ? colors.accent : colors.textMuted,
              borderWidth: 1,
              borderColor: isActive ? `${colors.accent}33` : 'transparent',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="theme-glow"
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `inset 0 0 12px ${opt.glow}` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              className="w-3 h-3 rounded-full border"
              style={{ background: opt.color, borderColor: isActive ? colors.accent : `${colors.textMuted}33` }}
              animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
