import type { Answers } from "@/types";

export type InputVerdict =
  | { kind: "ok" }
  | { kind: "needs-followup"; reason: "single-word" }
  | { kind: "needs-text"; reason: "emoji-only" };

export interface ContradictionFlag {
  fields: (keyof Answers)[];
  reason: string;
}

const SINGLE_TOKEN_COUNT = 1;

const MIN_CONTRADICTION_FIELDS = 2;

const WHITESPACE = /\s+/gu;

const EMOJI_SEQUENCE = new RegExp(
  "(?:" +
  "[0-9#*]\\uFE0F?\\u20E3" +
  "|" +
  "\\p{Regional_Indicator}\\p{Regional_Indicator}" +
  "|" +
  "\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})*" +
  "(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})*)*" +
  ")",
  "gu",
);

const CONTRADICTION_FIELDS: (keyof Answers)[] = [
  "passion",
  "originMoment",
  "lowestPoint",
  "turningPoint",
  "dream",
  "oneSentence",
];

export function isEffectivelyEmpty(raw: string): boolean {
  return raw.trim().length === 0;
}

function isSingleWord(trimmed: string): boolean {
  return trimmed.split(WHITESPACE).length === SINGLE_TOKEN_COUNT;
}

function isEmojiOnly(trimmed: string): boolean {
  const compact = trimmed.replace(WHITESPACE, "");
  if (compact.length === 0) {
    return false;
  }
  let matched = false;
  const residual = compact.replace(EMOJI_SEQUENCE, () => {
    matched = true;
    return "";
  });
  return matched && residual.length === 0;
}

export function classifyAnswer(raw: string): InputVerdict {
  if (isEffectivelyEmpty(raw)) {
    return { kind: "ok" };
  }
  const trimmed = raw.trim();
  if (isEmojiOnly(trimmed)) {
    return { kind: "needs-text", reason: "emoji-only" };
  }
  if (isSingleWord(trimmed)) {
    return { kind: "needs-followup", reason: "single-word" };
  }
  return { kind: "ok" };
}

function normalizeForComparison(value: string): string {
  return value.trim().replace(WHITESPACE, " ").toLowerCase();
}

export function detectContradictions(answers: Answers): ContradictionFlag[] {
  const groups = new Map<string, (keyof Answers)[]>();
  for (const field of CONTRADICTION_FIELDS) {
    const value = answers[field];
    if (typeof value !== "string" || isEffectivelyEmpty(value)) {
      continue;
    }
    const normalized = normalizeForComparison(value);
    const existing = groups.get(normalized) ?? [];
    existing.push(field);
    groups.set(normalized, existing);
  }
  const flags: ContradictionFlag[] = [];
  for (const fields of groups.values()) {
    if (fields.length >= MIN_CONTRADICTION_FIELDS) {
      flags.push({
        fields,
        reason: "Multiple answers share identical content.",
      });
    }
  }
  return flags;
}
