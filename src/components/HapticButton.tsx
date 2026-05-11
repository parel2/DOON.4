import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HapticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function HapticButton({ children, onClick, className = '', disabled = false }: HapticButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
