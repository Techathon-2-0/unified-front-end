const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: 'class', // This enables the 'dark:' variant
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: 'var(--palette-primary-main)',
      },

    },
    fontFamily: {
      sans: ['Georama_SemiExpanded-Regular', ...fontFamily.sans],
      georama: ['Georama_SemiExpanded-Regular'],
    },
  },
  plugins: [require("tailwindcss-animate")],
}
