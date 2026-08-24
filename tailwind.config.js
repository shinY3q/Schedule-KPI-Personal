/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kpi: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9ec',
          300: '#95bee0',
          400: '#5f9dcf',
          500: '#387ebd',
          600: '#2664a3',
          700: '#1e5084',
          800: '#1b446f',
          900: '#1b3b5c',
          950: '#11253d',
        }
      }
    },
  },
  plugins: [],
}
