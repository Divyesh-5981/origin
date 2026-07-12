'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Play } from 'lucide-react';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-40 text-center sm:px-6"
    >
      {/* Cinematic Dust Particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
           {Array.from({ length: 20 }).map((_, i) => {
            // Deterministic pseudo-random values based on index to avoid hydration mismatch
            const leftPct = ((i * 37 + 13) % 100);
            const topPct = 100 + ((i * 7 + 3) % 20);
            const duration = 5 + (i % 5);
            const delay = (i * 0.3) % 3;
            const xDrift = Math.sin(i * 1.7) * 100;
            return (
              <motion.span
                key={i}
                className="absolute size-1.5 rounded-full bg-ignition-orange"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  filter: 'blur(2px)'
                }}
                animate={{
                  y: [0, -800],
                  x: [0, xDrift],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: 'linear',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Cinematic Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-20 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] bg-ignition-orange/10 blur-[120px] rounded-full" aria-hidden />

      <motion.div
        variants={containerVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ignition-orange/30 bg-ignition-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ignition-orange shadow-glow-orange backdrop-blur-md"
          variants={itemVariants}
        >
          <span className="size-2 rounded-full bg-ignition-orange animate-pulse" />
          The Stage Is Set
        </motion.div>
        
        <motion.h2
          id="cta-heading"
          className="mt-2 text-5xl font-medium tracking-tight text-foreground sm:text-7xl"
          variants={itemVariants}
        >
          Write Your Epic
        </motion.h2>
        
        <motion.p
          className="mt-6 max-w-xl text-balance text-lg text-muted-foreground leading-relaxed"
          variants={itemVariants}
        >
          Don't let your passion remain untold. Step into the spotlight and generate a cinematic origin story that commands the screen.
        </motion.p>
        
        <motion.div variants={itemVariants} className="mt-12">
          <Link
            href="/create"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-10 py-5 text-lg font-medium text-black transition-transform duration-100 ease-out transform-gpu hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ignition-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-glow-orange"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play className="size-5 fill-black" />
              Start The Trailer
            </span>
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-ignition-orange to-electric-cyan opacity-0 transition-opacity duration-500 group-hover:opacity-20" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
