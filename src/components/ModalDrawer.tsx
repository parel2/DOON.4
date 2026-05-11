import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  accentColor?: string;
}

export default function ModalDrawer({ isOpen, onClose, children, accentColor = 'white/[0.08]' }: ModalDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
          >
            <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#121212]/95 backdrop-blur-xl border border-${accentColor} p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
