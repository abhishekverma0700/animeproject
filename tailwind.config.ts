import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F5F3EE",
        surface: "#FFFFFF",
        border: "rgba(17, 17, 17, 0.10)",
        text: "#111111",
        muted: "#6B6B6B",
        accent: "#FF4D00",
        "accent-text": "#C43A00",
        background: "#F5F3EE",
        foreground: "#111111",
      },
      fontFamily: {
        anton: ["var(--font-anton)", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;
