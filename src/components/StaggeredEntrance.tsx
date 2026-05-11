import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  slideRight: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  flipUp: {
    initial: { opacity: 0, rotateX: 30, y: 20 },
    animate: { opacity: 1, rotateX: 0, y: 0 },
  },
};

type VariantType = keyof typeof variants;

export default function StaggeredEntrance({
  children,
  index = 0,
  className = '',
  variant = 'fadeUp',
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  variant?: VariantType;
}) {
  const v = variants[variant];
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
