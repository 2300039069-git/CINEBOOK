import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  CYBER_NEON: {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    icon: '🌈',
    description: 'Vibrant multi-color neon, electric gradients & glowing glass',
    bg: '#0A0B14',
    surface: 'rgba(22, 24, 44, 0.75)',
    card: '#131527',
    border: 'rgba(168, 85, 247, 0.3)',
    accent: '#EC4899',
    accentGradient: 'from-pink-500 via-purple-500 to-cyan-400',
    primary: '#8B5CF6',
    text: '#FFFFFF',
    textMuted: '#94A3B8'
  },
  MIDNIGHT_BLACK: {
    id: 'midnight-black',
    name: 'Midnight Dark',
    icon: '🌑',
    description: 'Stealth deep pitch black, obsidian glass & crimson accents',
    bg: '#070709',
    surface: 'rgba(18, 18, 24, 0.85)',
    card: '#111116',
    border: 'rgba(255, 0, 58, 0.25)',
    accent: '#FF003A',
    accentGradient: 'from-rose-600 via-red-500 to-amber-500',
    primary: '#FF003A',
    text: '#FFFFFF',
    textMuted: '#8E8EA0'
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
    accent: '#4F46E5',
    accentGradient: 'from-indigo-600 via-violet-600 to-blue-500',
    primary: '#4F46E5',
    text: '#0F172A',
    textMuted: '#64748B'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('cinebook_theme_mode');
    return saved && THEMES[saved] ? saved : 'CYBER_NEON'; // Default to Cyber Neon for ultra-colorful attraction!
  });

  useEffect(() => {
    localStorage.setItem('cinebook_theme_mode', currentTheme);
    const themeObj = THEMES[currentTheme];
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('theme-cyber-neon', 'theme-midnight-black', 'theme-luxe-white');
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
    root.style.setProperty('--theme-accent', themeObj.accent);
    root.style.setProperty('--theme-primary', themeObj.primary);
    root.style.setProperty('--theme-text', themeObj.text);
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
        theme: THEMES[currentTheme],
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
