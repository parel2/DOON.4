import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { formatRupiah } from '../utils/format';

export default function JackpotTicker({ value, className = '', style }: { value: number; className?: string; style?: CSSProperties }) {
  const [display, setDisplay] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start !== end) setIsAnimating(true);
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  return (
    <motion.span
      className={`${className} ${isAnimating ? 'animate-pulse-glow' : ''}`}
      style={{
        ...style,
        ...(isAnimating ? { textShadow: `0 0 20px ${style?.color || 'currentColor'}, 0 0 40px ${style?.color || 'currentColor'}` } : {}),
      }}
      animate={isAnimating ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {formatRupiah(display)}
    </motion.span>
  );
}
