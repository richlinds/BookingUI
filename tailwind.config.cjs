/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        tag: "var(--color-tag)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
