import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  MIDNIGHT_OBSIDIAN: {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian & Gold',
    icon: '👑',
    description: 'Executive Onyx Glass, Champagne Warm Gold & Cinema Crimson',
    bg: '#0B0E14',
    surface: 'rgba(18, 24, 36, 0.85)',
    card: '#121824',
    border: 'rgba(212, 175, 55, 0.22)',
    borderHover: '#D4AF37',
    accent: '#D4AF37',
    accentCrimson: '#E50914',
    accentGradient: 'from-amber-400 via-amber-500 to-yellow-600',
    primary: '#D4AF37',
    text: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8'
  },
  CYBER_NEON: {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    icon: '🌈',
    description: 'Electric gradients, vibrant neon & purple glowing glass',
    bg: '#0A0B14',
    surface: 'rgba(22, 24, 44, 0.75)',
    card: '#131527',
    border: 'rgba(168, 85, 247, 0.3)',
    borderHover: '#EC4899',
    accent: '#EC4899',
    accentCrimson: '#E50914',
    accentGradient: 'from-pink-500 via-purple-500 to-cyan-400',
    primary: '#8B5CF6',
    text: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8'
  },
  LUXE_WHITE: {
    id: 'luxe-white',
    name: 'Luxe Platinum',
    icon: '☀️',
    description: 'Ultra-clean porcelain white, titanium cards & sleek contrast',
    bg: '#F8FAFC',
    surface: 'rgba(255, 255, 255, 0.9)',
    card: '#FFFFFF',
    border: 'rgba(226, 232, 240, 0.9)',
    borderHover: '#D4AF37',
    accent: '#D4AF37',
    accentCrimson: '#E50914',
    accentGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    primary: '#D4AF37',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('cinebook_theme_mode');
    return saved && THEMES[saved] ? saved : 'MIDNIGHT_OBSIDIAN'; // Executive-grade Default
  });

  useEffect(() => {
    localStorage.setItem('cinebook_theme_mode', currentTheme);
    const themeObj = THEMES[currentTheme] || THEMES.MIDNIGHT_OBSIDIAN;
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('theme-cyber-neon', 'theme-midnight-black', 'theme-midnight-obsidian', 'theme-luxe-white');
    root.classList.add(`theme-${themeObj.id}`);

    if (themeObj.id === 'luxe-white') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Apply dynamic CSS variables
    root.style.setProperty('--theme-bg', themeObj.bg);
    root.style.setProperty('--theme-surface', themeObj.surface);
    root.style.setProperty('--theme-card', themeObj.card);
    root.style.setProperty('--theme-border', themeObj.border);
    root.style.setProperty('--theme-border-hover', themeObj.borderHover || '#D4AF37');
    root.style.setProperty('--theme-accent', themeObj.accent);
    root.style.setProperty('--theme-crimson', themeObj.accentCrimson || '#E50914');
    root.style.setProperty('--theme-primary', themeObj.primary);
    root.style.setProperty('--theme-text', themeObj.text);
    root.style.setProperty('--theme-text-secondary', themeObj.textSecondary);
    root.style.setProperty('--theme-text-muted', themeObj.textMuted);
  }, [currentTheme]);

  const switchTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        theme: THEMES[currentTheme] || THEMES.MIDNIGHT_OBSIDIAN,
        switchTheme,
        allThemes: THEMES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
