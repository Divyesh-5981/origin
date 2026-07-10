import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isElevenLabsAvailable, streamNarration } from "./narration-service";

const ENV_KEYS = [
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID_MALE",
  "ELEVENLABS_VOICE_ID_FEMALE",
  "ELEVENLABS_MODEL_ID",
] as const;

const clearEnv = (): void => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
};

const setFullConfig = (): void => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID_MALE = "voice-male";
  process.env.ELEVENLABS_VOICE_ID_FEMALE = "voice-female";
};

describe("narration-service availability", () => {
  beforeEach(clearEnv);
  afterEach(clearEnv);

  it("reports unavailable when the API key is missing", () => {
    process.env.ELEVENLABS_VOICE_ID_MALE = "voice-male";
    process.env.ELEVENLABS_VOICE_ID_FEMALE = "voice-female";

    expect(isElevenLabsAvailable()).toBe(false);
  });

  it("reports unavailable when a voice id is missing", () => {
    process.env.ELEVENLABS_API_KEY = "test-key";
    process.env.ELEVENLABS_VOICE_ID_MALE = "voice-male";

    expect(isElevenLabsAvailable()).toBe(false);
  });

  it("reports available when key and both voice ids are present", () => {
    setFullConfig();

    expect(isElevenLabsAvailable()).toBe(true);
  });
});

describe("narration-service streamNarration guards", () => {
  beforeEach(clearEnv);
  afterEach(clearEnv);

  it("returns unavailable when the provider is not configured", async () => {
    const result = await streamNarration({ voice: "male", text: "Hello" });

    expect(result).toEqual({ ok: false, reason: "unavailable" });
  });

  it("returns empty-text for whitespace-only input without calling the provider", async () => {
    setFullConfig();

    const result = await streamNarration({ voice: "female", text: "   \n\t" });

    expect(result).toEqual({ ok: false, reason: "empty-text" });
  });
});
