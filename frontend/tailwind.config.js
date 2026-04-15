/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        axys: {
          bg: '#0a0a0a',
          card: '#141414',
          field: '#202020',
          muted: '#737373',
          line: '#2a2a2a',
        },
      },
      boxShadow: {
        card: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
      },
    },
  },
  plugins: [],
};
