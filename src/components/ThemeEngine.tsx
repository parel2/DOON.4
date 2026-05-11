import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeId = 'gelap' | 'terang' | 'spesial';

interface ThemeColors {
  bg: string;
  card: string;
  cardAlpha: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  online: string;
  offline: string;
  particle: string;
  accent: string;
  accentSecondary: string;
  inputBg: string;
  navBg: string;
  glow: string;
  glowSecondary: string;
  gradient: string;
  gradientSecondary: string;
}

const THEMES: Record<ThemeId, ThemeColors> = {
  gelap: {
    bg: '#000000',
    card: '#121212',
    cardAlpha: 'rgba(18,18,18,0.95)',
    text: '#ffffff',
    textSecondary: '#d1d5db',
    textMuted: '#6b7280',
    border: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.06)',
    online: '#06b6d4',
    offline: '#10b981',
    particle: 'rgba(255,255,255,0.05)',
    accent: '#06b6d4',
    accentSecondary: '#14b8a6',
    inputBg: '#000000',
    navBg: 'rgba(18,18,18,0.8)',
    glow: 'rgba(6,182,212,0.4)',
    glowSecondary: 'rgba(20,184,166,0.3)',
    gradient: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
    gradientSecondary: 'linear-gradient(135deg, #14b8a6, #10b981)',
  },
  terang: {
    bg: '#FAFAFA',
    card: '#ffffff',
    cardAlpha: 'rgba(255,255,255,0.85)',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#9ca3af',
    border: 'rgba(0,0,0,0.08)',
    borderSubtle: 'rgba(0,0,0,0.06)',
    online: '#0891b2',
    offline: '#059669',
    particle: 'rgba(0,0,0,0.03)',
    accent: '#0891b2',
    accentSecondary: '#0d9488',
    inputBg: '#f3f4f6',
    navBg: 'rgba(255,255,255,0.85)',
    glow: 'rgba(8,145,178,0.3)',
    glowSecondary: 'rgba(13,148,136,0.2)',
    gradient: 'linear-gradient(135deg, #0891b2, #0d9488)',
    gradientSecondary: 'linear-gradient(135deg, #0d9488, #059669)',
  },
  spesial: {
    bg: '#1A1A2E',
    card: '#16213E',
    cardAlpha: 'rgba(22,33,62,0.95)',
    text: '#ffffff',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    border: 'rgba(255,215,0,0.12)',
    borderSubtle: 'rgba(255,215,0,0.06)',
    online: '#FFD700',
    offline: '#E94560',
    particle: 'rgba(255,215,0,0.05)',
    accent: '#FFD700',
    accentSecondary: '#E94560',
    inputBg: '#0f0f23',
    navBg: 'rgba(22,33,62,0.85)',
    glow: 'rgba(255,215,0,0.4)',
    glowSecondary: 'rgba(233,69,96,0.3)',
    gradient: 'linear-gradient(135deg, #FFD700, #E94560)',
    gradientSecondary: 'linear-gradient(135deg, #E94560, #FFD700)',
  },
};

interface ThemeContextValue {
  theme: ThemeId;
  colors: ThemeColors;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'gelap',
  colors: THEMES.gelap,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_KEY = 'doon_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'gelap' || saved === 'terang' || saved === 'spesial') return saved;
    } catch {}
    return 'gelap';
  });

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    try { localStorage.setItem(THEME_KEY, id); } catch {}
  };

  const colors = THEMES[theme];

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--card', colors.card);
    document.documentElement.style.setProperty('--card-alpha', colors.cardAlpha);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--text-muted', colors.textMuted);
    document.documentElement.style.setProperty('--border', colors.border);
    document.documentElement.style.setProperty('--border-subtle', colors.borderSubtle);
    document.documentElement.style.setProperty('--online', colors.online);
    document.documentElement.style.setProperty('--offline', colors.offline);
    document.documentElement.style.setProperty('--particle', colors.particle);
    document.documentElement.style.setProperty('--accent', colors.accent);
    document.documentElement.style.setProperty('--accent-secondary', colors.accentSecondary);
    document.documentElement.style.setProperty('--input-bg', colors.inputBg);
    document.documentElement.style.setProperty('--nav-bg', colors.navBg);
    document.documentElement.style.setProperty('--glow', colors.glow);
    document.documentElement.style.setProperty('--glow-secondary', colors.glowSecondary);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.bg);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
