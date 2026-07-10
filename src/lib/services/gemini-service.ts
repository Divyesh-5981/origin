import "server-only";
import { ApiError, GoogleGenAI } from "@google/genai";
import { storyResponseSchema, type GeminiSchema } from "@/lib/core/story-schema";

const GEMINI_MODEL = "gemini-2.5-flash";
const RATE_LIMIT_STATUS = 429;

export type GeminiErrorKind = "rate-limit" | "request";

export class GeminiServiceError extends Error {
  readonly kind: GeminiErrorKind;
  readonly status?: number;

  constructor(kind: GeminiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "GeminiServiceError";
    this.kind = kind;
    this.status = status;
  }
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof GeminiServiceError && error.kind === "rate-limit";
}

let client: GoogleGenAI | null = null;

function resolveApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new GeminiServiceError(
      "request",
      "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.",
    );
  }
  return key;
}

function getClient(): GoogleGenAI {
  if (client === null) {
    client = new GoogleGenAI({ apiKey: resolveApiKey() });
  }
  return client;
}

function toServiceError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) {
    return error;
  }
  if (error instanceof ApiError) {
    const kind: GeminiErrorKind =
      error.status === RATE_LIMIT_STATUS ? "rate-limit" : "request";
    return new GeminiServiceError(kind, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : String(error);
  return new GeminiServiceError("request", message);
}

function parseCandidate(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function requestJson(
  contents: string,
  schema: GeminiSchema,
): Promise<unknown> {
  try {
    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return parseCandidate(response.text ?? "");
  } catch (error) {
    throw toServiceError(error);
  }
}

export function generateStory(
  prompt: string,
  schema: GeminiSchema,
): Promise<unknown> {
  return requestJson(prompt, schema);
}

export function repairStory(prompt: string, hints: string): Promise<unknown> {
  const repairPrompt = `${prompt}

The previous response failed schema validation. Correct the following issues and return the full corrected JSON object that conforms to the required schema:
${hints}`;
  return requestJson(repairPrompt, storyResponseSchema);
}
