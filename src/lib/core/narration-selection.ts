import type { Provider } from "@/types";

export interface NarrationSelectionInput {
  elevenAvailable: boolean;
  webSpeechAvailable: boolean;
  userForcedWebSpeech: boolean;
}

export function selectProvider(input: NarrationSelectionInput): Provider {
  if (input.userForcedWebSpeech && input.webSpeechAvailable) {
    return "webspeech";
  }
  if (input.elevenAvailable) {
    return "elevenlabs";
  }
  if (input.webSpeechAvailable) {
    return "webspeech";
  }
  return "none";
}
