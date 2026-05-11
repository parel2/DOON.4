import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { exportDB, importDB, clearDB } from '../db';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeEngine';

export default function MigrationModal({ onClose, onImported, onCleared }: { onClose: () => void; onImported: () => void; onCleared: () => void }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'export' | 'import' | 'clear'>('export');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try { const code = await exportDB(); setExportCode(code); } catch { setMessage('Gagal mengekspor data'); }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    setLoading(true);
    try {
      await importDB(importCode.trim());
      setMessage('Data berhasil diimpor! Memuat ulang...');
      setTimeout(() => { onImported(); onClose(); }, 1500);
    } catch { setMessage('Kode tidak valid. Pastikan kode benar.'); }
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await clearDB();
      setMessage('Semua data berhasil dihapus!');
      setTimeout(() => { onCleared(); onClose(); }, 1500);
    } catch { setMessage('Gagal menghapus data.'); }
    setLoading(false);
    setConfirmClear(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl backdrop-blur-xl border p-6 shadow-2xl max-h-[85vh] overflow-y-auto" style={{ background: colors.cardAlpha, borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-3">
            <motion.h2 className="text-lg font-bold" style={{ color: colors.accentSecondary }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Imigrasi Data</motion.h2>
            <motion.button onClick={onClose} whileTap={{ scale: 0.85, rotate: 90 }} style={{ color: colors.textMuted }}><X size={20} /></motion.button>
          </div>

          <motion.div className="mb-5" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <ThemeToggle />
          </motion.div>

          <div className="flex gap-2 mb-5">
            {(['export', 'import', 'clear'] as const).map((t, i) => (
              <motion.button
                key={t}
                onClick={() => { setTab(t); setMessage(''); if (t === 'clear') setConfirmClear(false); }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 border"
                style={tab === t
                  ? { background: t === 'clear' ? '#f43f5e33' : `${colors.accentSecondary}33`, color: t === 'clear' ? '#f43f5e' : colors.accentSecondary, borderColor: t === 'clear' ? '#f43f5e66' : `${colors.accentSecondary}66` }
                  : { color: colors.textMuted, borderColor: colors.borderSubtle }
                }
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                {t === 'export' ? <Download size={14} /> : t === 'import' ? <Upload size={14} /> : <Trash2 size={14} />}
                {t === 'export' ? 'Ekspor' : t === 'import' ? 'Impor' : 'Hapus'}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'export' && (
              <motion.div key="export" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                <motion.button
                  onClick={handleExport}
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 mb-4 relative overflow-hidden"
                  style={{ background: `linear-gradient(to right, ${colors.accentSecondary}, ${colors.accent})`, color: colors.bg }}
                >
                  <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.15)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                  <span className="relative z-10">{loading ? 'Mengekspor...' : 'Ekspor Data'}</span>
                </motion.button>
                {exportCode && (
                  <motion.div className="relative" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <textarea readOnly value={exportCode}
                      className="w-full border rounded-lg p-3 text-xs h-32 resize-none"
                      style={{ background: colors.inputBg, color: colors.textSecondary, borderColor: colors.borderSubtle }}
                    />
                    <motion.button onClick={handleCopy} whileTap={{ scale: 0.85 }}
                      className="absolute top-2 right-2 p-1.5 rounded-md transition-colors"
                      style={{ background: colors.borderSubtle, color: colors.textSecondary }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={14} className="text-emerald-400" /></motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={14} /></motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {tab === 'import' && (
              <motion.div key="import" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                <textarea value={importCode} onChange={(e) => setImportCode(e.target.value)} placeholder="Tempel kode ekspor di sini..."
                  className="w-full border rounded-lg p-3 text-xs h-32 resize-none mb-4 focus:outline-none transition-colors"
                  style={{ background: colors.inputBg, color: colors.textSecondary, borderColor: colors.borderSubtle }}
                />
                <motion.button
                  onClick={handleImport}
                  disabled={loading || !importCode.trim()}
                  whileTap={!loading && importCode.trim() ? { scale: 0.95 } : undefined}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{ background: `linear-gradient(to right, ${colors.accentSecondary}, ${colors.accent})`, color: colors.bg }}
                >
                  <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.15)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                  <span className="relative z-10">{loading ? 'Mengimpor...' : 'Impor Data'}</span>
                </motion.button>
              </motion.div>
            )}

            {tab === 'clear' && (
              <motion.div key="clear" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                <motion.div
                  className="border rounded-xl p-4 mb-4"
                  style={{ background: '#f43f5e1a', borderColor: '#f43f5e33' }}
                  animate={{ scale: [1, 1.01, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                      <AlertTriangle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-rose-400">Peringatan</p>
                      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>Semua data akan dihapus permanen termasuk saldo, transaksi, tabungan, dan target. Pastikan kamu sudah mengekspor data sebelum menghapus.</p>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {!confirmClear ? (
                    <motion.button key="confirm" onClick={() => setConfirmClear(true)}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 rounded-lg border font-bold text-sm transition-all"
                      style={{ background: '#f43f5e1a', borderColor: '#f43f5e4d', color: '#f43f5e' }}
                    >
                      Hapus Semua Data
                    </motion.button>
                  ) : (
                    <motion.div key="confirming" initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="space-y-2">
                      <p className="text-xs text-center text-rose-400 font-medium">Yakin ingin menghapus semua data?</p>
                      <div className="flex gap-2">
                        <motion.button onClick={() => setConfirmClear(false)} whileTap={{ scale: 0.95 }}
                          className="flex-1 py-3 rounded-lg font-medium text-sm transition-all"
                          style={{ background: colors.borderSubtle, color: colors.textSecondary }}
                        >
                          Batal
                        </motion.button>
                        <motion.button onClick={handleClear} disabled={loading}
                          whileTap={!loading ? { scale: 0.95 } : undefined}
                          className="flex-1 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 relative overflow-hidden"
                          style={{ background: 'linear-gradient(to right, #f43f5e, #ec4899)', color: '#ffffff' }}
                        >
                          <motion.div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.1)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                          <span className="relative z-10">{loading ? 'Menghapus...' : 'Ya, Hapus'}</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <motion.p className="mt-3 text-sm text-center" style={{ color: colors.accentSecondary }} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
}
