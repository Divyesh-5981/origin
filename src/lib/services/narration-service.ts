import "server-only";

import type { NarrationVoice } from "@/types";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const NARRATION_CONTENT_TYPE = "audio/mpeg";
const VOICE_STABILITY = 0.5;
const VOICE_SIMILARITY_BOOST = 0.75;

interface ElevenLabsConfig {
  apiKey: string;
  modelId: string;
  voiceIds: Record<NarrationVoice, string>;
}

export interface NarrationInput {
  voice: NarrationVoice;
  text: string;
}

export type NarrationStreamResult =
  | { ok: true; stream: ReadableStream<Uint8Array>; contentType: string }
  | { ok: false; reason: "unavailable" }
  | { ok: false; reason: "empty-text" }
  | { ok: false; reason: "provider-error"; status: number };

const readConfig = (): ElevenLabsConfig | null => {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const maleVoiceId = process.env.ELEVENLABS_VOICE_ID_MALE?.trim();
  const femaleVoiceId = process.env.ELEVENLABS_VOICE_ID_FEMALE?.trim();

  if (!apiKey || !maleVoiceId || !femaleVoiceId) {
    return null;
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;

  return {
    apiKey,
    modelId,
    voiceIds: { male: maleVoiceId, female: femaleVoiceId },
  };
};

export function isElevenLabsAvailable(): boolean {
  return readConfig() !== null;
}

export async function streamNarration(
  input: NarrationInput,
): Promise<NarrationStreamResult> {
  const config = readConfig();
  if (!config) {
    return { ok: false, reason: "unavailable" };
  }

  const text = input.text.trim();
  if (text.length === 0) {
    return { ok: false, reason: "empty-text" };
  }

  const endpoint = `${ELEVENLABS_API_BASE}/text-to-speech/${config.voiceIds[input.voice]}/stream`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "xi-api-key": config.apiKey,
      "Content-Type": "application/json",
      Accept: NARRATION_CONTENT_TYPE,
    },
    body: JSON.stringify({
      text,
      model_id: config.modelId,
      voice_settings: {
        stability: VOICE_STABILITY,
        similarity_boost: VOICE_SIMILARITY_BOOST,
      },
    }),
  });

  if (!response.ok || response.body === null) {
    return { ok: false, reason: "provider-error", status: response.status };
  }

  return {
    ok: true,
    stream: response.body,
    contentType: NARRATION_CONTENT_TYPE,
  };
}
