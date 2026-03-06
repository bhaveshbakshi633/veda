import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        risk: {
          red: "#DC2626",
          "red-light": "#FEF2F2",
          amber: "#B45309",
          "amber-light": "#FFFBEB",
          green: "#15803D",
          "green-light": "#F0FDF4",
        },
        ayurv: {
          primary: "#1E3A2F",
          secondary: "#2D5A3F",
          accent: "#4A7C5C",
          muted: "#6B7280",
          bg: "#FAFAF8",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
