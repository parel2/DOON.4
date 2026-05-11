import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';
import { useTheme } from './ThemeEngine';

export default function AddBalanceModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }
    if (source === 'offline') await updateBalances(balances.offline + amt, balances.online);
    else await updateBalances(balances.offline, balances.online + amt);
    await addTransaction({ type: 'income', category: 'Tambah Saldo', description: '', amount: amt, timestamp: Date.now(), source });
    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95, rotateX: 10 }} animate={{ y: 0, scale: 1, rotateX: 0 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6 shadow-2xl" style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-5">
            <motion.h2 className="text-lg font-bold" style={{ color: colors.offline }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>Tambah Saldo</motion.h2>
            <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>
          </div>
          <div className="flex gap-2 mb-4">
            {(['offline', 'online'] as const).map((s, i) => (
              <motion.button key={s} onClick={() => setSource(s)} whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={source === s ? { background: `${s === 'offline' ? colors.offline : colors.accent}33`, color: s === 'offline' ? colors.offline : colors.accent, borderColor: `${s === 'offline' ? colors.offline : colors.accent}66` } : { color: colors.textMuted, borderColor: colors.borderSubtle }}
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              >
                {s === 'offline' ? 'Tunai (Offline)' : 'E-Wallet (Online)'}
              </motion.button>
            ))}
          </div>
          <motion.div className="relative mb-4" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            />
          </motion.div>
          <motion.button
            onClick={handleSubmit}
            disabled={loading || (Number(amount) || 0) <= 0}
            whileTap={!loading && (Number(amount) || 0) > 0 ? { scale: 0.95 } : undefined}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
            style={{ background: `linear-gradient(to right, ${colors.offline}, ${colors.accentSecondary})`, color: colors.bg }}
          >
            <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.15)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
            <span className="relative z-10">{loading ? 'Menyimpan...' : 'Tambah'}</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
