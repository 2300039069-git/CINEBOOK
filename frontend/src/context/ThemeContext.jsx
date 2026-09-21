import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  MIDNIGHT_OBSIDIAN: {
    id: 'midnight-obsidian',
    name: 'Luxury Midnight',
    icon: '🌙',
    description: 'Deep obsidian navy, dark glass cards & glowing Art-Deco gold accents',
    bg: '#171b34',
    bgGradient: 'linear-gradient(160deg, #171b34 0%, #241a3e 50%, #2c1f4a 100%)',
    surface: '#1e2348',
    card: '#1e2348',
    elevated: '#262b52',
    hover: '#2f3563',
    subtle: '#171b34',
    border: 'rgba(255, 255, 255, 0.1)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    borderHover: '#e0b45c',
    accent: '#7c5cc4',
    primary: '#e0b45c',
    primaryHover: '#f6dd9c',
    gold: '#e0b45c',
    text: '#ffffff',
    textSecondary: '#a8adc9',
    textMuted: '#6b7094'
  },
  LUXE_WHITE: {
    id: 'luxe-white',
    name: 'Champagne Porcelain',
    icon: '☀️',
    description: 'Crisp pearl marble, frosted white cards & warm antique gold accents',
    bg: '#f4f6fc',
    bgGradient: 'linear-gradient(160deg, #f4f6fc 0%, #eaeffb 50%, #e2e8f5 100%)',
    surface: '#ffffff',
    card: '#ffffff',
    elevated: '#f0f3fa',
    hover: '#e2e8f0',
    subtle: '#f4f6fc',
    border: 'rgba(15, 23, 42, 0.08)',
    borderSubtle: 'rgba(15, 23, 42, 0.04)',
    borderHover: '#d4af37',
    accent: '#6b46c1',
    primary: '#d4af37',
    primaryHover: '#b8860b',
    gold: '#d4af37',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b'
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
    root.style.setProperty('--theme-bg-gradient', themeObj.bgGradient);
    root.style.setProperty('--theme-surface', themeObj.surface);
    root.style.setProperty('--theme-card', themeObj.card);
    root.style.setProperty('--theme-elevated', themeObj.elevated || themeObj.surface);
    root.style.setProperty('--theme-hover', themeObj.hover || themeObj.surface);
    root.style.setProperty('--theme-subtle', themeObj.subtle || themeObj.bg);
    root.style.setProperty('--theme-border', themeObj.border);
    root.style.setProperty('--theme-border-subtle', themeObj.borderSubtle || themeObj.border);
    root.style.setProperty('--theme-border-hover', themeObj.borderHover);
    root.style.setProperty('--theme-accent', themeObj.accent);
    root.style.setProperty('--theme-primary', themeObj.primary);
    root.style.setProperty('--theme-primary-hover', themeObj.primaryHover);
    root.style.setProperty('--theme-gold', themeObj.gold);
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
        theme: isDark ? 'dark' : 'light',
        themeConfig: THEMES[currentTheme] || THEMES.MIDNIGHT_OBSIDIAN,
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

export default ThemeContext;
