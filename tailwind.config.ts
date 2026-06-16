import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1B2B",
          light: "#16273B",
          border: "#22384F",
        },
        sand: {
          DEFAULT: "#F5EFE3",
          dim: "#E8E0D2",
        },
        coral: {
          DEFAULT: "#FF5A36",
          dark: "#E64523",
        },
        turquoise: {
          DEFAULT: "#19C3B0",
          dark: "#0FA597",
        },
        gold: {
          DEFAULT: "#FFC857",
        },
        slate: {
          DEFAULT: "#4B5A6A",
          light: "#8195A8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-data)"],
      },
      borderRadius: {
        ticket: "14px",
      },
      backgroundImage: {
        "ticket-notch":
          "radial-gradient(circle at 0 50%, transparent 9px, var(--notch-bg) 10px), radial-gradient(circle at 100% 50%, transparent 9px, var(--notch-bg) 10px)",
      },
    },
  },
  plugins: [],
};

export default config;
