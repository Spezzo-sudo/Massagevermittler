import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9fb',
          100: '#d6edf3',
          200: '#aedbe8',
          300: '#7cc3d9',
          400: '#47a5c7',
          500: '#2b89ac',
          600: '#206e8c',
          700: '#1c5972',
          800: '#16465a',
          900: '#113545'
        }
      }
    }
  },
  plugins: []
};

export default config;
