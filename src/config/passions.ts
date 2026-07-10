export const PASSION_OPTIONS = [
  "Programming",
  "Photography",
  "Football",
  "Music",
  "Writing",
  "Gaming",
  "Cooking",
  "Art & Design",
  "Fitness",
  "Travel",
  "Filmmaking",
  "Entrepreneurship",
] as const;

export type PredefinedPassion = (typeof PASSION_OPTIONS)[number];
