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
        heading: ["var(--font-body)", ...sansFallback],
      },
      fontSize: {
        caption: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.05em" }],
        body: ["1rem", { lineHeight: "1.65rem" }],
        "body-lg": ["1.125rem", { lineHeight: "1.8rem", letterSpacing: "-0.01em" }],
        subheading: ["1.5rem", { lineHeight: "1.9rem", letterSpacing: "-0.02em" }],
        heading: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "heading-lg": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        display: ["5rem", { lineHeight: "1", letterSpacing: "-0.05em" }],
        "display-lg": ["6.5rem", { lineHeight: "0.95", letterSpacing: "-0.05em" }],
      },
      colors: {
        "obsidian-void": "hsl(var(--obsidian-void))",
        "ignition-orange": "hsl(var(--ignition-orange))",
        "electric-cyan": "hsl(var(--electric-cyan))",
      },
      backgroundImage: {
        "gradient-cinematic":
          "radial-gradient(circle at center, hsl(var(--electric-cyan)/0.1) 0%, transparent 60%), radial-gradient(circle at bottom, hsl(var(--ignition-orange)/0.1) 0%, transparent 60%)",
        "film-grain": "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MDAnIGhlaWdodD0nNDAwJz4KICA8ZmlsdGVyIGlkPSdub2lzZSc+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC44JyBudW1PY3RhdmVzPSczJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI25vaXNlKScgb3BhY2l0eT0nMC4wNScvPgo8L3N2Zz4=')",
      },
      boxShadow: {
        "glow-orange": "0 0 40px -10px hsl(var(--ignition-orange) / 0.5)",
        "glow-cyan": "0 0 40px -10px hsl(var(--electric-cyan) / 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-cinematic": "float 8s ease-in-out infinite",
        "glow-breathe": "glow 4s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px -10px hsl(var(--ignition-orange)/0.4)" },
          "100%": { boxShadow: "0 0 50px 0px hsl(var(--ignition-orange)/0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
