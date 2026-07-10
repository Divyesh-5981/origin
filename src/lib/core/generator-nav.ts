import type { Answers } from "@/types";
import { isEffectivelyEmpty } from "./input-classifier";

export type StepType =
  | "basic"
  | "passion"
  | "origin-moment"
  | "lowest-point"
  | "turning-point"
  | "dream"
  | "one-sentence";

export const STEP_TYPES: readonly StepType[] = [
  "basic",
  "passion",
  "origin-moment",
  "lowest-point",
  "turning-point",
  "dream",
  "one-sentence",
] as const;

const STEP_COUNT = STEP_TYPES.length;
const FIRST_STEP = 0;
const LAST_STEP = STEP_COUNT - 1;

const REQUIRED_FIELDS: readonly (keyof Answers)[] = [
  "name",
  "profession",
  "passion",
  "originMoment",
  "lowestPoint",
  "turningPoint",
  "dream",
  "oneSentence",
] as const;

function clampStep(step: number): number {
  if (step < FIRST_STEP) {
    return FIRST_STEP;
  }
  if (step > LAST_STEP) {
    return LAST_STEP;
  }
  return step;
}

export function advance(step: number): number {
  const current = clampStep(step);
  if (current === LAST_STEP) {
    return current;
  }
  return current + 1;
}

export function back(step: number): number {
  const current = clampStep(step);
  if (current === FIRST_STEP) {
    return FIRST_STEP;
  }
  return current - 1;
}

export function activeStepType(step: number): StepType {
  return STEP_TYPES[clampStep(step)];
}

export function acceptCustomPassion(text: string): string {
  if (isEffectivelyEmpty(text)) {
    return "";
  }
  return text;
}

export function canGenerate(answers: Answers): boolean {
  return REQUIRED_FIELDS.every((field) => {
    const value = answers[field];
    return typeof value === "string" && !isEffectivelyEmpty(value);
  });
}
