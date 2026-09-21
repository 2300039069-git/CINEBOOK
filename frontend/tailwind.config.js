/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0E14',
        surface: '#121824',
        'surface-elevated': '#1A2234',
        'surface-hover': '#222C42',
        'surface-subtle': '#0E131D',
        'surface-card': '#121824',
        border: 'rgba(229, 169, 60, 0.2)',
        'border-subtle': 'rgba(229, 169, 60, 0.1)',
        'border-gold': 'rgba(229, 169, 60, 0.35)',
        accent: {
          DEFAULT: '#E5A93C',
          hover: '#FFD066',
          subtle: 'rgba(229, 169, 60, 0.15)',
        },
        primary: {
          DEFAULT: '#E5A93C',
          hover: '#FFD066',
          subtle: 'rgba(229, 169, 60, 0.15)',
          glow: 'rgba(229, 169, 60, 0.45)',
        },
        gold: {
          DEFAULT: '#E5A93C',
          bright: '#FFD066',
          hover: '#FFD066',
          subtle: 'rgba(229, 169, 60, 0.15)',
          glow: 'rgba(229, 169, 60, 0.45)',
        },
        'text-primary': '#FFFFFF',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(229, 169, 60, 0.45)',
        'gold-glow-lg': '0 0 25px rgba(229, 169, 60, 0.55)',
        'cine-glow': '0 0 15px rgba(229, 169, 60, 0.45)',
        'surface-card': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(229, 169, 60, 0.2)',
        'surface-hover': '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 169, 60, 0.35)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
