'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { requestGeneration } from '@/lib/api/generate-client';
import { clearStoredDraft } from '@/components/generator/use-draft-persistence';
import { useGeneratorStore } from '@/lib/stores/generator-store';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import type { Answers } from '@/types';

const PROGRESS_MESSAGES = [
  'Gathering your story threads',
  'Finding the cinematic angle',
  'Composing your origin',
  'Rendering the final cut',
];

const MESSAGE_INTERVAL_MS = 2200;

function IgnitionLoader({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative flex size-40 items-center justify-center">
      {/* Expanding rings */}
      {!reduced
        ? [0, 0.5, 1].map((delay, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-32 rounded-full border border-spark/30"
              initial={{ opacity: 0.6, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay,
              }}
            />
          ))
        : null}

      {/* Central spark */}
      <motion.div
        aria-hidden
        className="size-16 rounded-full"
        style={{
          background:
            'radial-gradient(circle, hsl(var(--spark)), hsl(var(--ember) / 0.6))',
        }}
        animate={
          reduced
            ? undefined
            : {
                scale: [0.85, 1.2, 0.85],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  '0 0 20px hsl(var(--spark) / 0.4)',
                  '0 0 40px hsl(var(--spark) / 0.7), 0 0 80px hsl(var(--ember) / 0.3)',
                  '0 0 20px hsl(var(--spark) / 0.4)',
                ],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {/* Ember particles rising */}
      {!reduced
        ? Array.from({ length: 8 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-1 rounded-full bg-spark"
              style={{
                left: `${40 + (i % 4) * 6}%`,
                bottom: '50%',
                boxShadow: '0 0 4px hsl(var(--spark))',
              }}
              animate={{
                y: [0, -60, -120],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))
        : null}
    </div>
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
      if (outcome.status !== 'success') {
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
    // BYOK key is sent automatically via httpOnly cookie — no client access needed
    mutate({ requestId: crypto.randomUUID(), answers });
  }, [answers, mutate]);

  useEffect(() => {
    if (answers === null) {
      router.replace('/create');
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    startGeneration();
  }, [answers, router, startGeneration]);

  const isWorking = isPending || data?.status === 'duplicate';

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

  if (data?.status === 'refused') {
    return (
      <GlassCard className="flex max-w-md flex-col items-center gap-5 p-8 text-center">
        <div className="relative z-10 flex flex-col items-center gap-5">
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
      </GlassCard>
    );
  }

  if (data?.status === 'success') {
    return (
      <GlassCard className="flex max-w-md flex-col items-center gap-5 p-8 text-center">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <IgnitionLoader reduced={prefersReducedMotion} />
          <h1 className="font-heading text-heading text-foreground">
            Your story is ready
          </h1>
          <p className="text-body text-muted-foreground">
            {navigationFailed
              ? "We couldn't open it automatically. Use the link below."
              : 'Taking you to your origin story.'}
          </p>
          {recordId ? (
            <Link
              href={`/story/${recordId}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-ignition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Continue to your story
            </Link>
          ) : null}
        </div>
      </GlassCard>
    );
  }

  if (data?.status === 'error') {
    return (
      <GlassCard className="flex max-w-md flex-col items-center gap-5 p-8 text-center">
        <div className="relative z-10 flex flex-col items-center gap-5">
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
      </GlassCard>
    );
  }

  return (
    <div
      className="flex max-w-md flex-col items-center gap-6 text-center"
      role="status"
      aria-live="polite"
      aria-busy={isWorking}
    >
      <IgnitionLoader reduced={prefersReducedMotion} />
      <h1 className="font-heading text-heading text-foreground">
        Crafting your origin story
      </h1>
      <AnimatePresence mode="wait">
        <motion.p
          key={prefersReducedMotion ? 'static' : messageIndex}
          className="text-body text-muted-foreground"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {prefersReducedMotion
            ? 'Generating your story. This can take a moment.'
            : PROGRESS_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
