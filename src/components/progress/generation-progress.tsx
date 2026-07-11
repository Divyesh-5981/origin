"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { requestGeneration } from "@/lib/api/generate-client";
import { clearStoredDraft } from "@/components/generator/use-draft-persistence";
import { useGeneratorStore } from "@/lib/stores/generator-store";
import { Button } from "@/components/ui/button";
import type { Answers } from "@/types";

const PROGRESS_MESSAGES = [
  "Gathering your story threads",
  "Finding the cinematic angle",
  "Composing your origin",
  "Rendering the final cut",
];

const MESSAGE_INTERVAL_MS = 2200;

function ProgressOrb({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="size-28 rounded-full bg-gradient-cinematic shadow-glow-lg"
      animate={
        reduced ? undefined : { scale: [0.92, 1.06, 0.92], opacity: [0.7, 1, 0.7] }
      }
      transition={
        reduced
          ? undefined
          : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}

export function GenerationProgress() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const answers = useGeneratorStore((state) => state.answers);

  const [navigationFailed, setNavigationFailed] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const startedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (input: { requestId: string; answers: Answers }) =>
      requestGeneration(input),
    onSuccess: (outcome) => {
      if (outcome.status !== "success") {
        return;
      }
      clearStoredDraft();
      setRecordId(outcome.recordId);
      try {
        router.push(`/story/${outcome.recordId}`);
      } catch {
        setNavigationFailed(true);
      }
    },
  });

  const { mutate, isPending, data } = mutation;

  const startGeneration = useCallback(() => {
    if (answers === null) {
      return;
    }
    setNavigationFailed(false);
    mutate({ requestId: crypto.randomUUID(), answers });
  }, [answers, mutate]);

  useEffect(() => {
    if (answers === null) {
      router.replace("/create");
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    startGeneration();
  }, [answers, router, startGeneration]);

  const isWorking = isPending || data?.status === "duplicate";

  useEffect(() => {
    if (!isWorking || prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % PROGRESS_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [isWorking, prefersReducedMotion]);

  if (data?.status === "refused") {
    return (
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <ShieldAlert className="size-12 text-destructive" aria-hidden />
        <h1 className="font-heading text-heading text-foreground">
          We can&apos;t tell this story
        </h1>
        <p className="text-body text-muted-foreground">{data.message}</p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-heading text-body font-semibold text-card-foreground hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Edit your answers
        </Link>
      </div>
    );
  }

  if (data?.status === "success") {
    return (
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <ProgressOrb reduced={prefersReducedMotion} />
        <h1 className="font-heading text-heading text-foreground">
          Your story is ready
        </h1>
        <p className="text-body text-muted-foreground">
          {navigationFailed
            ? "We couldn't open it automatically. Use the link below."
            : "Taking you to your origin story."}
        </p>
        {recordId ? (
          <Link
            href={`/story/${recordId}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continue to your story
          </Link>
        ) : null}
      </div>
    );
  }

  if (data?.status === "error") {
    return (
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <AlertTriangle className="size-12 text-destructive" aria-hidden />
        <h1 className="font-heading text-heading text-foreground">
          Generation stalled
        </h1>
        <p className="text-body text-muted-foreground">{data.message}</p>
        <Button onClick={startGeneration} disabled={isPending}>
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex max-w-md flex-col items-center gap-6 text-center"
      role="status"
      aria-live="polite"
      aria-busy={isWorking}
    >
      <ProgressOrb reduced={prefersReducedMotion} />
      <h1 className="font-heading text-heading text-foreground">
        Crafting your origin story
      </h1>
      <p className="text-body text-muted-foreground">
        {prefersReducedMotion
          ? "Generating your story. This can take a moment."
          : PROGRESS_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
