import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F1A",
        surface: "#0B0F1A",
        "surface-dim": "#0B0F1A",
        "surface-container": "#121826",
        "surface-container-low": "#0F1422",
        "surface-container-high": "#1A2233",
        "surface-container-highest": "#263047",
        "surface-container-lowest": "#070A12",
        "outline-variant": "#263047",
        outline: "#859397",
        
        // Brand Primary (Cyan)
        primary: {
          DEFAULT: "#22D3EE",
          container: "#22D3EE",
          light: "#8AEBFF",
          dark: "#005763",
          foreground: "#0B0F1A",
        },

        // Gamification Accent (Amber - ONLY FOR XP & STREAK)
        amber: {
          DEFAULT: "#F59E0B",
          500: "#F59E0B",
          400: "#FBBF24",
          600: "#D97706",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          container: "#EE9800",
        },

        // Affirmative / Correct
        tertiary: {
          DEFAULT: "#34D399",
          container: "#3DD99E",
          pulse: "#61F6B9",
        },

        // Critical / Missed
        critical: {
          DEFAULT: "#F87171",
          container: "#93000A",
          coral: "#F87171",
        },

        // Text typography
        "on-surface": "#F1F5F9",
        "on-surface-variant": "#94A3B8",
      },
      fontFamily: {
        headline: ["var(--font-sora)", "Sora", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        full: "9999px",
      },
      boxShadow: {
        cyan: "0 0 20px -4px rgba(34, 211, 238, 0.25)",
        "cyan-subtle": "0 0 12px -2px rgba(34, 211, 238, 0.15)",
        amber: "0 0 20px -4px rgba(245, 158, 11, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
