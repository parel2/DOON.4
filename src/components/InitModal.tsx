import { useState } from 'react';
import { motion } from 'framer-motion';
import { initializeDB } from '../db';
import { useTheme } from './ThemeEngine';

export default function InitModal({ onComplete }: { onComplete: () => void }) {
  const { colors } = useTheme();
  const [offline, setOffline] = useState('');
  const [online, setOnline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const off = Number(offline) || 0;
    const onl = Number(online) || 0;
    if (off === 0 && onl === 0) return;
    setLoading(true);
    await initializeDB(off, onl);
    setLoading(false);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="mx-4 w-full max-w-sm rounded-3xl backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden"
        style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}
      >
        {/* Decorative animated ring */}
        <motion.div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full border"
          style={{ borderColor: `${colors.accent}15` }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border"
          style={{ borderColor: `${colors.accentSecondary}15` }}
          animate={{ scale: [1.3, 1, 1.3], rotate: [0, -90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.h2
          className="text-xl font-bold text-center mb-1"
          style={{ color: colors.accent }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Selamat Datang!
        </motion.h2>
        <motion.p
          className="text-sm text-center mb-6"
          style={{ color: colors.textSecondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Masukkan saldo awal kamu
        </motion.p>

        <div className="space-y-4">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
            <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Saldo Tunai (Offline)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
              <input type="number" value={offline} onChange={(e) => setOffline(e.target.value)} placeholder="0"
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
                style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
              />
            </div>
          </motion.div>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Saldo E-Wallet (Online)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
              <input type="number" value={online} onChange={(e) => setOnline(e.target.value)} placeholder="0"
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
                style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
              />
            </div>
          </motion.div>
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading || (Number(offline) === 0 && Number(online) === 0)}
          whileTap={!loading && (Number(offline) > 0 || Number(online) > 0) ? { scale: 0.95 } : undefined}
          className="mt-6 w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: colors.gradient, color: colors.bg }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.15)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
          <span className="relative z-10">{loading ? 'Menyimpan...' : 'Mulai'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
