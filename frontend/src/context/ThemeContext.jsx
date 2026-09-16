import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  MIDNIGHT_OBSIDIAN: {
    id: 'midnight-obsidian',
    name: 'Midnight Charcoal',
    icon: '🌙',
    description: 'Deep premium charcoal, dark slate cards & cinema crimson accent',
    bg: '#0B0F17',
    surface: '#161B26',
    card: '#161B26',
    elevated: '#1E293B',
    hover: '#242F42',
    subtle: '#0F141F',
    border: '#1E293B',
    borderSubtle: '#151D2A',
    borderHover: '#E50914',
    accent: '#E50914',
    accentCrimson: '#E50914',
    accentGradient: 'from-rose-600 via-red-600 to-rose-700',
    primary: '#E50914',
    primaryHover: '#FF1E2B',
    gold: '#F59E0B',
    cyan: '#06B6D4',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B'
  },
  LUXE_WHITE: {
    id: 'luxe-white',
    name: 'Daylight Porcelain',
    icon: '☀️',
    description: 'Clean off-white slate, crisp white cards & high-contrast clarity',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#F1F5F9',
    hover: '#E2E8F0',
    subtle: '#F8FAFC',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    borderHover: '#E50914',
    accent: '#E50914',
    accentCrimson: '#E50914',
    accentGradient: 'from-rose-600 via-red-600 to-rose-700',
    primary: '#E50914',
    primaryHover: '#CC0812',
    gold: '#D97706',
    cyan: '#0284C7',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('cinebook_theme_mode');
    return saved && THEMES[saved] ? saved : 'MIDNIGHT_OBSIDIAN';
  });

  const isDark = currentTheme !== 'LUXE_WHITE';

  useEffect(() => {
    localStorage.setItem('cinebook_theme_mode', currentTheme);
    const themeObj = THEMES[currentTheme] || THEMES.MIDNIGHT_OBSIDIAN;
    const root = document.documentElement;

    // Manage dark/light classes on <html>
    root.classList.remove('theme-midnight-obsidian', 'theme-luxe-white', 'dark', 'light');
    root.classList.add(`theme-${themeObj.id}`);

    if (themeObj.id === 'luxe-white') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }

    // Apply dynamic CSS variables
    root.style.setProperty('--theme-bg', themeObj.bg);
    root.style.setProperty('--theme-surface', themeObj.surface);
    root.style.setProperty('--theme-card', themeObj.card);
    root.style.setProperty('--theme-elevated', themeObj.elevated || themeObj.surface);
    root.style.setProperty('--theme-hover', themeObj.hover || themeObj.surface);
    root.style.setProperty('--theme-subtle', themeObj.subtle || themeObj.bg);
    root.style.setProperty('--theme-border', themeObj.border);
    root.style.setProperty('--theme-border-subtle', themeObj.borderSubtle || themeObj.border);
    root.style.setProperty('--theme-border-hover', themeObj.borderHover || '#D4AF37');
    root.style.setProperty('--theme-accent', themeObj.accent);
    root.style.setProperty('--theme-crimson', themeObj.accentCrimson || '#E50914');
    root.style.setProperty('--theme-primary', themeObj.primary);
    root.style.setProperty('--theme-primary-hover', themeObj.primaryHover || '#FF1E2B');
    root.style.setProperty('--theme-gold', themeObj.gold || themeObj.accent);
    root.style.setProperty('--theme-cyan', themeObj.cyan || '#06B6D4');
    root.style.setProperty('--theme-text', themeObj.text);
    root.style.setProperty('--theme-text-primary', themeObj.text);
    root.style.setProperty('--theme-text-secondary', themeObj.textSecondary);
    root.style.setProperty('--theme-text-muted', themeObj.textMuted);
  }, [currentTheme]);

  const switchTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'LUXE_WHITE' ? 'MIDNIGHT_OBSIDIAN' : 'LUXE_WHITE'));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        theme: THEMES[currentTheme] || THEMES.MIDNIGHT_OBSIDIAN,
        isDark,
        toggleTheme,
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
