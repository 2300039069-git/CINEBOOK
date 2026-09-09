/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#05070B',
        surface: '#0B101B',
        'surface-card': '#111827',
        'surface-elevated': '#182235',
        border: '#1F293D',
        accent: '#E50914',
        'accent-hover': '#B80710',
        gold: '#D4AF37',
        'gold-glow': 'rgba(212, 175, 55, 0.15)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        cine: {
          bg: '#05070B',
          surface: '#0B101B',
          card: '#111827',
          elevated: '#182235',
          border: '#1F293D',
          primary: '#E50914',
          accent: '#D4AF37',
          text: '#FFFFFF',
          textMuted: '#9CA3AF',
          gold: '#D4AF37',
          crimson: '#E50914',
          obsidian: '#05070B',
        },
      },
      boxShadow: {
        'cinema-glow': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
