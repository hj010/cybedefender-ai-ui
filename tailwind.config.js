/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card': {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 47.4% 11.2%)',
        },
      },
    },
  },
  plugins: [],
}