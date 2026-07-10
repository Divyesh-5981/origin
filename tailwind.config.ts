import type { Config } from "tailwindcss";

const sansFallback = [
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif",
];

const monoFallback = [
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "Monaco",
  "Consolas",
  "Liberation Mono",
  "Courier New",
  "monospace",
];

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", ...sansFallback],
        heading: ["var(--font-heading)", ...sansFallback],
        mono: ["var(--font-mono)", ...monoFallback],
      },
      fontSize: {
        caption: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }],
        body: ["1rem", { lineHeight: "1.65rem" }],
        "body-lg": ["1.125rem", { lineHeight: "1.8rem" }],
        subheading: ["1.375rem", { lineHeight: "1.9rem", letterSpacing: "-0.01em" }],
        heading: ["2rem", { lineHeight: "2.35rem", letterSpacing: "-0.02em" }],
        "heading-lg": ["2.75rem", { lineHeight: "3rem", letterSpacing: "-0.02em" }],
        display: ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["5rem", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
      },
      backgroundImage: {
        "gradient-cinematic":
          "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)) 100%)",
        "gradient-glow":
          "radial-gradient(60% 60% at 50% 0%, hsl(var(--glow) / 0.28) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px hsl(var(--glow) / 0.55)",
        "glow-lg": "0 0 80px -12px hsl(var(--glow) / 0.65)",
        elevated: "0 24px 60px -24px hsl(252 60% 4% / 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
