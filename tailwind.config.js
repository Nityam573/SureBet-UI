/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ff3649': '#FF3649',
        'ff6977': '#ff6977', // Custom color
      },
    },
  },
  plugins: [],
}