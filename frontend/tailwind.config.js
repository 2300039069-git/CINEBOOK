/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080B10',
        surface: '#0F1523',
        'surface-hover': '#172033',
        border: '#1E293B',
        primary: {
          DEFAULT: '#E50914',
          hover: '#CC0812',
          light: '#FF3B47'
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          dark: '#AA7C11'
        },
        'text-main': '#F8FAFC',
        'text-muted': '#94A3B8',
        cine: {
          bg: '#080B10',
          surface: '#0F1523',
          card: '#0F1523',
          border: '#1E293B',
          primary: '#E50914',
          accent: '#D4AF37',
          text: '#F8FAFC',
          textMuted: '#94A3B8',
          gold: '#D4AF37',
          crimson: '#E50914',
          obsidian: '#080B10'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-crimson': '0 0 30px -5px rgba(229, 9, 20, 0.55)',
        'glow-gold': '0 0 30px -5px rgba(212, 175, 55, 0.45)',
        'glow-screen': '0 0 40px 4px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
