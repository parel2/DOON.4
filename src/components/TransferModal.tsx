import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';
import { useTheme } from './ThemeEngine';
import { formatRupiah } from '../utils/format';

export default function TransferModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { colors } = useTheme();
  const [direction, setDirection] = useState<'offline_to_online' | 'online_to_offline'>('offline_to_online');
  const [amount, setAmount] = useState('');
  const [adminFee, setAdminFee] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    const amt = Number(amount) || 0;
    const fee = Number(adminFee) || 0;
    if (amt <= 0) return;
    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }
    const totalDeduction = amt + fee;
    if (direction === 'offline_to_online') {
      if (balances.offline < totalDeduction) { setLoading(false); return; }
      await updateBalances(balances.offline - totalDeduction, balances.online + amt);
    } else {
      if (balances.online < totalDeduction) { setLoading(false); return; }
      await updateBalances(balances.offline + amt, balances.online - totalDeduction);
    }
    if (fee > 0) {
      await addTransaction({ type: 'transfer_fee', category: 'Lainnya', description: '', amount: fee, timestamp: Date.now(), source: 'transfer' });
    }
    setLoading(false);
    onComplete();
    onClose();
  };

  const sourceLabel = direction === 'offline_to_online' ? 'Tunai (Offline)' : 'E-Wallet (Online)';
  const destLabel = direction === 'offline_to_online' ? 'E-Wallet (Online)' : 'Tunai (Offline)';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6 shadow-2xl" style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-5">
            <motion.h2 className="text-lg font-bold" style={{ color: colors.accent }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>Pindah Saldo</motion.h2>
            <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>
          </div>
          <motion.div className="flex items-center gap-3 mb-5 rounded-lg p-3" style={{ background: colors.inputBg }} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            {(['offline_to_online', 'online_to_offline'] as const).map((d, i) => (
              <motion.button key={d} onClick={() => setDirection(d)} whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-md text-xs font-medium transition-all border"
                style={direction === d ? { background: `${colors.accent}33`, color: colors.accent, borderColor: `${colors.accent}66` } : { color: colors.textMuted, borderColor: 'transparent' }}
                initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              >
                {d === 'offline_to_online' ? 'Tunai → Online' : 'Online → Tunai'}
              </motion.button>
            ))}
          </motion.div>
          <motion.div className="flex items-center gap-2 mb-4 text-sm" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <span style={{ color: colors.textSecondary }}>{sourceLabel}</span>
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <ArrowRight size={14} style={{ color: colors.accent }} />
            </motion.div>
            <span style={{ color: colors.text }}>{destLabel}</span>
          </motion.div>
          <div className="space-y-3">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>Jumlah Transfer</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
                  style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
                />
              </div>
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
              <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>Biaya Admin</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
                <input type="number" value={adminFee} onChange={(e) => setAdminFee(e.target.value)} placeholder="0"
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
                  style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
                />
              </div>
            </motion.div>
          </div>
          {Number(amount) > 0 && (
            <motion.div className="mt-3 p-3 rounded-lg text-sm" style={{ background: colors.inputBg }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Total dipotong dari {sourceLabel}</span>
                <span style={{ color: colors.text }}>{formatRupiah((Number(amount) || 0) + (Number(adminFee) || 0))}</span>
              </div>
            </motion.div>
          )}
          <motion.button
            onClick={handleTransfer}
            disabled={loading || (Number(amount) || 0) <= 0}
            whileTap={!loading && (Number(amount) || 0) > 0 ? { scale: 0.95 } : undefined}
            className="mt-5 w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
            style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`, color: colors.bg }}
          >
            <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.15)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
            <span className="relative z-10">{loading ? 'Memproses...' : 'Pindah Saldo'}</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
