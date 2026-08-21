/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f1410',
          green: '#2f6d3c',
          'light-green': '#e8f3ea',
          cream: '#faf8f3',
          accent: '#d98e3a',
        },
      },
    },
  },
  plugins: [],
}
