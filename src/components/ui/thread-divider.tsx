'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ThreadDividerProps {
  className?: string;
  width?: 'full' | 'fixed';
  sparkNode?: boolean;
}

/**
 * ThreadDivider — animated SVG golden thread with a spark node.
 * The line draws itself left-to-right on scroll into view.
 * Represents the "story thread" motif of the ignition concept.
 */
export function ThreadDivider({
  className,
  width = 'full',
  sparkNode = true,
}: ThreadDividerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'relative',
        width === 'full' ? 'w-full' : 'w-32',
        className,
      )}
      aria-hidden
    >
      <svg
        width="100%"
        height="12"
        viewBox="0 0 200 12"
        fill="none"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="thread-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--thread))" stopOpacity="0" />
            <stop
              offset="50%"
              stopColor="hsl(var(--spark))"
              stopOpacity="0.8"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--thread))"
              stopOpacity="0"
            />
          </linearGradient>
          <filter id="thread-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d="M 0 6 L 200 6"
          stroke="url(#thread-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#thread-glow)"
          initial={prefersReducedMotion ? undefined : { pathLength: 0 }}
          whileInView={prefersReducedMotion ? undefined : { pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        {sparkNode ? (
          <motion.circle
            cx="100"
            cy="6"
            r="3"
            fill="hsl(var(--spark))"
            filter="url(#thread-glow)"
            initial={
              prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }
            }
            whileInView={
              prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }
            }
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.4,
              delay: 0.8,
              ease: 'easeOut',
            }}
          />
        ) : null}
      </svg>
    </div>
  );
}
