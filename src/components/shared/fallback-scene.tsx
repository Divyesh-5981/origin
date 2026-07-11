"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FallbackVariant = "landing" | "character" | "share";

interface FallbackSceneProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
  variant?: FallbackVariant;
}

const VARIANT_GRADIENT: Record<FallbackVariant, string> = {
  landing:
    "radial-gradient(120% 120% at 20% 20%, hsl(var(--gradient-start) / 0.55), transparent 60%), radial-gradient(120% 120% at 80% 30%, hsl(var(--gradient-mid) / 0.45), transparent 55%), radial-gradient(140% 140% at 50% 100%, hsl(var(--gradient-end) / 0.5), transparent 60%)",
  character:
    "radial-gradient(120% 120% at 50% 15%, hsl(var(--accent) / 0.5), transparent 60%), radial-gradient(120% 120% at 20% 90%, hsl(var(--gradient-start) / 0.4), transparent 60%)",
  share:
    "radial-gradient(130% 130% at 80% 10%, hsl(var(--gradient-end) / 0.55), transparent 60%), radial-gradient(120% 120% at 10% 80%, hsl(var(--gradient-mid) / 0.45), transparent 60%)",
};

const ORB_TRANSITION: Transition = {
  duration: 9,
  repeat: Infinity,
  repeatType: "mirror",
  ease: "easeInOut",
};

const orbStyle = (gradient: string): CSSProperties => ({
  backgroundImage: gradient,
});

export function FallbackScene({
  title,
  subtitle,
  className,
  children,
  variant = "landing",
}: FallbackSceneProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative isolate flex min-h-96 w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-sunken",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={orbStyle(VARIANT_GRADIENT[variant])}
      />
      <motion.div
        aria-hidden
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full blur-3xl"
        style={orbStyle(
          "radial-gradient(circle, hsl(var(--glow) / 0.55), transparent 70%)",
        )}
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 40, 0], y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }
        }
        transition={prefersReducedMotion ? undefined : ORB_TRANSITION}
      />
      <motion.div
        aria-hidden
        className="absolute -right-16 bottom-0 h-80 w-80 rounded-full blur-3xl"
        style={orbStyle(
          "radial-gradient(circle, hsl(var(--accent) / 0.45), transparent 70%)",
        )}
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, -30, 0], y: [0, 20, 0], opacity: [0.45, 0.75, 0.45] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { ...ORB_TRANSITION, duration: 11 }
        }
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-4 px-6 py-16 text-center">
        {title ? (
          <h2 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
