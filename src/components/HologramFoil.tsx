import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeEngine';

export default function HologramFoil() {
  const { colors } = useTheme();
  const [angle, setAngle] = useState(135);
  const [shimmerPos, setShimmerPos] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const a = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      setAngle(a);
      setShimmerPos((x / rect.width) * 100);
    };

    const handleTilt = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      setAngle(135 + gamma + beta * 0.5);
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('deviceorientation', handleTilt);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('deviceorientation', handleTilt);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, ${colors.accent}30, transparent 15%, ${colors.accentSecondary}25 35%, transparent 50%, ${colors.accent}1e 65%, transparent 80%, ${colors.accentSecondary}15 90%)`,
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.accent}18, ${colors.accentSecondary}12, transparent)`,
          width: '60%',
        }}
      />
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `linear-gradient(${angle + 90}deg, transparent 30%, ${colors.accent}0a ${shimmerPos - 10}%, ${colors.accent}14 ${shimmerPos}%, ${colors.accent}0a ${shimmerPos + 10}%, transparent 70%)`,
        }}
      />
    </div>
  );
}
