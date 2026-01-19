import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-bg-start": "var(--card-bg-start)",
        "card-bg-end": "var(--card-bg-end)",
        "card-border": "var(--card-border)",
        "neon-green": "var(--neon-green)",
        "neon-green-dark": "var(--neon-green-dark)",
        "neon-green-glow": "var(--neon-green-glow)",
        "text-muted": "var(--text-muted)",
        "text-dim": "var(--text-dim)",
      },
      borderRadius: {
        "card": "16px",
        "button": "14px",
      },
      boxShadow: {
        "neon": "0 0 10px rgba(139, 255, 0, 0.3), 0 0 20px rgba(139, 255, 0, 0.2)",
        "neon-hover": "0 0 15px rgba(139, 255, 0, 0.5), 0 0 30px rgba(139, 255, 0, 0.4), 0 0 45px rgba(139, 255, 0, 0.3)",
        "card": "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)",
      },
      transitionDuration: {
        "250": "250ms",
        "300": "300ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
