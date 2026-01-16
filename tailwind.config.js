/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './types.ts',
    './constants.ts',
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: '#1a103c',
          panel: '#2d1b69',
          accent: '#ffd700',
          danger: '#ff4444',
          success: '#00cc66',
        },
      },
      fontFamily: {
        display: ['Righteous', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
