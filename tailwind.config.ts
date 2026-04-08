import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nepal: {
          crimson: "#C41E3A",
          "crimson-dark": "#9B1830",
          "crimson-light": "#E8425A",
          gold: "#D4A574",
          "gold-light": "#F0D9B5",
          "gold-dark": "#B8864A",
          forest: "#2D6A4F",
          "forest-light": "#40916C",
          mountain: "#1E3A5F",
          "mountain-light": "#2D5F8A",
          earth: "#8B6914",
          sand: "#FFFBF5",
          warm: "#FFF8F0",
          slate: "#3D3D3D",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "mandala-pattern":
          "radial-gradient(circle at center, rgba(196,30,58,0.05) 0%, transparent 70%)",
        "mountain-gradient":
          "linear-gradient(135deg, #1E3A5F 0%, #2D6A4F 50%, #C41E3A 100%)",
        "warm-gradient":
          "linear-gradient(180deg, #FFFBF5 0%, #FFF8F0 100%)",
      },
      boxShadow: {
        nepal: "0 4px 20px rgba(196, 30, 58, 0.08)",
        "nepal-lg": "0 8px 40px rgba(196, 30, 58, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
