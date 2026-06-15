/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#135029',
          light: '#f0fdf4',
        }
      },
      screens: {
        'xs': '400px',
      }
    },
  },
  plugins: [],
}
