import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  MIDNIGHT_OBSIDIAN: {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    icon: '🌙',
    description: 'Executive Void Obsidian, Champagne Gold & Cinema Crimson',
    bg: '#080B10',
    surface: '#0F1523',
    card: '#0F1523',
    elevated: '#172033',
    border: '#1E293B',
    borderHover: '#D4AF37',
    accent: '#D4AF37',
    accentCrimson: '#E50914',
    accentGradient: 'from-[#D4AF37] via-amber-500 to-yellow-600',
    primary: '#E50914',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8'
  },
  LUXE_WHITE: {
    id: 'luxe-white',
    name: 'Daylight Porcelain',
    icon: '☀️',
    description: 'Ultra-clean porcelain white, titanium cards & high-contrast clarity',
    bg: '#F4F6FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#F1F5F9',
    border: '#E2E8F0',
    borderHover: '#D4AF37',
    accent: '#D97706',
    accentCrimson: '#E50914',
    accentGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    primary: '#E50914',
    text: '#0F172A',
    textSecondary: '#334155',
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
    root.style.setProperty('--theme-border', themeObj.border);
    root.style.setProperty('--theme-border-hover', themeObj.borderHover || '#D4AF37');
    root.style.setProperty('--theme-accent', themeObj.accent);
    root.style.setProperty('--theme-crimson', themeObj.accentCrimson || '#E50914');
    root.style.setProperty('--theme-primary', themeObj.primary);
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
