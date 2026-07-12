'use client';

import type { PointerEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { Flame } from 'lucide-react';
import { useRenderMode } from '@/components/providers/capability-provider';
import { SceneErrorBoundary } from '@/components/shared/scene-error-boundary';
import { GlassCard } from '@/components/ui/glass-card';
import type { CharacterProfile } from '@/lib/core/story-schema';
import { cn } from '@/lib/utils';

const MAX_TILT_DEGREES = 12;

function TraitGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            whileHover={{ scale: 1.05 }}
            className="rounded-full border border-border/60 bg-surface-elevated/80 px-3 py-1 text-caption text-foreground backdrop-blur-sm"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function CardBody({ character }: { character: CharacterProfile }) {
  return (
    <div className="relative z-10 flex flex-col gap-6">
      {/* Header with flame icon */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Flame className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-caption font-medium uppercase tracking-wider text-primary">
            Character Profile
          </p>
          <p className="text-caption text-muted-foreground">
            Your story persona
          </p>
        </div>
      </div>

      <div>
        <p className="text-caption font-medium uppercase tracking-wider text-primary">
          Mission
        </p>
        <p className="mt-1 text-body-lg text-foreground">{character.mission}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <TraitGroup label="Strengths" items={character.strengths} />
        <TraitGroup label="Weaknesses" items={character.weaknesses} />
      </div>
      <TraitGroup label="Core values" items={character.coreValues} />
      <div>
        <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
          Motivation
        </p>
        <p className="mt-1 text-body text-muted-foreground">
          {character.motivation}
        </p>
      </div>
    </div>
  );
}

const CARD_CLASSNAME =
  'relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 shadow-elevated sm:p-8';

/** Animated golden thread border that draws on mount */
function ThreadBorder() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="card-thread" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--thread))" stopOpacity="0.6" />
          <stop offset="50%" stopColor="hsl(var(--spark))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--ember))" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <motion.rect
        x="0.5"
        y="0.5"
        width="99"
        height="99"
        rx="2"
        fill="none"
        stroke="url(#card-thread)"
        strokeWidth="0.5"
        initial={prefersReducedMotion ? undefined : { pathLength: 0 }}
        animate={prefersReducedMotion ? undefined : { pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function StaticCard({ character }: { character: CharacterProfile }) {
  return (
    <GlassCard className={cn(CARD_CLASSNAME, 'p-6 sm:p-8')}>
      <ThreadBorder />
      <CardBody character={character} />
    </GlassCard>
  );
}

function TiltCard({ character }: { character: CharacterProfile }) {
  const prefersReducedMotion = useReducedMotion();
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rotateYValue, { stiffness: 200, damping: 20 });
  const glareX = useTransform(
    rotateY,
    [-MAX_TILT_DEGREES, MAX_TILT_DEGREES],
    ['0%', '100%'],
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateYValue.set(relativeX * MAX_TILT_DEGREES * 2);
    rotateXValue.set(-relativeY * MAX_TILT_DEGREES * 2);
  };

  const handlePointerLeave = () => {
    rotateXValue.set(0);
    rotateYValue.set(0);
  };

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn(CARD_CLASSNAME, 'will-change-transform')}
    >
      <ThreadBorder />
      {/* Glare overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: useTransform(
            glareX,
            (value) =>
              `radial-gradient(circle at ${value} 0%, hsl(var(--spark) / 0.25), transparent 60%)`,
          ),
        }}
      />
      {/* Ambient particles */}
      {!prefersReducedMotion
        ? Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-1 rounded-full bg-spark"
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
                boxShadow: '0 0 4px hsl(var(--spark))',
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))
        : null}
      <CardBody character={character} />
    </motion.div>
  );
}

function ErrorPlaceholder() {
  return (
    <div className={cn(CARD_CLASSNAME, 'text-center')}>
      <p className="text-body text-muted-foreground">
        The character visualization couldn&apos;t be displayed.
      </p>
    </div>
  );
}

export function CharacterCard3D({
  character,
}: {
  character: CharacterProfile;
}) {
  const renderMode = useRenderMode(true);

  if (renderMode === '2d-fallback') {
    return <StaticCard character={character} />;
  }

  return (
    <SceneErrorBoundary fallback={<ErrorPlaceholder />}>
      <TiltCard character={character} />
    </SceneErrorBoundary>
  );
}
