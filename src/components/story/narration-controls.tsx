"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Pause, Play } from "lucide-react";
import { selectProvider } from "@/lib/core/narration-selection";
import type { NarrationVoice } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NarrationControlsProps {
  recordId: string;
  text: string;
  trailerScript: string;
  elevenAvailable: boolean;
}

const FEMALE_VOICE_PATTERN = /female|woman|zira|samantha|victoria|susan|karen/i;
const MALE_VOICE_PATTERN = /male|man|david|daniel|alex|george|fred|mark/i;

function pickVoice(
  voices: SpeechSynthesisVoice[],
  gender: NarrationVoice,
): SpeechSynthesisVoice | undefined {
  const english = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );
  const pool = english.length > 0 ? english : voices;
  const pattern = gender === "female" ? FEMALE_VOICE_PATTERN : MALE_VOICE_PATTERN;
  return pool.find((voice) => pattern.test(voice.name)) ?? pool[0];
}

const noopSubscribe = () => () => { };

function getWebSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function useWebSpeechAvailable(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    getWebSpeechAvailable,
    () => false,
  );
}

export function NarrationControls({
  recordId,
  text,
  trailerScript,
  elevenAvailable,
}: NarrationControlsProps) {
  const webSpeechAvailable = useWebSpeechAvailable();
  const [forcedWebSpeech, setForcedWebSpeech] = useState(false);
  const [elevenFailed, setElevenFailed] = useState(false);
  const [voice, setVoice] = useState<NarrationVoice>("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current !== null) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => stopPlayback, [stopPlayback]);

  const provider = selectProvider({
    elevenAvailable: elevenAvailable && !elevenFailed,
    webSpeechAvailable,
    userForcedWebSpeech: forcedWebSpeech,
  });

  const playWebSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selected = pickVoice(window.speechSynthesis.getVoices(), voice);
    if (selected !== undefined) {
      utterance.voice = selected;
    }
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, voice]);

  const playElevenLabs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, voice, text }),
      });
      if (!response.ok) {
        setElevenFailed(true);
        playWebSpeech();
        return;
      }
      const blob = await response.blob();
      if (audioRef.current !== null) {
        audioRef.current.pause();
      }
      if (objectUrlRef.current !== null) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setElevenFailed(true);
      playWebSpeech();
    } finally {
      setIsLoading(false);
    }
  }, [recordId, voice, text, playWebSpeech]);

  const handleToggle = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (provider === "elevenlabs") {
      void playElevenLabs();
    } else if (provider === "webspeech") {
      playWebSpeech();
    }
  };

  const handleVoiceChange = (next: NarrationVoice) => {
    stopPlayback();
    setVoice(next);
  };

  if (provider === "none") {
    return (
      <div className="rounded-lg border border-border bg-surface-elevated px-4 py-4">
        <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
          Trailer script
        </p>
        <p className="mt-2 whitespace-pre-line text-body text-foreground/90">
          {trailerScript}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleToggle} disabled={isLoading}>
          {isPlaying ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {isPlaying ? "Pause" : isLoading ? "Loading…" : "Listen"}
        </Button>

        <div
          className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
          role="group"
          aria-label="Narration voice"
        >
          {(["female", "male"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={voice === option}
              onClick={() => handleVoiceChange(option)}
              className={cn(
                "rounded-full px-3 py-1 text-caption font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                voice === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {webSpeechAvailable ? (
        <label className="flex items-center gap-2 text-caption text-muted-foreground">
          <input
            type="checkbox"
            checked={forcedWebSpeech}
            onChange={(event) => {
              stopPlayback();
              setForcedWebSpeech(event.target.checked);
            }}
            className="size-4 rounded border-border"
          />
          Use my browser&apos;s built-in voice
        </label>
      ) : null}
    </div>
  );
}
