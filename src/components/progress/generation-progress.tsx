'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
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

function IgnitionLoader() {
  return (
    <div className="relative flex size-28 items-center justify-center">
      {/* Outer ambient glow */}
      <div className="absolute size-28 rounded-full bg-ignition-orange/10 blur-xl animate-pulse" />

      {/* Outer rotating ring — cyan */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-electric-cyan border-r-electric-cyan/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle counter-rotating ring — orange, dashed feel */}
      <motion.div
        className="absolute inset-2 rounded-full border border-transparent border-b-ignition-orange border-l-ignition-orange/40"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner pulsing core */}
      <motion.div
        className="absolute size-8 rounded-full bg-gradient-to-br from-ignition-orange to-electric-cyan"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            '0 0 12px rgba(255,80,0,0.5)',
            '0 0 24px rgba(0,240,255,0.6), 0 0 48px rgba(255,80,0,0.3)',
            '0 0 12px rgba(255,80,0,0.5)',
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting spark 1 */}
      <motion.div
        className="absolute size-1.5 rounded-full bg-electric-cyan shadow-[0_0_6px_rgba(0,240,255,0.8)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50% 56px' }}
      />

      {/* Orbiting spark 2 — opposite side, different speed */}
      <motion.div
        className="absolute size-1.5 rounded-full bg-ignition-orange shadow-[0_0_6px_rgba(255,80,0,0.8)]"
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50% 56px' }}
      />
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
      <div className="p-8 sm:p-10 flex max-w-md flex-col items-center gap-6 text-center border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-2xl relative shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-10 rounded-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <ShieldAlert className="size-12 text-destructive" aria-hidden />
          <h1 className="font-heading text-xl font-bold text-white">
            We can&apos;t tell this story
          </h1>
          <p className="text-sm text-white/70">{data.message}</p>
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-heading text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Edit your answers
          </Link>
        </div>
      </div>
    );
  }

  if (data?.status === 'success') {
    return (
      <div className="p-8 sm:p-10 flex max-w-md flex-col items-center gap-6 text-center border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-2xl relative shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-10 rounded-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <IgnitionLoader />
          <h1 className="font-heading text-xl font-bold text-white">
            Your story is ready
          </h1>
          <p className="text-sm text-white/70">
            {navigationFailed
              ? "We couldn't open it automatically. Use the link below."
              : 'Taking you to your origin story.'}
          </p>
          {recordId ? (
            <Link
              href={`/story/${recordId}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-sm font-semibold text-primary-foreground shadow-ignition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Continue to your story
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  if (data?.status === 'error') {
    return (
      <div className="p-8 sm:p-10 flex max-w-md flex-col items-center gap-6 text-center border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-2xl relative shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-10 rounded-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <AlertTriangle className="size-12 text-destructive" aria-hidden />
          <h1 className="font-heading text-xl font-bold text-white">
            Generation stalled
          </h1>
          <p className="text-sm text-white/70">{data.message}</p>
          <Button
            onClick={startGeneration}
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-ignition"
          >
            <RefreshCw className="size-4 mr-1.5" aria-hidden />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-8 sm:p-10 flex max-w-md flex-col items-center gap-6 text-center border border-white/10 bg-white/[0.02] backdrop-blur-2xl rounded-2xl relative shadow-2xl overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy={isWorking}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-10 rounded-2xl" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <IgnitionLoader />
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
          Crafting your origin story
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={prefersReducedMotion ? 'static' : messageIndex}
            className="text-sm font-medium text-white/70 min-h-[40px] px-2"
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

        {/* Cinematic progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ignition-orange via-electric-cyan to-ignition-orange"
              initial={{ width: '0%' }}
              animate={
                prefersReducedMotion
                  ? { width: '100%' }
                  : { width: ['0%', '100%'] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.3 }
                  : {
                      duration: MESSAGE_INTERVAL_MS / 1000,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/30">
            <span>Rendering</span>
            <span>{prefersReducedMotion ? '' : `${messageIndex + 1} / ${PROGRESS_MESSAGES.length}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
