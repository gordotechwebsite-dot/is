/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#dcceff',
          300: '#c4a8ff',
          400: '#a678ff',
          500: '#8b46ff',
          600: '#7c22f5',
          700: '#6b15e1',
          800: '#5a12bd',
          900: '#4a109a',
          950: '#2d0668',
        },
        brand: {
          purple: '#6B21A8',
          'purple-dark': '#4C1D95',
          'purple-light': '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
