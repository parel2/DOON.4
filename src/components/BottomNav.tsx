import { motion } from 'framer-motion';
import { Wallet, PiggyBank, BarChart3, Globe } from 'lucide-react';
import { useTheme } from './ThemeEngine';

const tabs = [
  { id: 'home', label: 'Dompet', icon: Wallet },
  { id: 'savings', label: 'Tabungan', icon: PiggyBank },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'market', label: 'Market', icon: Globe },
] as const;

export type TabId = typeof tabs[number]['id'];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const { colors } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t" style={{ background: colors.navBg, borderColor: colors.border }}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300"
              style={{ color: isActive ? colors.accent : colors.textMuted }}
            >
              {isActive && (
                <>
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: `${colors.accent}14` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                  <motion.div
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: colors.accent, boxShadow: `0 0 8px ${colors.glow}` }}
                    layoutId="nav-top-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                </>
              )}
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </motion.div>
              <motion.span
                className="text-[10px] mt-0.5 font-medium"
                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {tab.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: colors.accent, boxShadow: `0 0 6px ${colors.glow}` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
