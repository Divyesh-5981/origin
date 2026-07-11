"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SceneLoadingProps {
  className?: string;
  label?: string;
}

const ORB_GRADIENT: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, hsl(var(--gradient-start) / 0.7), hsl(var(--gradient-end) / 0.35) 55%, transparent 75%)",
};

export function SceneLoading({
  className,
  label = "Loading scene",
}: SceneLoadingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "relative flex h-full min-h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-sunken",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="h-28 w-28 rounded-full blur-2xl"
        style={ORB_GRADIENT}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.4, 0.85, 0.4], scale: [0.9, 1.08, 0.9] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
