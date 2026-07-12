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
        "gradient-ignition":
          "radial-gradient(80% 80% at 50% 0%, hsl(var(--ember) / 0.18) 0%, transparent 50%), radial-gradient(60% 60% at 20% 100%, hsl(var(--gradient-start) / 0.15) 0%, transparent 55%), radial-gradient(60% 60% at 80% 100%, hsl(var(--gradient-mid) / 0.12) 0%, transparent 55%)",
        "gradient-thread":
          "linear-gradient(90deg, transparent 0%, hsl(var(--thread) / 0.6) 50%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px hsl(var(--glow) / 0.55)",
        "glow-lg": "0 0 80px -12px hsl(var(--glow) / 0.65)",
        elevated: "0 24px 60px -24px hsl(252 60% 4% / 0.55)",
        ignition:
          "0 0 30px -6px hsl(var(--ember) / 0.5), 0 0 60px -12px hsl(var(--glow) / 0.35)",
        "ignition-lg":
          "0 0 50px -8px hsl(var(--ember) / 0.6), 0 0 100px -20px hsl(var(--glow) / 0.45)",
      },
      colors: {
        spark: "hsl(var(--spark))",
        ember: "hsl(var(--ember))",
        thread: "hsl(var(--thread))",
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        weave: "weave 8s ease-in-out infinite",
        ignite: "ignite 2.4s ease-in-out infinite",
        "ember-rise": "ember-rise 4s ease-out infinite",
        "spark-pulse": "spark-pulse 1.8s ease-in-out infinite",
        "ring-expand": "ring-expand 2s ease-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "25%": { opacity: "0.85", transform: "scale(1.03)" },
          "50%": { opacity: "0.95", transform: "scale(0.98)" },
          "75%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        weave: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(10px) translateY(-5px)" },
          "50%": { transform: "translateX(-5px) translateY(8px)" },
          "75%": { transform: "translateX(-8px) translateY(-3px)" },
        },
        ignite: {
          "0%, 100%": {
            opacity: "0.7",
            transform: "scale(0.95)",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
            filter: "brightness(1.2)",
          },
        },
        "ember-rise": {
          "0%": { opacity: "0", transform: "translateY(0) scale(0.5)" },
          "20%": { opacity: "1" },
          "100%": {
            opacity: "0",
            transform: "translateY(-60px) scale(1.2)",
          },
        },
        "spark-pulse": {
          "0%, 100%": {
            opacity: "0.6",
            boxShadow: "0 0 8px hsl(var(--spark) / 0.4)",
          },
          "50%": {
            opacity: "1",
            boxShadow:
              "0 0 20px hsl(var(--spark) / 0.7), 0 0 40px hsl(var(--ember) / 0.3)",
          },
        },
        "ring-expand": {
          "0%": { opacity: "0.8", transform: "scale(0.6)" },
          "100%": { opacity: "0", transform: "scale(2.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
