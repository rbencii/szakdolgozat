/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%': { bottom: '0%', left: '0%', transform: 'scale(1)' },
          '25%': { left: '-50%', transform: 'scale(1.2)' },
          '50%': { left: '50%', transform: 'scale(1.5)' },
          '100%': { bottom: '100%', left: '-50%', transform: 'scale(1)' },
        }
      },
      animation: {
        'float': 'float 4s ease-in-out normal forwards',
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}