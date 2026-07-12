'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { HeroVisual } from '@/components/sections/hero-visual';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export function HeroLanding() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <HeroVisual />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-glow"
        aria-hidden
      />
      <motion.section
        className="relative mx-auto flex max-w-3xl flex-col items-center text-center"
        variants={containerVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
      >
        <motion.span
          className="mb-6 rounded-full border border-border bg-surface-elevated/80 px-4 py-1.5 text-caption font-medium text-muted-foreground backdrop-blur"
          variants={itemVariants}
        >
          Every passion has a beginning
        </motion.span>
        <motion.h1
          className="bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent text-glow-spark sm:text-display md:text-display-lg"
          variants={titleVariants}
        >
          Origin
        </motion.h1>
        <motion.p
          className="mt-6 max-w-xl text-balance text-body-lg text-muted-foreground"
          variants={itemVariants}
        >
          Turn a few personal answers into a cinematic, interactive origin story
          you can share like the opening scene of a movie.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          variants={itemVariants}
        >
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-ignition transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Begin Journey
          </Link>
        </motion.div>
      </motion.section>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.5 }
            : { opacity: [0, 0.6, 0], y: [0, 8, 0] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }
        }
      >
        <ChevronDown className="size-6 text-muted-foreground" />
      </motion.div>
    </main>
  );
}
