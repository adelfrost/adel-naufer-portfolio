/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Lexend Tera"', 'sans-serif'],
        zetta: ['"Lexend Zetta"', 'sans-serif'],
        slab: ['"Josefin Slab"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      colors: {
        ink: '#0a0908',
      },
    },
  },
  plugins: [],
};
