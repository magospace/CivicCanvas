import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        civic: {
          50: "#f6f8fb",
          100: "#e8eef6",
          500: "#2b6b7f",
          700: "#17445a",
          900: "#102b3a"
        },
        signal: "#c9862d",
        mint: "#5aa085"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(16, 43, 58, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
