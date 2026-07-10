import type { Answers, Draft } from "@/types";

export type DecodeResult = { ok: true; draft: Draft } | { ok: false };

const ANSWER_KEYS: readonly (keyof Answers)[] = [
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

const DECODE_FAILURE: DecodeResult = { ok: false };

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeAnswers(value: unknown): Partial<Answers> | null {
  if (!isPlainRecord(value)) {
    return null;
  }
  const answers: Partial<Answers> = {};
  for (const key of ANSWER_KEYS) {
    if (!(key in value)) {
      continue;
    }
    const field = value[key];
    if (typeof field !== "string") {
      return null;
    }
    answers[key] = field;
  }
  return answers;
}

export function encodeDraft(draft: Draft): string {
  return JSON.stringify(draft);
}

export function decodeDraft(raw: string): DecodeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return DECODE_FAILURE;
  }
  if (!isPlainRecord(parsed)) {
    return DECODE_FAILURE;
  }
  const { activeStep, updatedAt, answers } = parsed;
  if (typeof activeStep !== "number" || !Number.isInteger(activeStep)) {
    return DECODE_FAILURE;
  }
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt)) {
    return DECODE_FAILURE;
  }
  const decodedAnswers = decodeAnswers(answers);
  if (decodedAnswers === null) {
    return DECODE_FAILURE;
  }
  return {
    ok: true,
    draft: {
      answers: decodedAnswers,
      activeStep,
      updatedAt,
    },
  };
}
