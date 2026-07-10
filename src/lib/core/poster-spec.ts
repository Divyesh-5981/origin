import type { PosterSpec } from "@/types";

export const POSTER_DEFAULTS: PosterSpec = {
  theme: "Cinematic Origin",
  background: "hsl(240 32% 8%)",
  title: "An Origin Story",
  subtitle: "Every legend begins somewhere",
  primaryColor: "hsl(275 82% 62%)",
  secondaryColor: "hsl(199 89% 58%)",
  accent: "hsl(43 96% 62%)",
  layout: "Centered",
  decorations: ["film-grain", "vignette", "starfield"],
};

export function withPosterDefaults(spec: Partial<PosterSpec>): PosterSpec {
  return {
    theme: spec.theme ?? POSTER_DEFAULTS.theme,
    background: spec.background ?? POSTER_DEFAULTS.background,
    title: spec.title ?? POSTER_DEFAULTS.title,
    subtitle: spec.subtitle ?? POSTER_DEFAULTS.subtitle,
    primaryColor: spec.primaryColor ?? POSTER_DEFAULTS.primaryColor,
    secondaryColor: spec.secondaryColor ?? POSTER_DEFAULTS.secondaryColor,
    accent: spec.accent ?? POSTER_DEFAULTS.accent,
    layout: spec.layout ?? POSTER_DEFAULTS.layout,
    decorations: spec.decorations ?? POSTER_DEFAULTS.decorations,
  };
}
