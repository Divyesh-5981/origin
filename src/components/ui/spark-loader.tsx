'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface SparkLoaderProps {
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { spark: 'size-3', ring: 'size-8' },
  md: { spark: 'size-5', ring: 'size-14' },
  lg: { spark: 'size-8', ring: 'size-24' },
} as const;

const RING_DELAYS = [0, 0.4, 0.8];

/**
 * SparkLoader — the unified ignition-themed loader.
 * A golden spark with concentric expanding rings.
 * Used across all loading states for visual consistency.
 */
export function SparkLoader({
  className,
  label = 'Loading',
  size = 'md',
}: SparkLoaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const { spark, ring } = SIZE_MAP[size];

  const sparkStyle: CSSProperties = prefersReducedMotion
    ? {
        background:
          'radial-gradient(circle, hsl(var(--spark)), hsl(var(--ember) / 0.6))',
        boxShadow: '0 0 16px hsl(var(--spark) / 0.5)',
      }
    : {
        background:
          'radial-gradient(circle, hsl(var(--spark)), hsl(var(--ember) / 0.6))',
      };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        'relative flex items-center justify-center',
        ring,
        className,
      )}
    >
      {/* Expanding rings */}
      {prefersReducedMotion
        ? null
        : RING_DELAYS.map((delay, index) => (
            <motion.span
              key={index}
              aria-hidden
              className="absolute rounded-full border border-spark/40"
              style={{ width: '100%', height: '100%' }}
              initial={{ opacity: 0.6, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay,
              }}
            />
          ))}

      {/* Central spark */}
      <motion.div
        aria-hidden
        className={cn('rounded-full', spark)}
        style={sparkStyle}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [0.9, 1.15, 0.9],
                opacity: [0.8, 1, 0.8],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <span className="sr-only">{label}</span>
    </div>
  );
}
