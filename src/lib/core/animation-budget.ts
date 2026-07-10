import { BASE_ANIMATION_BUDGET } from "@/config";

const MIN_BUDGET = 0;

export interface AnimationBudgetInput {
  requested: number;
  reducedMotion: boolean;
}

export function resolveAnimationBudget(input: AnimationBudgetInput): number {
  const { requested, reducedMotion } = input;
  if (reducedMotion) {
    return MIN_BUDGET;
  }
  const floored = Number.isFinite(requested) ? requested : MIN_BUDGET;
  const clamped = Math.max(MIN_BUDGET, floored);
  return Math.min(clamped, BASE_ANIMATION_BUDGET);
}
