/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#08111f',
          900: '#0f172a',
          800: '#172554',
          700: '#1e3a8a',
        },
        accent: {
          500: '#22c55e',
          400: '#4ade80',
          300: '#86efac',
        },
      },
      boxShadow: {
        panel: '0 18px 60px rgba(8, 15, 30, 0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
