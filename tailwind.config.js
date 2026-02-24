/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './constants/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#800020',
        'primary-accent': '#B01E3C', // Color exacto del logo (rojo carmesí)
        neutral: '#ffffff',
        'dark-text': '#000000',
        // Colores del brand para landings (basados en logo #B01E3C)
        brand: {
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbd0d8',
          300: '#f8a8b8',
          400: '#D64464', // Hover claro
          500: '#C73350', // Hover color
          600: '#B01E3C', // Main brand color (logo exacto)
          700: '#8E1830', // Hover oscuro
          800: '#6E1325',
          900: '#800020', // Dark brand color
        },
      },
      fontFamily: {
        sans: ['Roboto', "'Roboto Fallback'", 'sans-serif'],
      },
      animation: {
        glow: 'glow 3s ease-in-out infinite alternate',
        'pulse-strong': 'pulse-strong 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-bob': 'subtle-bob 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out forwards',
        shake: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow:
              '0 0 10px #B01E3C, 0 0 20px #B01E3C, 0 0 30px #B01E3C, 0 4px 20px rgba(176, 30, 60, 0.4)',
            filter: 'brightness(1)',
          },
          '50%': {
            boxShadow:
              '0 0 20px #B01E3C, 0 0 35px #B01E3C, 0 0 50px #B01E3C, 0 4px 30px rgba(176, 30, 60, 0.6)',
            filter: 'brightness(1.1)',
          },
        },
        'pulse-strong': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'subtle-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'accent-glow': '0 0 15px rgba(176, 30, 60, 0.8)',
      },
    },
  },
  plugins: [],
};
