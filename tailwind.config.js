// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        loader: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        loader: "loader 1.5s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
