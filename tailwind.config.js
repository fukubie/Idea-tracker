/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      backgroundColor: {
        "theme-light": "#F6CE71",
        "theme-dark": "#C40C0C",
      },
      colors: {
        brand: {
          primary: "#FF6500",
          deep: "#C40C0C",
          soft: "#CC561E",
          highlight: "#F6CE71",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
