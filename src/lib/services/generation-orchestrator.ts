import "server-only";
import {
  BACKOFF_BASE_MS,
  BACKOFF_CAP_MS,
  MAX_ANSWER_LENGTH,
  MAX_ATTEMPTS,
} from "@/config";
import { screenInput } from "@/lib/core/content-safety";
import {
  prepareForGeneration,
  type NormalizedAnswers,
} from "@/lib/core/answer-normalizer";
import {
  backoffMs,
  nextAction,
  shouldRetryRateLimit,
} from "@/lib/core/generation-policy";
import {
  issuesToRepairHints,
  storyResponseSchema,
  validateStory,
  type Story,
} from "@/lib/core/story-schema";
import {
  GeminiServiceError,
  generateStory,
  isRateLimitError,
  repairStory,
} from "@/lib/services/gemini-service";
import {
  insertStoryRecord,
  type StoryRecordRef,
} from "@/lib/services/story-repository";
import type { Answers, AttemptState } from "@/types";

export interface GenerateStoryInput {
  answers: Answers;
  ownerId?: string | null;
}

export type GenerationResult =
  | { kind: "success"; record: StoryRecordRef }
  | { kind: "refusal"; category: "hate" | "illegal"; message: string }
  | { kind: "error"; message: string };

const GENERATION_FAILED_MESSAGE =
  "We couldn't craft your story after several attempts. Please adjust your answers and try again.";

const SANITIZE_CONSTRAINTS: Record<
  "offensive" | "self-harm" | "copyright",
  string
> = {
  offensive:
    "Do not amplify or reproduce offensive language; keep the narrative respectful and sanitized.",
  "self-harm":
    "Treat any self-harm or suicide themes with care; respond safely without romanticizing or celebrating them.",
  copyright:
    "Produce entirely original content; do not reproduce, imitate, or quote any copyrighted work.",
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function toErrorMessage(error: unknown): string {
  if (error instanceof GeminiServiceError || error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function describeAnswers(answers: Answers): string {
  const country = answers.country?.trim();
  const lines = [
    `Name: ${answers.name}`,
    `Profession: ${answers.profession}`,
    country ? `Country: ${country}` : null,
    `Passion: ${answers.passion}`,
    `Origin moment: ${answers.originMoment}`,
    `Lowest point: ${answers.lowestPoint}`,
    `Turning point: ${answers.turningPoint}`,
    `Dream: ${answers.dream}`,
    `One sentence: ${answers.oneSentence}`,
  ].filter((line): line is string => line !== null);
  return lines.join("\n");
}

function buildStoryPrompt(
  normalized: NormalizedAnswers,
  sanitizeConstraints: readonly string[],
): string {
  const constraints = [
    "The origin story must be between 1000 and 1500 words.",
    "Restrict the narrative strictly to the information the user provided.",
    "List every detail you infer beyond the user's answers in the inferredContent array.",
    ...sanitizeConstraints,
  ];

  if (normalized.needsSummarization.length > 0) {
    constraints.push(
      "Some answers were truncated to a maximum length; treat them as summaries and preserve their intent.",
    );
  }

  if (normalized.needsTranslation.length > 0) {
    constraints.push(
      "Some answers are not written in English; translate them internally before writing and proceed even if translation quality is limited.",
    );
  }

  return [
    "You are Origin, a cinematic biographer that transforms personal answers into a structured, shareable origin story.",
    "Using only the personal details below, produce a story that conforms to the required JSON schema.",
    `Personal details:\n${describeAnswers(normalized.values)}`,
    `Constraints:\n${constraints.map((entry) => `- ${entry}`).join("\n")}`,
  ].join("\n\n");
}

export async function runGeneration(
  input: GenerateStoryInput,
): Promise<GenerationResult> {
  const decision = screenInput(input.answers);

  if (decision.action === "refuse") {
    return {
      kind: "refusal",
      category: decision.category,
      message: decision.message,
    };
  }

  const sanitizeConstraints =
    decision.action === "sanitize"
      ? [SANITIZE_CONSTRAINTS[decision.category]]
      : [];

  const normalized = prepareForGeneration(input.answers, {
    maxAnswerLength: MAX_ANSWER_LENGTH,
  });
  const prompt = buildStoryPrompt(normalized, sanitizeConstraints);
  const ownerId = input.ownerId ?? null;

  let state: AttemptState = {
    attempt: 0,
    maxAttempts: MAX_ATTEMPTS,
    lastOutcome: "none",
    hasValidStory: false,
  };
  let validStory: Story | null = null;
  let repairHints = "";

  for (; ;) {
    const action = nextAction(state);

    if (action === "succeed") {
      if (validStory === null) {
        return { kind: "error", message: GENERATION_FAILED_MESSAGE };
      }
      break;
    }

    if (action === "fail") {
      return { kind: "error", message: GENERATION_FAILED_MESSAGE };
    }

    try {
      const candidate =
        action === "repair"
          ? await repairStory(prompt, repairHints)
          : await generateStory(prompt, storyResponseSchema);

      const result = validateStory(candidate);
      if (result.ok) {
        validStory = result.story;
        state = { ...state, lastOutcome: "valid", hasValidStory: true };
      } else {
        repairHints = issuesToRepairHints(result.issues);
        state = {
          ...state,
          attempt: state.attempt + 1,
          lastOutcome: "invalid",
        };
      }
    } catch (error) {
      if (
        isRateLimitError(error) &&
        shouldRetryRateLimit(state.attempt, state.maxAttempts)
      ) {
        await sleep(backoffMs(state.attempt, BACKOFF_BASE_MS, BACKOFF_CAP_MS));
        state = {
          ...state,
          attempt: state.attempt + 1,
          lastOutcome: "rate-limited",
        };
        continue;
      }
      return { kind: "error", message: toErrorMessage(error) };
    }
  }

  try {
    const record = await insertStoryRecord({
      answers: normalized.values,
      story: validStory,
      ownerId,
    });
    return { kind: "success", record };
  } catch (error) {
    return { kind: "error", message: toErrorMessage(error) };
  }
}
