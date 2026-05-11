import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingDown, Bell, History, ArrowRightLeft } from 'lucide-react';
import { getBalances, getTransactions, type Balances, type Transaction } from '../db';
import { useTheme } from '../components/ThemeEngine';
import JackpotTicker from '../components/JackpotTicker';
import StaggeredEntrance from '../components/StaggeredEntrance';
import LiquidBlob from '../components/LiquidBlob';
import HologramFoil from '../components/HologramFoil';
import AddBalanceModal from '../components/AddBalanceModal';
import ExpenseModal from '../components/ExpenseModal';
import TransferModal from '../components/TransferModal';
import MigrationModal from '../components/MigrationModal';
import { formatRupiah, formatDateTime } from '../utils/format';

export default function HomePage({ onDBCleared }: { onDBCleared?: () => void }) {
  const { colors } = useTheme();
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const refresh = useCallback(async () => {
    const b = await getBalances();
    if (b) setBalances(b);
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const total = (balances?.offline || 0) + (balances?.online || 0);

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: '2cm' }}>
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>DOON</h1>
            <motion.p
              className="text-[10px] tracking-wider"
              style={{ color: colors.textMuted }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              DOMPET ONLINE
            </motion.p>
          </motion.div>
          <motion.button
            onClick={() => setShowMigration(true)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="p-2 rounded-lg border transition-all"
            style={{ background: colors.card, borderColor: colors.border, color: colors.textMuted }}
            title="Imigrasi Data"
          >
            <History size={18} />
          </motion.button>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={1} variant="scaleIn">
        <motion.div
          className="relative rounded-3xl p-5 mb-4 overflow-hidden"
          style={{
            background: colors.card,
            borderColor: `${colors.accent}1a`,
            borderWidth: 1,
            boxShadow: `0 0 40px ${colors.glow}20, 0 0 80px ${colors.glowSecondary}10`,
          }}
          whileHover={{ scale: 1.01, boxShadow: `0 0 50px ${colors.glow}30, 0 0 100px ${colors.glowSecondary}15` }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <LiquidBlob />
          <HologramFoil />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <motion.p
                className="text-xs mb-1"
                style={{ color: colors.textMuted }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Total Saldo
              </motion.p>
              <JackpotTicker value={total} className="text-3xl font-bold" style={{ color: colors.text }} />
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowTransfer(true)}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border relative overflow-hidden"
                style={{ background: `${colors.accentSecondary}1a`, borderColor: `${colors.accentSecondary}33`, color: colors.accentSecondary }}
                title="Transfer Saldo"
              >
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ background: colors.accentSecondary }}
                />
                <ArrowRightLeft size={18} strokeWidth={2.5} className="relative z-10" />
              </motion.button>
              <motion.button
                onClick={() => setShowAddBalance(true)}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{ background: colors.gradient, color: colors.bg }}
                title="Tambah Saldo"
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  animate={{ scale: [0, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <Plus size={20} strokeWidth={3} className="relative z-10" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </StaggeredEntrance>

      <StaggeredEntrance index={2} variant="slideRight">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            className="relative rounded-3xl p-4 overflow-hidden"
            style={{ background: colors.card, borderColor: colors.border, borderWidth: 1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <LiquidBlob />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Tunai (Offline)</p>
              <JackpotTicker value={balances?.offline || 0} className="text-lg font-bold" style={{ color: colors.offline }} />
            </div>
          </motion.div>
          <motion.div
            className="relative rounded-3xl p-4 overflow-hidden"
            style={{ background: colors.card, borderColor: colors.border, borderWidth: 1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <LiquidBlob />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>E-Wallet (Online)</p>
              <JackpotTicker value={balances?.online || 0} className="text-lg font-bold" style={{ color: colors.online }} />
            </div>
          </motion.div>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={3} variant="flipUp">
        <div className="flex gap-3 mb-6">
          <motion.button
            onClick={() => setShowExpense(true)}
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.03, y: -1 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all relative overflow-hidden"
            style={{ background: `${colors.accentSecondary}1a`, borderColor: `${colors.accentSecondary}33`, borderWidth: 1, color: colors.accentSecondary }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: colors.accentSecondary }}
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <TrendingDown size={16} />
            </motion.div>
            <span className="relative z-10">Catat Pengeluaran</span>
          </motion.button>
          <motion.button
            onClick={() => setShowHistory(true)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all relative"
            style={{ background: colors.card, borderColor: colors.border, borderWidth: 1, color: colors.textMuted }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5, repeat: transactions.length > 0 ? 0 : Infinity, repeatDelay: 2 }}>
              <Bell size={16} />
            </motion.div>
          </motion.button>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={4} variant="scaleIn">
        <motion.div
          className="rounded-3xl overflow-hidden"
          style={{ background: colors.card, borderColor: colors.border, borderWidth: 1 }}
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Transaksi Terakhir</h3>
            <motion.button
              onClick={() => setShowHistory(true)}
              className="text-xs"
              style={{ color: colors.accent }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ x: 3 }}
            >
              Lihat Semua
            </motion.button>
          </div>
          {transactions.length === 0 ? (
            <motion.p
              className="p-4 text-sm text-center"
              style={{ color: colors.textMuted }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Belum ada transaksi
            </motion.p>
          ) : (
            <div>
              {transactions.slice(0, 5).map((tx, i) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ x: 4, background: `${colors.accent}08` }}
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm truncate" style={{ color: colors.text }}>{tx.category}</p>
                    {tx.description && <p className="text-[10px] truncate" style={{ color: colors.textMuted }}>{tx.description}</p>}
                    <p className="text-[10px]" style={{ color: colors.textMuted }}>{formatDateTime(tx.timestamp)} · {tx.source === 'offline' ? 'Tunai' : tx.source === 'online' ? 'Online' : 'Transfer'}</p>
                  </div>
                  <motion.span
                    className="text-sm font-medium"
                    style={{ color: tx.type === 'income' ? colors.offline : '#f43f5e' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </StaggeredEntrance>

      <AnimatePresence>
        {showAddBalance && <AddBalanceModal onClose={() => setShowAddBalance(false)} onComplete={refresh} />}
        {showExpense && <ExpenseModal onClose={() => setShowExpense(false)} onComplete={refresh} />}
        {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} onComplete={refresh} />}
        {showMigration && <MigrationModal onClose={() => setShowMigration(false)} onImported={refresh} onCleared={() => { if (onDBCleared) onDBCleared(); }} />}
        {showHistory && <HistoryModal transactions={transactions} onClose={() => setShowHistory(false)} />}
      </AnimatePresence>
    </div>
  );
}

type FilterTab = 'semua' | 'online' | 'offline';

function HistoryModal({ transactions, onClose }: { transactions: Transaction[]; onClose: () => void }) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterTab>('semua');

  const filtered = filter === 'semua'
    ? transactions
    : transactions.filter((tx) => tx.source === filter);

  const totalExpense = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl" style={{ background: colors.cardAlpha, borderColor: colors.border, borderWidth: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <motion.h2
              className="text-lg font-bold"
              style={{ color: colors.text }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Riwayat Transaksi
            </motion.h2>
            <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><History size={20} /></motion.button>
          </div>

          <div className="flex gap-2 mb-4">
            {(['semua', 'online', 'offline'] as FilterTab[]).map((f, i) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileTap={{ scale: 0.9 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: filter === f ? `${colors.accent}33` : 'transparent',
                  color: filter === f ? colors.accent : colors.textMuted,
                  borderColor: filter === f ? `${colors.accent}66` : colors.borderSubtle,
                  borderWidth: 1,
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                {f}
              </motion.button>
            ))}
          </div>

          <motion.div
            className="rounded-2xl p-3 mb-4 flex items-center justify-between"
            style={{ background: colors.inputBg }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-xs" style={{ color: colors.textMuted }}>Total Pengeluaran{filter !== 'semua' ? ` (${filter})` : ''}</span>
            <span className="text-sm font-bold" style={{ color: '#f43f5e' }}>-{formatRupiah(totalExpense)}</span>
          </motion.div>

          {filtered.length === 0 ? (
            <motion.p
              className="text-sm text-center py-8"
              style={{ color: colors.textMuted }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Belum ada transaksi
            </motion.p>
          ) : (
            <div className="space-y-2">
              {filtered.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl"
                  style={{ background: colors.inputBg }}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm truncate" style={{ color: colors.text }}>{tx.category}</p>
                    {tx.description && <p className="text-[10px] truncate" style={{ color: colors.textMuted }}>{tx.description}</p>}
                    <p className="text-[10px]" style={{ color: colors.textMuted }}>{formatDateTime(tx.timestamp)} · {tx.source === 'offline' ? 'Tunai' : tx.source === 'online' ? 'Online' : 'Transfer'}</p>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0" style={{ color: tx.type === 'income' ? colors.offline : '#f43f5e' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
