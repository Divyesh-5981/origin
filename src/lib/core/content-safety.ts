import type { Answers } from "@/types";

export type SafetyDecision =
  | { action: "allow" }
  | { action: "refuse"; category: "hate" | "illegal"; message: string }
  | { action: "sanitize"; category: "offensive" | "self-harm" | "copyright" };

export const HATE_TOKENS: readonly string[] = [
  "genocide",
  "ethnic cleansing",
  "master race",
  "white power",
  "heil hitler",
  "gas the",
  "kill all",
  "exterminate the",
  "racial purity",
  "final solution",
];

export const ILLEGAL_TOKENS: readonly string[] = [
  "robbed a bank",
  "sold drugs",
  "trafficked drugs",
  "human trafficking",
  "laundered money",
  "money laundering",
  "smuggled weapons",
  "stole cars",
  "committed fraud",
  "ran a cartel",
];

export const SELF_HARM_TOKENS: readonly string[] = [
  "suicide",
  "self-harm",
  "kill myself",
  "end my life",
  "cut myself",
  "take my own life",
];

export const COPYRIGHT_TOKENS: readonly string[] = [
  "harry potter",
  "star wars",
  "star trek",
  "game of thrones",
  "mickey mouse",
  "spider-man",
  "the lord of the rings",
  "lord of the rings",
];

export const OFFENSIVE_TOKENS: readonly string[] = [
  "shit",
  "fuck",
  "bitch",
  "asshole",
  "bastard",
  "dickhead",
  "motherfucker",
];

const WHITESPACE = /\s+/gu;

const REGEXP_METACHARACTERS = /[.*+?^${}()|[\]\\]/gu;

const REFUSAL_MESSAGES: Record<"hate" | "illegal", string> = {
  hate: "We can't create a story that promotes hate or extremist content. Please revise your answers and try again.",
  illegal: "We can't craft a celebratory story around illegal activity. Please revise your answers and try again.",
};

const SCREENED_FIELDS: readonly (keyof Answers)[] = [
  "name",
  "profession",
  "country",
  "passion",
  "originMoment",
  "lowestPoint",
  "turningPoint",
  "dream",
  "oneSentence",
];

function escapeRegExp(token: string): string {
  return token.replace(REGEXP_METACHARACTERS, "\\$&");
}

function compileMatcher(tokens: readonly string[]): RegExp {
  const alternation = tokens.map(escapeRegExp).join("|");
  return new RegExp(`\\b(?:${alternation})\\b`, "u");
}

const HATE_MATCHER = compileMatcher(HATE_TOKENS);
const ILLEGAL_MATCHER = compileMatcher(ILLEGAL_TOKENS);
const SELF_HARM_MATCHER = compileMatcher(SELF_HARM_TOKENS);
const COPYRIGHT_MATCHER = compileMatcher(COPYRIGHT_TOKENS);
const OFFENSIVE_MATCHER = compileMatcher(OFFENSIVE_TOKENS);

function normalize(text: string): string {
  return text.toLowerCase().replace(WHITESPACE, " ").trim();
}

function combinedText(answers: Answers): string {
  return SCREENED_FIELDS.map((field) => answers[field])
    .filter((value): value is string => typeof value === "string")
    .map(normalize)
    .join(" ");
}

export function screenInput(answers: Answers): SafetyDecision {
  const text = combinedText(answers);

  if (HATE_MATCHER.test(text)) {
    return { action: "refuse", category: "hate", message: REFUSAL_MESSAGES.hate };
  }

  if (ILLEGAL_MATCHER.test(text)) {
    return {
      action: "refuse",
      category: "illegal",
      message: REFUSAL_MESSAGES.illegal,
    };
  }

  if (SELF_HARM_MATCHER.test(text)) {
    return { action: "sanitize", category: "self-harm" };
  }

  if (COPYRIGHT_MATCHER.test(text)) {
    return { action: "sanitize", category: "copyright" };
  }

  if (OFFENSIVE_MATCHER.test(text)) {
    return { action: "sanitize", category: "offensive" };
  }

  return { action: "allow" };
}
