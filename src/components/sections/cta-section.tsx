'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ThreadDivider } from '@/components/ui/thread-divider';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-32 text-center sm:px-6"
    >
      {/* Ambient ignition glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
        aria-hidden
      />

      {/* Floating ember particles */}
      {!prefersReducedMotion
        ? Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-1 rounded-full bg-spark"
              style={{
                left: `${20 + i * 12}%`,
                bottom: '20%',
                boxShadow: '0 0 8px hsl(var(--spark))',
              }}
              animate={{
                y: [0, -80, -160],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              }}
            />
          ))
        : null}

      <motion.div
        variants={containerVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="flex flex-col items-center"
      >
        <motion.p
          className="text-caption font-medium uppercase tracking-wider text-primary"
          variants={itemVariants}
        >
          Your story awaits
        </motion.p>
        <motion.h2
          id="cta-heading"
          className="mt-2 bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent text-glow-spark sm:text-display"
          variants={itemVariants}
        >
          Ignite your origin
        </motion.h2>
        <ThreadDivider className="mt-4" width="fixed" />
        <motion.p
          className="mt-6 max-w-lg text-balance text-body-lg text-muted-foreground"
          variants={itemVariants}
        >
          Every passion has a beginning. Tell yours like a movie — and share it
          with the world.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-10">
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 font-heading text-body-lg font-semibold text-primary-foreground shadow-ignition-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Begin Your Journey
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
