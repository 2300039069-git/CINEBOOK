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
        cine: {
          bg: 'var(--theme-bg)',
          surface: 'var(--theme-surface)',
          card: 'var(--theme-card)',
          border: 'var(--theme-border)',
          primary: 'var(--theme-accent)',
          accent: 'var(--theme-accent)',
          text: 'var(--theme-text-primary)',
          textMuted: 'var(--theme-text-muted)',
          gold: '#F59E0B',
          pink: '#EC4899',
          cyan: '#06B6D4',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.5)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'glow-screen': '0 0 35px 2px rgba(6, 182, 212, 0.45)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
