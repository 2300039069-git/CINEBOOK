/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#090A0E',
        surface: '#11141D',
        'surface-elevated': '#181C28',
        'surface-hover': '#1D2232',
        'surface-subtle': '#0D0F16',
        'surface-card': '#11141D',
        border: '#1E2332',
        'border-subtle': '#161A26',
        'border-focus': '#E50914',
        accent: {
          DEFAULT: '#E50914',
          hover: '#CC0812',
          subtle: 'rgba(229, 9, 20, 0.12)',
          light: '#F02834',
        },
        primary: {
          DEFAULT: '#E50914',
          hover: '#CC0812',
          light: '#F02834',
        },
        gold: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          subtle: 'rgba(245, 158, 11, 0.12)',
          glow: 'rgba(245, 158, 11, 0.2)',
        },
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        cine: {
          bg: '#090A0E',
          surface: '#11141D',
          elevated: '#181C28',
          hover: '#1D2232',
          card: '#11141D',
          border: '#1E2332',
          crimson: '#E50914',
          amber: '#F59E0B',
          text: '#FFFFFF',
          textMuted: '#94A3B8',
          textDim: '#64748B',
        },
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(0, 0, 0, 0.4), 0 1px 4px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
        'dropdown': '0 16px 36px -4px rgba(0, 0, 0, 0.75)',
        'cta': '0 4px 14px 0 rgba(229, 9, 20, 0.35)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
