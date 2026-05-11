import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useTheme } from '../components/ThemeEngine';
import StaggeredEntrance from '../components/StaggeredEntrance';
import { formatNumber } from '../utils/format';

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
}

const COINGECKO_IDS = ['bitcoin', 'ethereum'];
const GOLD_FALLBACK: MarketData = { id: 'xau', name: 'Emas (XAU)', symbol: 'XAU', price: 3320000, change24h: 0.3, icon: 'XAU' };

export default function MarketPage() {
  const { colors } = useTheme();
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=${COINGECKO_IDS.join(',')}&order=market_cap_desc&sparkline=false`);
      if (res.ok) {
        const json = await res.json();
        const cryptoData: MarketData[] = json.map((coin: Record<string, unknown>) => ({
          id: coin.id as string, name: coin.name as string, symbol: (coin.symbol as string).toUpperCase(),
          price: coin.current_price as number, change24h: coin.price_change_percentage_24h as number,
          icon: coin.id === 'bitcoin' ? 'BTC' : 'ETH',
        }));
        setData([...cryptoData, GOLD_FALLBACK]);
        setLastUpdated(Date.now());
      }
    } catch {
      if (data.length === 0) {
        setData([
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 0, change24h: 0, icon: 'BTC' },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 0, change24h: 0, icon: 'ETH' },
          GOLD_FALLBACK,
        ]);
      }
    }
    setLoading(false);
  }, [data.length]);

  useEffect(() => { fetchMarket(); }, []);

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: '2cm' }}>
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <motion.h1 className="text-2xl font-bold" style={{ color: colors.text }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Market Monitor</motion.h1>
          <motion.button
            onClick={fetchMarket}
            disabled={loading}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1, rotate: 180 }}
            className="p-2 rounded-lg border transition-all disabled:opacity-40"
            style={{ background: colors.card, borderColor: colors.border, color: colors.textSecondary }}
          >
            <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={16} />
            </motion.div>
          </motion.button>
        </div>
      </StaggeredEntrance>

      {lastUpdated > 0 && (
        <StaggeredEntrance index={1}>
          <motion.p
            className="text-[10px] mb-4"
            style={{ color: colors.textMuted }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Terakhir diperbarui: {new Date(lastUpdated).toLocaleTimeString('id-ID')}
          </motion.p>
        </StaggeredEntrance>
      )}

      <div className="space-y-3">
        {data.map((item, i) => (
          <StaggeredEntrance key={item.id} index={2 + i} variant="scaleIn">
            <motion.div
              className="rounded-3xl p-4 border transition-all relative overflow-hidden"
              style={{ background: colors.card, borderColor: colors.border }}
              whileHover={{ scale: 1.02, y: -2, boxShadow: `0 0 30px ${item.change24h >= 0 ? colors.glow : 'rgba(244,63,94,0.2)'}` }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ background: `radial-gradient(circle at 80% 50%, ${item.change24h >= 0 ? colors.offline : '#f43f5e'}08, transparent 70%)` }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border"
                    style={{ background: `linear-gradient(135deg, ${colors.accent}33, ${colors.accentSecondary}33)`, color: colors.accent, borderColor: `${colors.accent}33` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{item.name}</p>
                    <p className="text-xs" style={{ color: colors.textMuted }}>{item.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: colors.text }}>Rp {formatNumber(item.price, 0)}</p>
                  <motion.div
                    className="flex items-center justify-end gap-1 text-xs"
                    style={{ color: item.change24h >= 0 ? colors.offline : '#f43f5e' }}
                    animate={Math.abs(item.change24h) > 2 ? { x: [0, 2, -2, 0] } : {}}
                    transition={{ duration: 0.5, repeat: Math.abs(item.change24h) > 2 ? 1 : 0 }}
                  >
                    <motion.div animate={{ rotate: item.change24h >= 0 ? [0, -15, 0] : [0, 15, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                      {item.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </motion.div>
                    <span>{item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </StaggeredEntrance>
        ))}
      </div>

      <StaggeredEntrance index={5} variant="fadeUp">
        <motion.div
          className="mt-6 rounded-3xl p-4 border"
          style={{ background: colors.card, borderColor: colors.border }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Tentang Market</h3>
          <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
            Data harga BTC dan ETH diambil dari CoinGecko API secara real-time. Harga emas (XAU) menggunakan estimasi. Ketuk tombol refresh untuk memperbarui data.
          </p>
        </motion.div>
      </StaggeredEntrance>
    </div>
  );
}
