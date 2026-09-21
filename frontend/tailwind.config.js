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
        background: '#171b34',
        surface: {
          DEFAULT: '#1e2348',
          elevated: '#262b52',
          hover: '#2f3563',
          subtle: '#171b34'
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
          light: '#f6dd9c',
          DEFAULT: '#e0b45c',
          mid: '#e0b45c',
          deep: '#b8862f'
        },
        primary: {
          DEFAULT: '#e0b45c',
          hover: '#f6dd9c',
          active: '#b8862f',
          light: '#f6dd9c',
          dark: '#b8862f',
        },
        accent: {
          DEFAULT: '#7c5cc4',
          purple: '#7c5cc4',
          gold: '#e0b45c'
        },
        text: {
          primary: '#ffffff',
          secondary: '#a8adc9',
          muted: '#6b7094'
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.05)',
          gold: '#e0b45c'
        },
        state: {
          available: '#4a4f74',
          selected: '#e0b45c',
          sold: '#33374f'
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
