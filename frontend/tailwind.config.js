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
        background: 'var(--bg-primary, #171b34)',
        surface: {
          DEFAULT: 'var(--bg-secondary, #1e2348)',
          elevated: 'var(--bg-elevated, #262b52)',
          hover: 'var(--theme-hover, #2f3563)',
          subtle: 'var(--bg-primary, #171b34)'
        },
        navy: {
          950: '#111428',
          900: '#171b34',
          800: '#1e2348',
          700: '#262b52',
          600: '#323868',
          500: '#4a4f74'
        },
        gold: {
          light: 'var(--gold-light, #f6dd9c)',
          DEFAULT: 'var(--gold-mid, #e0b45c)',
          mid: 'var(--gold-mid, #e0b45c)',
          deep: 'var(--gold-deep, #b8862f)'
        },
        primary: {
          DEFAULT: 'var(--gold-mid, #e0b45c)',
          hover: 'var(--gold-light, #f6dd9c)',
          active: 'var(--gold-deep, #b8862f)',
          light: 'var(--gold-light, #f6dd9c)',
          dark: 'var(--gold-deep, #b8862f)',
        },
        accent: {
          DEFAULT: 'var(--accent-purple, #7c5cc4)',
          purple: 'var(--accent-purple, #7c5cc4)',
          gold: 'var(--gold-mid, #e0b45c)'
        },
        text: {
          primary: 'var(--text-primary, #ffffff)',
          secondary: 'var(--text-secondary, #a8adc9)',
          muted: 'var(--text-muted, #6b7094)'
        },
        border: {
          DEFAULT: 'var(--border-default, rgba(255, 255, 255, 0.08))',
          subtle: 'var(--border-default, rgba(255, 255, 255, 0.05))',
          gold: 'var(--border-gold, #e0b45c)'
        },
        state: {
          available: 'var(--state-available, #4a4f74)',
          selected: 'var(--state-selected, #e0b45c)',
          sold: 'var(--state-sold, #33374f)'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Montserrat', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 16px rgba(224, 180, 92, 0.55)',
        'gold-glow-lg': '0 0 24px rgba(224, 180, 92, 0.75)',
        'screen-glow': '0 12px 30px 4px rgba(180, 210, 255, 0.35)',
      }
    },
  },
  plugins: [],
}
