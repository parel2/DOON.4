import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Plus } from 'lucide-react';
import { useTheme } from './ThemeEngine';
import { formatRupiah } from '../utils/format';
import { calculateAdjustedSavings, getAffectedDays } from '../utils/withdraw';

interface WithdrawModalProps {
  savingsAmount: number;
  savingsType: 'investasi' | 'darurat';
  onWithdraw: (amount: number, method: 'direct' | 'to_balance') => void;
  onClose: () => void;
}

export default function WithdrawModal({ savingsAmount, savingsType, onWithdraw, onClose }: WithdrawModalProps) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'direct' | 'to_balance'>('direct');
  const [affectedDays, setAffectedDays] = useState<Array<{ date: string; amount: number }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const updatePreview = async () => {
      const withdrawAmount = Number(amount) || 0;
      if (withdrawAmount > 0) {
        const { adjustments } = await calculateAdjustedSavings(savingsType, withdrawAmount);
        const days = getAffectedDays(adjustments);
        setAffectedDays(days);
      } else {
        setAffectedDays([]);
      }
    };
    updatePreview();
  }, [amount, savingsType]);

  const isValid = Number(amount) > 0 && Number(amount) <= savingsAmount;
  const minAmount = savingsType === 'investasi' ? 10000 : 5000;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div
          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
          style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              className="text-lg font-bold"
              style={{ color: colors.text }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              Tarik Tabungan
            </motion.h2>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.85, rotate: 90 }}
              style={{ color: colors.textMuted }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Current Amount */}
          <motion.div
            className="rounded-2xl p-4 mb-4 border"
            style={{ background: colors.inputBg, borderColor: colors.borderSubtle }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs" style={{ color: colors.textMuted }}>
              Saldo {savingsType === 'investasi' ? 'Investasi' : 'Darurat'}
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: savingsType === 'investasi' ? colors.offline : colors.accentSecondary }}>
              {formatRupiah(savingsAmount)}
            </p>
          </motion.div>

          {/* Method Selection */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: colors.textMuted }}>
              PILIH METODE TARIK
            </p>
            <div className="space-y-2">
              {(['direct', 'to_balance'] as const).map((m, i) => (
                <motion.button
                  key={m}
                  onClick={() => setMethod(m)}
                  whileTap={{ scale: 0.95 }}
                  className="w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3"
                  style={{
                    background: method === m ? `${colors.accent}15` : colors.inputBg,
                    borderColor: method === m ? colors.accent : colors.borderSubtle,
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0"
                    style={{
                      borderColor: method === m ? colors.accent : colors.borderSubtle,
                      background: method === m ? colors.accent : 'transparent',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: colors.text }}>
                      {m === 'direct' ? 'Tarik Langsung' : 'Tambah ke Saldo'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                      {m === 'direct'
                        ? 'Langsung keluar dari tabungan, catat di riwayat'
                        : 'Masuk ke saldo, kurangi dari pengeluaran'
                      }
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>
              JUMLAH TARIK
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
                style={{
                  background: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.borderSubtle,
                }}
              />
            </div>
            {Number(amount) > savingsAmount && (
              <p className="text-xs mt-2" style={{ color: '#f43f5e' }}>
                ⚠️ Melebihi saldo tersedia
              </p>
            )}
          </div>

          {/* LIFO Preview */}
          <AnimatePresence>
            {affectedDays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl p-3 border overflow-hidden"
                style={{ background: `${colors.accent}08`, borderColor: `${colors.accent}33` }}
              >
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between text-xs font-semibold"
                  style={{ color: colors.accent }}
                >
                  <span>Preview Adjustment LIFO</span>
                  <motion.span animate={{ rotate: showPreview ? 180 : 0 }}>
                    ↓
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 text-xs"
                    >
                      {affectedDays.map((day, i) => (
                        <motion.div
                          key={day.date}
                          className="flex items-center justify-between p-2 rounded-lg"
                          style={{ background: colors.inputBg }}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <span style={{ color: colors.textMuted }}>{day.date}</span>
                          <span style={{ color: colors.text, fontWeight: 600 }}>
                            -{formatRupiah(day.amount)}
                          </span>
                        </motion.div>
                      ))}
                      <motion.div
                        className="flex items-center justify-between p-2 rounded-lg border-t mt-3 pt-3"
                        style={{ borderColor: colors.borderSubtle }}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: affectedDays.length * 0.05 }}
                      >
                        <span style={{ color: colors.textMuted }}>Total Adjustment</span>
                        <span style={{ color: colors.accent, fontWeight: 700 }}>
                          -{formatRupiah(affectedDays.reduce((sum, d) => sum + d.amount, 0))}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Box */}
          {method === 'to_balance' && affectedDays.length > 0 && (
            <motion.div
              className="rounded-xl p-3 border mb-4 text-xs"
              style={{
                background: `${colors.accentSecondary}08`,
                borderColor: `${colors.accentSecondary}33`,
                color: colors.textMuted,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ℹ️ Tabungan akan berkurang dan ditambah ke saldo. Pengeluaran akan dikurangi sesuai adjustment LIFO di atas.
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all border"
              style={{
                background: colors.inputBg,
                color: colors.textMuted,
                borderColor: colors.borderSubtle,
              }}
            >
              Batal
            </motion.button>
            <motion.button
              onClick={() => {
                if (isValid) {
                  onWithdraw(Number(amount), method);
                  onClose();
                }
              }}
              disabled={!isValid}
              whileTap={isValid ? { scale: 0.95 } : undefined}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: method === 'direct'
                  ? `linear-gradient(to right, ${colors.offline}, ${colors.accent})`
                  : `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`,
                color: colors.bg,
              }}
            >
              <ArrowDown size={16} />
              {method === 'direct' ? 'Tarik Langsung' : 'Tambah ke Saldo'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
