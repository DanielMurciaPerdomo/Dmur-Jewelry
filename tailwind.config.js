/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "metallic-gold": {
          50: "#fbf7ea",
          100: "#f6eed5",
          200: "#eddeab",
          300: "#e4cd81",
          400: "#dbbc57",
          500: "#d2ac2d",
          600: "#a88924",
          700: "#7e671b",
          800: "#544512",
          900: "#2a2209",
          950: "#1d1806"
        },
        "ocean-mist": {
          50: "#edf7f4",
          100: "#dbf0ea",
          200: "#b8e0d4",
          300: "#94d1bf",
          400: "#70c2a9",
          500: "#4db394",
          600: "#3d8f76",
          700: "#2e6b59",
          800: "#1f473b",
          900: "#0f241e",
          950: "#0b1915"
        }
      }
    }
  },
  plugins: []
};
