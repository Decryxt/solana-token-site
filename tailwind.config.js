/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'], // keep if you want to still use Poppins somewhere
      },
      colors: {
        bgDark: '#0B0E11',
      },
    },
  },
  plugins: [],
}

