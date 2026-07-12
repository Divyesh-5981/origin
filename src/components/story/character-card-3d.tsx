'use client';

import type { PointerEvent } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { Sparkles, Star, Zap, Shield, Heart } from 'lucide-react';
import { useRenderMode } from '@/components/providers/capability-provider';
import { SceneErrorBoundary } from '@/components/shared/scene-error-boundary';
import type { CharacterProfile } from '@/lib/core/story-schema';
import { cn } from '@/lib/utils';

const MAX_TILT_DEGREES = 12;

function StatRow({ label, items, icon: Icon, colorClass }: { label: string; items: string[], icon: any, colorClass: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 border-b border-white/5 pb-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3.5", colorClass)} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <span
            key={index}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-foreground border border-white/10"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CardBody({ character }: { character: CharacterProfile }) {
  return (
    <div className="relative z-10 flex h-full flex-col p-6">
      {/* Header - Cinematic Cast Style */}
      <div className="flex flex-col border-b border-white/10 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-electric-cyan mb-1">
          Subject File // Origin Profile
        </span>
        <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          {character.mission || "The Protagonist"}
        </h3>
      </div>

      {/* Abstract Holographic HUD area */}
      <div className="my-4 h-32 w-full rounded-lg border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden relative">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15)_0%,transparent_70%)]" />
         <div className="absolute inset-0 bg-film-grain mix-blend-overlay opacity-50" />
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-electric-cyan/20" />
         <div className="absolute top-0 left-1/2 w-[1px] h-full bg-electric-cyan/20" />
         <Sparkles className="size-8 text-electric-cyan opacity-80" />
      </div>

      {/* Stats Grid */}
      <div className="flex flex-col gap-3 flex-1">
        <StatRow label="Core Strengths" items={character.strengths} icon={Zap} colorClass="text-ignition-orange" />
        <StatRow label="Vulnerabilities" items={character.weaknesses} icon={Shield} colorClass="text-electric-cyan" />
        <StatRow label="Guiding Values" items={character.coreValues} icon={Heart} colorClass="text-white" />
      </div>

      {/* Motivation Footer */}
      <div className="mt-4 rounded-lg bg-ignition-orange/10 p-3 border border-ignition-orange/20">
        <p className="text-[9px] font-bold uppercase tracking-widest text-ignition-orange mb-1">
          Primary Motivation
        </p>
        <p className="text-xs font-medium text-foreground/90 italic">
          &quot;{character.motivation}&quot;
        </p>
      </div>
    </div>
  );
}

const CARD_CLASSNAME =
  'relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl transition-transform duration-300';

function CinematicCard({ character }: { character: CharacterProfile }) {
  const prefersReducedMotion = useReducedMotion();
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  
  const rotateX = useSpring(rotateXValue, { stiffness: 200, damping: 40 });
  const rotateY = useSpring(rotateYValue, { stiffness: 200, damping: 40 });
  
  const glareX = useTransform(rotateY, [-MAX_TILT_DEGREES, MAX_TILT_DEGREES], ['0%', '100%']);
  const glareY = useTransform(rotateX, [-MAX_TILT_DEGREES, MAX_TILT_DEGREES], ['100%', '0%']);
  
  const filmOpacity = useTransform(
    rotateYValue,
    [-MAX_TILT_DEGREES, 0, MAX_TILT_DEGREES],
    [0.7, 0.2, 0.7]
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateYValue.set(relativeX * MAX_TILT_DEGREES * 2);
    rotateXValue.set(-relativeY * MAX_TILT_DEGREES * 2);
  };

  const handlePointerLeave = () => {
    if (prefersReducedMotion) return;
    rotateXValue.set(0);
    rotateYValue.set(0);
  };

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(CARD_CLASSNAME, 'will-change-transform group')}
    >
      {/* Cinematic Film Grain & Glare overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-screen transition-opacity duration-300"
        style={{
          opacity: prefersReducedMotion ? 0 : filmOpacity,
          background: useTransform(
            () =>
              `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(0,240,255,0.15), rgba(255,69,0,0.1) 40%, transparent 70%)`
          ),
        }}
      />
      
      {/* Base film grain texture */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-30" />

      {/* Edge lighting effect */}
      <div className="pointer-events-none absolute inset-0 z-30 rounded-2xl border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />

      <CardBody character={character} />
    </motion.div>
  );
}

function ErrorPlaceholder() {
  return (
    <div className={cn(CARD_CLASSNAME, 'flex min-h-[400px] items-center justify-center p-8 text-center')}>
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
        Profile Data Unavailable
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
    return (
      <div className={cn(CARD_CLASSNAME)}>
        <CardBody character={character} />
      </div>
    );
  }

  return (
    <SceneErrorBoundary fallback={<ErrorPlaceholder />}>
      <CinematicCard character={character} />
    </SceneErrorBoundary>
  );
}
