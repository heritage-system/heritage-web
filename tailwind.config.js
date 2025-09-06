module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // 👈 thêm dòng này
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
