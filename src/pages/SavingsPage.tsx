import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Target, Plus, Trash2, Bell, X, ArrowDown } from 'lucide-react';
import { getSavings, getTargets, updateSavings, addTarget, updateTarget, deleteTarget, addTransaction, getBalances, updateBalances, addSavingsHistory, type Savings as SavingsType, type Target as TargetType } from '../db';
import { useTheme } from '../components/ThemeEngine';
import WithdrawModal from '../components/WithdrawModal';
import JackpotTicker from '../components/JackpotTicker';
import StaggeredEntrance from '../components/StaggeredEntrance';
import LiquidBlob from '../components/LiquidBlob';
import { formatRupiah } from '../utils/format';

export default function SavingsPage() {
  const { colors } = useTheme();
  const [savings, setSavings] = useState<SavingsType | null>(null);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState<'investasi' | 'darurat' | null>(null);
  const [shakeBell, setShakeBell] = useState(false);

  const refresh = useCallback(async () => {
    const s = await getSavings();
    if (s) setSavings(s);
    const t = await getTargets();
    setTargets(t);
  }, []);

  useEffect(() => {
    refresh();
    const checkNabung = async () => {
      const s = await getSavings();
      if (s && (Date.now() - s.last_saved_timestamp > 86400000)) setShakeBell(true);
    };
    checkNabung();
    const interval = setInterval(checkNabung, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleAddSavings = async (type: 'investasi' | 'darurat', amount: number, source: 'offline' | 'online') => {
    if (!savings) return;
    if (type === 'investasi' && amount < 10000) return;
    if (type === 'darurat' && amount < 5000) return;
    const balances = await getBalances();
    if (!balances) return;
    const currentBalance = source === 'online' ? balances.online : balances.offline;
    if (currentBalance < amount) return;
    if (source === 'online') await updateBalances(balances.offline, balances.online - amount);
    else await updateBalances(balances.offline - amount, balances.online);
    const newInvestasi = type === 'investasi' ? savings.investasi + amount : savings.investasi;
    const newDarurat = type === 'darurat' ? savings.darurat + amount : savings.darurat;
    await updateSavings(newInvestasi, newDarurat);
    await addSavingsHistory(type, amount);
    await addTransaction({ type: 'expense', category: `Tabungan ${type === 'investasi' ? 'Investasi' : 'Darurat'}`, description: '', amount, timestamp: Date.now(), source });
    setShowAddSavings(false);
    setShakeBell(false);
    refresh();
  };

  const handleWithdraw = async (amount: number, method: 'direct' | 'to_balance', type: 'investasi' | 'darurat') => {
    if (!savings) return;
    
    const balances = await getBalances();
    if (!balances) return;

    // Update savings
    const newInvestasi = type === 'investasi' ? savings.investasi - amount : savings.investasi;
    const newDarurat = type === 'darurat' ? savings.darurat - amount : savings.darurat;
    await updateSavings(newInvestasi, newDarurat);

    if (method === 'direct') {
      // Tarik langsung - just record as withdraw_direct
      await addTransaction({
        type: 'withdraw_direct',
        category: `Tarik ${type === 'investasi' ? 'Investasi' : 'Darurat'}`,
        description: `Tarik langsung dari tabungan ${type}`,
        amount,
        timestamp: Date.now(),
        source: 'transfer',
        withdrawFrom: type,
      });
    } else {
      // Tambah ke saldo
      const newOnline = balances.online + amount;
      await updateBalances(balances.offline, newOnline);
      
      await addTransaction({
        type: 'withdraw_to_balance',
        category: `Tarik ${type === 'investasi' ? 'Investasi' : 'Darurat'}`,
        description: `Tarik ke saldo dari tabungan ${type}`,
        amount,
        timestamp: Date.now(),
        source: 'transfer',
        withdrawFrom: type,
      });
    }

    setShowWithdraw(null);
    refresh();
  };

  const handleAddToTarget = async (targetId: number, newCurrentAmount: number, addedAmount: number, source: 'offline' | 'online') => {
    const balances = await getBalances();
    if (!balances) return;
    const currentBalance = source === 'online' ? balances.online : balances.offline;
    if (currentBalance < addedAmount) return;
    if (source === 'online') await updateBalances(balances.offline, balances.online - addedAmount);
    else await updateBalances(balances.offline - addedAmount, balances.online);
    await updateTarget(targetId, newCurrentAmount);
    const target = targets.find((t) => t.id === targetId);
    await addTransaction({ type: 'expense', category: `Target: ${target?.name || 'Unknown'}`, description: '', amount: addedAmount, timestamp: Date.now(), source });
    refresh();
  };

  const handleDeleteTarget = async (id: number) => { await deleteTarget(id); refresh(); };

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: '2cm' }}>
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.h1
              className="text-2xl font-bold"
              style={{ color: colors.text }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              Tabungan
            </motion.h1>
            <motion.div className={`relative ${shakeBell ? 'animate-shake' : ''}`}>
              <motion.div
                animate={shakeBell ? { rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Bell size={18} style={{ color: colors.accentSecondary }} />
              </motion.div>
              {shakeBell && (
                <motion.span
                  className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
          {shakeBell && (
            <motion.span
              className="text-xs font-medium"
              style={{ color: colors.accentSecondary }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Wajib Nabung!
            </motion.span>
          )}
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={1} variant="scaleIn">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            className="relative rounded-3xl p-4 overflow-hidden border cursor-pointer group"
            style={{ background: colors.card, borderColor: `${colors.offline}1a` }}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowWithdraw('investasi')}
          >
            <LiquidBlob />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                    <PiggyBank size={14} style={{ color: colors.offline }} />
                  </motion.div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Investasi</p>
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowDown size={12} style={{ color: colors.offline }} />
                </motion.div>
              </div>
              <JackpotTicker value={savings?.investasi || 0} className="text-lg font-bold" style={{ color: colors.offline }} />
              <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>Min. Rp 10.000</p>
            </div>
          </motion.div>

          <motion.div
            className="relative rounded-3xl p-4 overflow-hidden border cursor-pointer group"
            style={{ background: colors.card, borderColor: `${colors.accentSecondary}1a` }}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setShowWithdraw('darurat')}
          >
            <LiquidBlob />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <PiggyBank size={14} style={{ color: colors.accentSecondary }} />
                  </motion.div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>Darurat</p>
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowDown size={12} style={{ color: colors.accentSecondary }} />
                </motion.div>
              </div>
              <JackpotTicker value={savings?.darurat || 0} className="text-lg font-bold" style={{ color: colors.accentSecondary }} />
              <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>Min. Rp 5.000</p>
            </div>
          </motion.div>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={2} variant="flipUp">
        <motion.button
          onClick={() => setShowAddSavings(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02, y: -1 }}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all mb-6 border relative overflow-hidden"
          style={{ background: `${colors.offline}1a`, borderColor: `${colors.offline}4d`, color: colors.offline }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: colors.offline }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="relative z-10">Nabung Sekarang</span>
        </motion.button>
      </StaggeredEntrance>

      <StaggeredEntrance index={3} variant="slideRight">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.text }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              <Target size={18} style={{ color: colors.accent }} />
            </motion.div>
            Target
          </h2>
          <motion.button
            onClick={() => setShowAddTarget(true)}
            whileTap={{ scale: 0.85, rotate: 90 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="p-2 rounded-lg border transition-all"
            style={{ background: `${colors.accent}1a`, borderColor: `${colors.accent}33`, color: colors.accent }}
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </StaggeredEntrance>

      {targets.length === 0 ? (
        <StaggeredEntrance index={4} variant="scaleIn">
          <motion.div
            className="rounded-3xl p-8 border text-center"
            style={{ background: colors.card, borderColor: colors.border }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
              <Target size={32} className="mx-auto mb-2" style={{ color: colors.textMuted }} />
            </motion.div>
            <p className="text-sm" style={{ color: colors.textMuted }}>Belum ada target. Tambahkan target pertamamu!</p>
          </motion.div>
        </StaggeredEntrance>
      ) : (
        <div className="space-y-3">
          {targets.map((target, i) => (
            <StaggeredEntrance key={target.id} index={4 + i} variant="fadeUp">
              <TargetCard target={target} onAdd={handleAddToTarget} onDelete={handleDeleteTarget} />
            </StaggeredEntrance>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddSavings && <AddSavingsModal onAdd={handleAddSavings} onClose={() => setShowAddSavings(false)} />}
        {showAddTarget && <AddTargetModal onAdd={async (name, amount) => { await addTarget({ name, target_amount: amount, current_amount: 0 }); setShowAddTarget(false); refresh(); }} onClose={() => setShowAddTarget(false)} />}
        {showWithdraw && savings && (
          <WithdrawModal
            savingsAmount={showWithdraw === 'investasi' ? savings.investasi : savings.darurat}
            savingsType={showWithdraw}
            onWithdraw={(amount, method) => handleWithdraw(amount, method, showWithdraw)}
            onClose={() => setShowWithdraw(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TargetCard({ target, onAdd, onDelete }: { target: TargetType; onAdd: (id: number, newCurrentAmount: number, addedAmount: number, source: 'offline' | 'online') => void; onDelete: (id: number) => void }) {
  const { colors } = useTheme();
  const [addAmount, setAddAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const progress = target.target_amount > 0 ? (target.current_amount / target.target_amount) * 100 : 0;

  return (
    <motion.div
      className="relative rounded-3xl p-4 overflow-hidden border"
      style={{ background: colors.card, borderColor: colors.border }}
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <LiquidBlob />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>{target.name}</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>{formatRupiah(target.current_amount)} / {formatRupiah(target.target_amount)}</p>
          </div>
          <motion.button onClick={() => onDelete(target.id!)} whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.2, rotate: 15 }} style={{ color: colors.textMuted }}>
            <Trash2 size={14} />
          </motion.button>
        </div>
        <div className="w-full h-2.5 rounded-full mb-3 overflow-hidden" style={{ background: colors.inputBg }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`, boxShadow: `0 0 8px ${colors.glow}` }}
          />
        </div>
        {progress < 100 ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              {(['offline', 'online'] as const).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setSource(s)}
                  whileTap={{ scale: 0.93 }}
                  className="flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all border"
                  style={source === s
                    ? { background: `${s === 'offline' ? colors.offline : colors.accent}33`, color: s === 'offline' ? colors.offline : colors.accent, borderColor: `${s === 'offline' ? colors.offline : colors.accent}66` }
                    : { color: colors.textMuted, borderColor: colors.borderSubtle }
                  }
                >
                  {s === 'offline' ? 'Tunai' : 'E-Wallet'}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: colors.textMuted }}>Rp</span>
                <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0"
                  className="w-full rounded-lg pl-8 pr-2 py-2 text-xs border focus:outline-none transition-colors"
                  style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
                />
              </div>
              <motion.button
                onClick={() => { const amt = Number(addAmount) || 0; if (amt > 0) { onAdd(target.id!, target.current_amount + amt, amt, source); setAddAmount(''); } }}
                disabled={(Number(addAmount) || 0) <= 0}
                whileTap={(Number(addAmount) || 0) > 0 ? { scale: 0.93 } : undefined}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{ background: `${colors.accent}33`, color: colors.accent }}
              >
                Tambah
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.p
            className="text-xs font-medium"
            style={{ color: colors.offline }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Target tercapai!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

function AddSavingsModal({ onAdd, onClose }: { onAdd: (type: 'investasi' | 'darurat', amount: number, source: 'offline' | 'online') => void; onClose?: () => void }) {
  const { colors } = useTheme();
  const [type, setType] = useState<'investasi' | 'darurat'>('investasi');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [amount, setAmount] = useState('');

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6" style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <motion.h2 className="text-lg font-bold" style={{ color: colors.offline }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Nabung</motion.h2>
            {onClose && <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>}
          </div>
          <div className="flex gap-2 mb-4">
            {(['investasi', 'darurat'] as const).map((t, i) => (
              <motion.button key={t} onClick={() => setType(t)} whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={type === t ? { background: `${t === 'investasi' ? colors.offline : colors.accentSecondary}33`, color: t === 'investasi' ? colors.offline : colors.accentSecondary, borderColor: `${t === 'investasi' ? colors.offline : colors.accentSecondary}66` } : { color: colors.textMuted, borderColor: colors.borderSubtle }}
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              >
                {t === 'investasi' ? 'Investasi (min 10k)' : 'Darurat (min 5k)'}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            {(['offline', 'online'] as const).map((s, i) => (
              <motion.button key={s} onClick={() => setSource(s)} whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={source === s ? { background: `${s === 'offline' ? colors.offline : colors.accent}33`, color: s === 'offline' ? colors.offline : colors.accent, borderColor: `${s === 'offline' ? colors.offline : colors.accent}66` } : { color: colors.textMuted, borderColor: colors.borderSubtle }}
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + 0.05 * i }}
              >
                {s === 'offline' ? 'Tunai (Offline)' : 'E-Wallet (Online)'}
              </motion.button>
            ))}
          </div>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            />
          </div>
          <motion.button
            onClick={() => onAdd(type, Number(amount) || 0, source)}
            disabled={(Number(amount) || 0) < (type === 'investasi' ? 10000 : 5000)}
            whileTap={(Number(amount) || 0) >= (type === 'investasi' ? 10000 : 5000) ? { scale: 0.95 } : undefined}
            className="w-full py-3 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(to right, ${colors.offline}, ${colors.accentSecondary})`, color: colors.bg }}
          >
            Nabung
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

function AddTargetModal({ onAdd, onClose }: { onAdd: (name: string, amount: number) => void; onClose?: () => void }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl p-6" style={{ background: colors.cardAlpha, borderWidth: 1, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <motion.h2 className="text-lg font-bold" style={{ color: colors.accent }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Target Baru</motion.h2>
            {onClose && <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>}
          </div>
          <motion.input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama target"
            className="w-full rounded-lg px-4 py-3 text-sm border focus:outline-none transition-colors mb-3"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          />
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.textMuted }}>Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Target jumlah"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm border focus:outline-none transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.borderSubtle }}
            />
          </div>
          <motion.button
            onClick={() => onAdd(name, Number(amount) || 0)}
            disabled={!name || (Number(amount) || 0) <= 0}
            whileTap={name && (Number(amount) || 0) > 0 ? { scale: 0.95 } : undefined}
            className="w-full py-3 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`, color: colors.bg }}
          >
            Buat Target
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
