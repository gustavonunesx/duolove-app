/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E91E8C',
        'primary-dark': '#8B0051',
        secondary: '#9B59B6',
        surface: '#0D0D0D',
        card: '#1A1A2E',
        'text-primary': '#F5F0EB',
        'text-muted': '#8B8B9E',
      },
      fontFamily: {
        sans: ['PlusJakartaSans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
