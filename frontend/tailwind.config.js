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
        background: '#0B0A14',
        surface: {
          DEFAULT: '#120F24',
          elevated: '#1A1633',
          hover: '#231E44',
          subtle: '#0E0C1B'
        },
        obsidian: {
          950: '#07060D',
          900: '#0B0A14',
          800: '#120F24',
          700: '#1A1633',
          600: '#231E44'
        },
        gold: {
          DEFAULT: '#E5A93C',
          bright: '#FFD066',
          light: '#FFE29A',
          dark: '#B37D22'
        },
        primary: {
          DEFAULT: '#E5A93C',
          hover: '#FFD066',
          active: '#FFE29A',
          light: '#FFE29A',
          dark: '#B37D22',
        },
        accent: {
          DEFAULT: '#FFD066',
          hover: '#FFE29A',
          gold: '#E5A93C'
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A5A1BE',
          muted: '#6E688E'
        },
        border: {
          DEFAULT: 'rgba(229, 169, 60, 0.3)',
          subtle: 'rgba(229, 169, 60, 0.15)',
          hover: '#FFD066'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Cinzel', 'Plus Jakarta Sans', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(229, 169, 60, 0.4)',
        'gold-glow-lg': '0 0 25px rgba(229, 169, 60, 0.6)',
        'screen-glow': '0 12px 30px 4px rgba(180, 210, 255, 0.45)',
      }
    },
  },
  plugins: [],
}
