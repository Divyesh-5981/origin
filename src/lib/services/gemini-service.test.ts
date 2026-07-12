import { ApiError } from "@google/genai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storyResponseSchema } from "@/lib/core/story-schema";

vi.mock("server-only", () => ({}));

const generateContentMock = vi.fn();

vi.mock("@google/genai", async () => {
  const actual = await vi.importActual<typeof import("@google/genai")>(
    "@google/genai",
  );
  return {
    ...actual,
    GoogleGenAI: vi.fn(function GoogleGenAIMock() {
      return { models: { generateContent: generateContentMock } };
    }),
  };
});

type ServiceModule = typeof import("./gemini-service");

async function loadService(): Promise<ServiceModule> {
  vi.resetModules();
  return import("./gemini-service");
}

describe("gemini-service", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
  });

  it("parses JSON output from generateStory", async () => {
    generateContentMock.mockResolvedValue({ text: '{"heroTitle":"Origin"}' });
    const { generateStory } = await loadService();

    const candidate = await generateStory("prompt", storyResponseSchema);

    expect(candidate).toEqual({ heroTitle: "Origin" });
  });

  it("sends responseMimeType and responseSchema to Gemini", async () => {
    generateContentMock.mockResolvedValue({ text: "{}" });
    const { generateStory } = await loadService();

    await generateStory("prompt", storyResponseSchema);

    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.5-flash",
        contents: "prompt",
        config: expect.objectContaining({
          responseMimeType: "application/json",
          responseSchema: storyResponseSchema,
        }),
      }),
    );
  });

  it("returns raw text when output is not valid JSON", async () => {
    generateContentMock.mockResolvedValue({ text: "not json" });
    const { generateStory } = await loadService();

    const candidate = await generateStory("prompt", storyResponseSchema);

    expect(candidate).toBe("not json");
  });

  it("distinguishes rate-limit errors for backoff", async () => {
    generateContentMock.mockRejectedValue(
      new ApiError({ message: "quota exceeded", status: 429 }),
    );
    const { generateStory, GeminiServiceError, isRateLimitError } =
      await loadService();

    const error = await generateStory("prompt", storyResponseSchema).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(GeminiServiceError);
    expect(isRateLimitError(error)).toBe(true);
    expect((error as InstanceType<typeof GeminiServiceError>).status).toBe(429);
  });

  it("does not classify non-429 API errors as rate-limit", async () => {
    generateContentMock.mockRejectedValue(
      new ApiError({ message: "bad request", status: 400 }),
    );
    const { generateStory, GeminiServiceError, isRateLimitError } =
      await loadService();

    const error = await generateStory("prompt", storyResponseSchema).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(GeminiServiceError);
    expect(isRateLimitError(error)).toBe(false);
    expect((error as InstanceType<typeof GeminiServiceError>).kind).toBe(
      "request",
    );
  });

  it("throws a request error when no API key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    const { generateStory, isRateLimitError } = await loadService();

    const error = await generateStory("prompt", storyResponseSchema).catch(
      (caught: unknown) => caught,
    );

    expect(isRateLimitError(error)).toBe(false);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it("incorporates repair hints into the repair request", async () => {
    generateContentMock.mockResolvedValue({ text: "{}" });
    const { repairStory } = await loadService();

    await repairStory("base prompt", "- heroTitle: required");

    const call = generateContentMock.mock.calls[0]?.[0] as {
      contents: string;
      config: { responseSchema: unknown };
    };
    expect(call.contents).toContain("base prompt");
    expect(call.contents).toContain("- heroTitle: required");
    expect(call.config.responseSchema).toStrictEqual(storyResponseSchema);
  });
});
