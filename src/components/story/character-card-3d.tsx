"use client";

import type { PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRenderMode } from "@/components/providers/capability-provider";
import { SceneErrorBoundary } from "@/components/shared/scene-error-boundary";
import type { CharacterProfile } from "@/lib/core/story-schema";
import { cn } from "@/lib/utils";

const MAX_TILT_DEGREES = 12;

function TraitGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-caption text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardBody({ character }: { character: CharacterProfile }) {
  return (
    <div className="flex flex-col gap-6">
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
  "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8";

function StaticCard({ character }: { character: CharacterProfile }) {
  return (
    <div className={CARD_CLASSNAME}>
      <CardBody character={character} />
    </div>
  );
}

function TiltCard({ character }: { character: CharacterProfile }) {
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const rotateX = useSpring(rotateXValue, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rotateYValue, { stiffness: 200, damping: 20 });
  const glareX = useTransform(rotateY, [-MAX_TILT_DEGREES, MAX_TILT_DEGREES], ["0%", "100%"]);

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
      className={cn(CARD_CLASSNAME, "will-change-transform")}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: useTransform(
            glareX,
            (value) =>
              `radial-gradient(circle at ${value} 0%, hsl(var(--glow) / 0.35), transparent 60%)`,
          ),
        }}
      />
      <CardBody character={character} />
    </motion.div>
  );
}

function ErrorPlaceholder() {
  return (
    <div className={cn(CARD_CLASSNAME, "text-center")}>
      <p className="text-body text-muted-foreground">
        The character visualization couldn&apos;t be displayed.
      </p>
    </div>
  );
}

export function CharacterCard3D({ character }: { character: CharacterProfile }) {
  const renderMode = useRenderMode(true);

  if (renderMode === "2d-fallback") {
    return <StaticCard character={character} />;
  }

  return (
    <SceneErrorBoundary fallback={<ErrorPlaceholder />}>
      <TiltCard character={character} />
    </SceneErrorBoundary>
  );
}
