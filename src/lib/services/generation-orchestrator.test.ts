import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Answers } from "@/types";
import type { Story } from "@/lib/core/story-schema";

vi.mock("server-only", () => ({}));

const mockGenerateStory = vi.fn();
const mockRepairStory = vi.fn();
const mockInsertStoryRecord = vi.fn();

vi.mock("@/lib/services/gemini-service", () => {
  class GeminiServiceError extends Error {
    readonly kind: "rate-limit" | "request";
    constructor(kind: "rate-limit" | "request", message: string) {
      super(message);
      this.name = "GeminiServiceError";
      this.kind = kind;
    }
  }
  return {
    GeminiServiceError,
    generateStory: mockGenerateStory,
    repairStory: mockRepairStory,
    isGeminiConfigured: () => true,
    isRateLimitError: (error: unknown): boolean =>
      error instanceof GeminiServiceError && error.kind === "rate-limit",
  };
});

vi.mock("@/lib/services/story-repository", () => ({
  insertStoryRecord: mockInsertStoryRecord,
}));

vi.mock("@/lib/services/heuristic-engine", () => ({
  generateHeuristicStory: vi.fn(() => VALID_STORY),
}));

type OrchestratorModule = typeof import("./generation-orchestrator");

async function loadOrchestrator(): Promise<OrchestratorModule> {
  vi.resetModules();
  return import("./generation-orchestrator");
}

function makeWords(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

const VALID_ANSWERS: Answers = {
  name: "Ada",
  profession: "Engineer",
  passion: "programming",
  originMoment: "The first program that ran.",
  lowestPoint: "A project that collapsed.",
  turningPoint: "A mentor who believed.",
  dream: "To build something lasting.",
  oneSentence: "A builder at heart.",
};

const VALID_STORY: Story = {
  heroTitle: "The Architect of Logic",
  tagline: "Every line a legacy.",
  originStory: makeWords(1200),
  timeline: [
    { key: "beginning", title: "Spark", body: "It began." },
    { key: "failure", title: "Fall", body: "It broke." },
    { key: "breakthrough", title: "Rise", body: "It clicked." },
    { key: "today", title: "Now", body: "It endures." },
    { key: "future", title: "Next", body: "It grows." },
  ],
  character: {
    mission: "Build tools that empower.",
    strengths: ["resilience"],
    weaknesses: ["impatience"],
    motivation: "Craft.",
    coreValues: ["honesty"],
  },
  quote: "Code is thought made durable.",
  trailerScript: "Fade in on a glowing terminal.",
  social: {
    linkedin: "A builder's journey.",
    twitterThread: ["It started with one program."],
    instagram: "From spark to system.",
    portfolioBio: "Engineer and storyteller.",
    resumeSummary: "Builds lasting software.",
  },
  poster: {
    theme: "cinematic",
    background: "deep space",
    title: "ORIGIN",
    subtitle: "A builder's tale",
    primaryColor: "#0ea5e9",
    secondaryColor: "#7c3aed",
    accent: "#f59e0b",
    layout: "Centered",
    decorations: ["stars"],
  },
  inferredContent: [],
};

describe("generation-orchestrator runGeneration", () => {
  beforeEach(() => {
    mockGenerateStory.mockReset();
    mockRepairStory.mockReset();
    mockInsertStoryRecord.mockReset();
  });

  it("persists and returns the record on the success path", async () => {
    mockGenerateStory.mockResolvedValue(VALID_STORY);
    mockInsertStoryRecord.mockResolvedValue({ id: "rec-1", slug: "hero-slug" });
    const { runGeneration } = await loadOrchestrator();

    const result = await runGeneration({ answers: VALID_ANSWERS, userApiKey: "test-key" });

    expect(result).toEqual({
      kind: "success",
      record: { id: "rec-1", slug: "hero-slug" },
    });
    expect(mockInsertStoryRecord).toHaveBeenCalledTimes(1);
    expect(mockInsertStoryRecord).toHaveBeenCalledWith(
      expect.objectContaining({ story: VALID_STORY, ownerId: null }),
    );
  });

  it("passes the owner id through to persistence", async () => {
    mockGenerateStory.mockResolvedValue(VALID_STORY);
    mockInsertStoryRecord.mockResolvedValue({ id: "rec-2", slug: "owned" });
    const { runGeneration } = await loadOrchestrator();

    await runGeneration({ answers: VALID_ANSWERS, ownerId: "user-123", userApiKey: "test-key" });

    expect(mockInsertStoryRecord).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "user-123" }),
    );
  });

  it("refuses hateful input without calling Gemini or persisting", async () => {
    const { runGeneration } = await loadOrchestrator();
    const result = await runGeneration({
      answers: { ...VALID_ANSWERS, dream: "to commit genocide" },
    });

    expect(result).toEqual({
      kind: "refusal",
      category: "hate",
      message: expect.any(String),
    });
    expect(mockGenerateStory).not.toHaveBeenCalled();
    expect(mockInsertStoryRecord).not.toHaveBeenCalled();
  });

  it("uses the heuristic engine when no userApiKey is provided", async () => {
    mockInsertStoryRecord.mockResolvedValue({ id: "rec-heuristic", slug: "heuristic-slug" });
    const { runGeneration } = await loadOrchestrator();

    const result = await runGeneration({ answers: VALID_ANSWERS });

    expect(result).toEqual({
      kind: "success",
      record: { id: "rec-heuristic", slug: "heuristic-slug" },
    });
    expect(mockGenerateStory).not.toHaveBeenCalled();
    expect(mockInsertStoryRecord).toHaveBeenCalledTimes(1);
  });

  it("returns an error and never persists when attempts are exhausted", async () => {
    mockGenerateStory.mockResolvedValue({});
    mockRepairStory.mockResolvedValue({});
    const { runGeneration } = await loadOrchestrator();

    const result = await runGeneration({ answers: VALID_ANSWERS, userApiKey: "test-key" });

    expect(result.kind).toBe("error");
    expect(mockInsertStoryRecord).not.toHaveBeenCalled();
    expect(
      mockGenerateStory.mock.calls.length + mockRepairStory.mock.calls.length,
    ).toBe(3);
  });

  it("repairs invalid output before succeeding", async () => {
    mockGenerateStory.mockResolvedValue({ heroTitle: "incomplete" });
    mockRepairStory.mockResolvedValue(VALID_STORY);
    mockInsertStoryRecord.mockResolvedValue({ id: "rec-3", slug: "repaired" });
    const { runGeneration } = await loadOrchestrator();

    const result = await runGeneration({ answers: VALID_ANSWERS, userApiKey: "test-key" });

    expect(result).toEqual({
      kind: "success",
      record: { id: "rec-3", slug: "repaired" },
    });
    expect(mockGenerateStory).toHaveBeenCalledTimes(1);
    expect(mockRepairStory).toHaveBeenCalledTimes(1);
  });
});
