import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTransactions, type Transaction } from '../db';
import { useTheme } from '../components/ThemeEngine';
import StaggeredEntrance from '../components/StaggeredEntrance';
import { formatRupiah } from '../utils/format';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function AnalyticsPage() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [sourceFilter, setSourceFilter] = useState<'semua' | 'online' | 'offline'>('semua');

  const refresh = useCallback(async () => {
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const now = Date.now();
  const periodMs = period === '7d' ? 86400000 * 7 : period === '30d' ? 86400000 * 30 : Infinity;
  const filtered = transactions.filter((tx) => now - tx.timestamp < periodMs);
  const sourceFiltered = sourceFilter === 'semua' ? filtered : filtered.filter((tx) => tx.source === sourceFilter);
  
  // Exclude withdraw transactions & adjust savings for burn rate
  const expenses = sourceFiltered.filter((tx) => {
    // Exclude direct withdrawals & withdraw to balance
    if (tx.type === 'withdraw_direct' || tx.type === 'withdraw_to_balance') return false;
    // Only count actual expenses and transfer fees
    return tx.type === 'expense' || tx.type === 'transfer_fee';
  });

  // Calculate adjusted expenses excluding savings that were withdrawn
  const adjustedExpenses = expenses.map((tx) => {
    // If transaction is a savings category and there's a corresponding withdraw, we may need to adjust
    // For now, just return as-is - withdrawal logic affects the final calculation
    return tx;
  });

  const dailyMap = new Map<string, number>();
  adjustedExpenses.forEach((tx) => {
    const day = new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    dailyMap.set(day, (dailyMap.get(day) || 0) + tx.amount);
  });
  const burnData = Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount }));

  const catMap = new Map<string, number>();
  adjustedExpenses.forEach((tx) => { catMap.set(tx.category, (catMap.get(tx.category) || 0) + tx.amount); });
  const pieData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

  const hourMap = new Map<number, number>();
  adjustedExpenses.forEach((tx) => { const hour = new Date(tx.timestamp).getHours(); hourMap.set(hour, (hourMap.get(hour) || 0) + tx.amount); });
  const timeData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, '0')}:00`, amount: hourMap.get(i) || 0 }));

  // Heatmap: Count ACTUAL tabungan (add) transactions, not withdrawals
  const heatmapDays = 90;
  const heatmapData: { date: string; amount: number; day: number }[] = [];
  for (let i = heatmapDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    
    // Only count actual savings transactions (expense type with "Tabungan" category), not withdrawals
    const daySavings = transactions
      .filter((tx) => 
        tx.category?.includes('Tabungan') && 
        tx.type === 'expense' && // Only actual savings deposits
        tx.timestamp >= dayStart && 
        tx.timestamp < dayEnd
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    heatmapData.push({ date: dateStr, amount: daySavings, day: i });
  }
  const maxHeat = Math.max(...heatmapData.map((d) => d.amount), 1);

  const totalExpense = adjustedExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const tooltipStyle = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '12px', boxShadow: `0 0 20px ${colors.glow}20` };

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: '2cm' }}>
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <motion.h1 className="text-2xl font-bold" style={{ color: colors.text }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Analitik</motion.h1>
          <motion.div
            className="flex gap-1 rounded-lg p-1 border"
            style={{ background: colors.card, borderColor: colors.border }}
            whileHover={{ scale: 1.02 }}
          >
            {(['7d', '30d', 'all'] as const).map((p) => (
              <motion.button
                key={p}
                onClick={() => setPeriod(p)}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all relative"
                style={period === p ? { color: colors.accent } : { color: colors.textMuted }}
              >
                {period === p && (
                  <motion.div
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-md"
                    style={{ background: `${colors.accent}33` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : 'Semua'}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={1} variant="slideRight">
        <div className="flex gap-2 mb-4">
          {(['semua', 'online', 'offline'] as const).map((f, i) => (
            <motion.button
              key={f}
              onClick={() => setSourceFilter(f)}
              whileTap={{ scale: 0.93 }}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize border"
              style={sourceFilter === f ? { background: '#f43f5e33', color: '#f43f5e', borderColor: '#f43f5e66' } : { color: colors.textMuted, borderColor: colors.borderSubtle }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * i }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={2} variant="scaleIn">
        <motion.div
          className="rounded-3xl p-4 border mb-4"
          style={{ background: colors.card, borderColor: colors.border, boxShadow: `0 0 30px ${colors.glow}10` }}
          whileHover={{ y: -2, boxShadow: `0 0 40px ${colors.glow}20` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Total Pengeluaran{sourceFilter !== 'semua' ? ` (${sourceFilter})` : ''}</p>
          <motion.p
            className="text-2xl font-bold"
            style={{ color: '#f43f5e' }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {formatRupiah(totalExpense)}
          </motion.p>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{adjustedExpenses.length} transaksi</p>
        </motion.div>
      </StaggeredEntrance>

      <StaggeredEntrance index={3} variant="flipUp">
        <motion.div
          className="rounded-3xl p-4 border mb-4"
          style={{ background: colors.card, borderColor: colors.border }}
          whileHover={{ y: -1 }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Burn Rate</h3>
          {burnData.length === 0 ? (
            <motion.p className="text-xs text-center py-8" style={{ color: colors.textMuted }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>Belum ada data</motion.p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={burnData}>
                <XAxis dataKey="date" tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: colors.textMuted }} formatter={(value) => [formatRupiah(Number(value)), 'Pengeluaran']} />
                <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2.5} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </StaggeredEntrance>

      <StaggeredEntrance index={4} variant="scaleIn">
        <motion.div className="rounded-3xl p-4 border mb-4" style={{ background: colors.card, borderColor: colors.border }} whileHover={{ y: -1 }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Kategori Pengeluaran</h3>
          {pieData.length === 0 ? (
            <motion.p className="text-xs text-center py-8" style={{ color: colors.textMuted }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>Belum ada data</motion.p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2} animationDuration={1200} animationBegin={200}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatRupiah(Number(value)), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 max-h-40 overflow-y-auto">
                {pieData.map((d, i) => (
                  <motion.div
                    key={d.name}
                    className="flex items-center gap-2 text-xs"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={{ x: 3 }}
                  >
                    <motion.span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="truncate flex-1" style={{ color: colors.textSecondary }}>{d.name}</span>
                    <span style={{ color: colors.textSecondary }}>{formatRupiah(d.value)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </StaggeredEntrance>

      <StaggeredEntrance index={5} variant="slideRight">
        <motion.div className="rounded-3xl p-4 border mb-4" style={{ background: colors.card, borderColor: colors.border }} whileHover={{ y: -1 }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Waktu Penggunaan</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timeData}>
              <XAxis dataKey="hour" tick={{ fill: colors.textMuted, fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: colors.textMuted, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatRupiah(Number(value)), 'Pengeluaran']} />
              <Line type="monotone" dataKey="amount" stroke={colors.accent} strokeWidth={1.5} dot={false} animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </StaggeredEntrance>

      <StaggeredEntrance index={6} variant="fadeUp">
        <motion.div className="rounded-3xl p-4 border" style={{ background: colors.card, borderColor: colors.border }} whileHover={{ y: -1 }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Heatmap Tabungan (90 Hari)</h3>
          <div className="flex flex-wrap gap-[3px]">
            {heatmapData.map((d, i) => {
              const intensity = d.amount > 0 ? Math.max(0.15, d.amount / maxHeat) : 0.05;
              return (
                <motion.div
                  key={d.day}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{ background: `${colors.accent}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` }}
                  title={`${d.date}: ${formatRupiah(d.amount)}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.003, duration: 0.3 }}
                  whileHover={{ scale: 1.8, zIndex: 10 }}
                />
              );
            })}
          </div>
        </motion.div>
      </StaggeredEntrance>
    </div>
  );
}
