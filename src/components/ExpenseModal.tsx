import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';
import { useTheme } from './ThemeEngine';
import { EXPENSE_CATEGORIES_HARIAN, EXPENSE_CATEGORIES_KHUSUS } from '../utils/format';

export default function ExpenseModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { colors } = useTheme();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amt = Number(amount) || 0;
    if (amt <= 0 || !category) return;
    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }
    if (source === 'offline') {
      if (balances.offline < amt) { setLoading(false); return; }
      await updateBalances(balances.offline - amt, balances.online);
    } else {
      if (balances.online < amt) { setLoading(false); return; }
      await updateBalances(balances.offline, balances.online - amt);
    }
    await addTransaction({ type: 'expense', category, description, amount: amt, timestamp: Date.now(), source });
    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto" style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-5">
            <motion.h2 className="text-lg font-bold" style={{ color: '#f43f5e' }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>Catat Pengeluaran</motion.h2>
            <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>
          </div>
          <div className="flex gap-2 mb-4">
            {(['offline', 'online'] as const).map((s, i) => (
              <motion.button key={s} onClick={() => setSource(s)} whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={source === s ? { background: '#f43f5e33', color: '#f43f5e', borderColor: '#f43f5e66' } : { color: colors.textMuted, borderColor: colors.borderSubtle }}
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              >
                {s === 'offline' ? 'Tunai (Offline)' : 'E-Wallet (Online)'}
              </motion.button>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Kategori Harian</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES_HARIAN.map((cat, i) => (
                <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.02 * i, type: 'spring', stiffness: 400, damping: 15 }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                  style={category === cat ? { background: '#f43f5e33', color: '#f43f5e', borderColor: '#f43f5e66' } : { color: colors.textSecondary, borderColor: colors.borderSubtle }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Kategori Khusus</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES_KHUSUS.map((cat, i) => (
                <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + 0.02 * i, type: 'spring', stiffness: 400, damping: 15 }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                  style={category === cat ? { background: '#f43f5e33', color: '#f43f5e', borderColor: '#f43f5e66' } : { color: colors.textSecondary, borderColor: colors.borderSubtle }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
          <motion.div className="mb-4" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Deskripsi</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Nasi goreng pak Ahmad"
              className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            />
          </motion.div>
          <motion.div className="relative mb-4" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            />
          </motion.div>
          <motion.button
            onClick={handleSubmit}
            disabled={loading || (Number(amount) || 0) <= 0 || !category}
            whileTap={!loading && (Number(amount) || 0) > 0 && category ? { scale: 0.95 } : undefined}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
            style={{ background: 'linear-gradient(to right, #f43f5e, #ec4899)', color: '#ffffff' }}
          >
            <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.1)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
            <span className="relative z-10">{loading ? 'Menyimpan...' : 'Catat'}</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
