import type { AttemptState } from "@/types";

export type GenerationAction = "call" | "repair" | "succeed" | "fail";

export function nextAction(state: AttemptState): GenerationAction {
  if (state.hasValidStory) {
    return "succeed";
  }

  const attemptsRemain = state.attempt < state.maxAttempts;

  if (!attemptsRemain) {
    return "fail";
  }

  if (state.lastOutcome === "invalid") {
    return "repair";
  }

  return "call";
}

export function shouldRetryRateLimit(attempt: number, max: number): boolean {
  return attempt < max;
}

export function backoffMs(attempt: number, base: number, cap: number): number {
  return Math.min(base * 2 ** attempt, cap);
}
