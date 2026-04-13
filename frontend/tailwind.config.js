/**@type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**\/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:   '#0a0a0a',
        smoke: '#f6f5f3',
        ash:   '#e8e5e0',
        mist:  '#c8c3bb',
        stone: '#7a7268',
        gold:  '#b8975a',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};