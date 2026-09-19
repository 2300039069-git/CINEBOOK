/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--theme-bg, #05070B)',
        surface: 'var(--theme-surface, #0C1017)',
        'surface-elevated': 'var(--theme-elevated, #141A24)',
        'surface-hover': 'var(--theme-hover, #1C2331)',
        'surface-subtle': 'var(--theme-subtle, #080B10)',
        'surface-card': 'var(--theme-card, #0C1017)',
        border: 'var(--theme-border, rgba(255, 255, 255, 0.08))',
        'border-subtle': 'var(--theme-border-subtle, rgba(255, 255, 255, 0.04))',
        accent: {
          DEFAULT: 'var(--theme-accent, #E5B869)',
          hover: 'var(--theme-accent-hover, #F3C77C)',
          subtle: 'rgba(229, 184, 105, 0.12)',
        },
        primary: {
          DEFAULT: 'var(--theme-primary, #FF204E)',
          hover: 'var(--theme-primary-hover, #FF3B64)',
          subtle: 'rgba(255, 32, 78, 0.12)',
          glow: 'rgba(255, 32, 78, 0.4)',
        },
        gold: {
          DEFAULT: 'var(--theme-gold, #E5B869)',
          hover: 'var(--theme-accent-hover, #F3C77C)',
          subtle: 'rgba(229, 184, 105, 0.12)',
          glow: 'rgba(229, 184, 105, 0.35)',
        },
        cyan: {
          DEFAULT: 'var(--theme-cyan, #00D2FF)',
          glow: 'rgba(0, 210, 255, 0.35)',
        },
        'text-primary': 'var(--theme-text-primary, #F8FAFC)',
        'text-secondary': 'var(--theme-text-secondary, #94A3B8)',
        'text-muted': 'var(--theme-text-muted, #64748B)',
      },
      boxShadow: {
        'cine-glow': '0 0 35px -5px rgba(255, 32, 78, 0.35)',
        'gold-glow': '0 0 35px -5px rgba(229, 184, 105, 0.35)',
        'surface-card': '0 10px 30px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'surface-hover': '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 24px -2px rgba(255, 32, 78, 0.25)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
