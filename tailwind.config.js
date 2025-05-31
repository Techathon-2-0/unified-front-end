const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--palette-primary-main)',
      },
      fontFamily: {
        sans: ['Georama_SemiExpanded-Regular', ...fontFamily.sans],
        georama: ['Georama_SemiExpanded-Regular', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
