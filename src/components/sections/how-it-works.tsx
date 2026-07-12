'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { SectionHeading } from '@/components/ui/section-heading';
import { ThreadDivider } from '@/components/ui/thread-divider';

interface Stage {
  id: string;
  label: string;
  title: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    id: 'spark',
    label: '01',
    title: 'Spark',
    description:
      'Answer a few questions about your passion. Every story starts with a spark.',
  },
  {
    id: 'ignite',
    label: '02',
    title: 'Ignite',
    description:
      'AI weaves your answers into a cinematic narrative, timeline, and character profile.',
  },
  {
    id: 'weave',
    label: '03',
    title: 'Weave',
    description:
      'Your story takes shape as a movie poster, voice narration, and interactive timeline.',
  },
  {
    id: 'share',
    label: '04',
    title: 'Share',
    description:
      'Send your origin story into the world with a shareable link and QR code.',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * StageIcon — a small animated SVG representing each stage.
 * Each draws on scroll into view.
 */
function StageIcon({ stageId }: { stageId: string }) {
  const prefersReducedMotion = useReducedMotion();

  const drawProps = prefersReducedMotion
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 1, ease: 'easeInOut' as const },
      };

  if (stageId === 'spark') {
    return (
      <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden>
        <defs>
          <filter id="spark-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Question marks converging into a spark */}
        <motion.path
          d="M 20 20 L 32 32 M 44 20 L 32 32 M 20 44 L 32 32 M 44 44 L 32 32"
          stroke="hsl(var(--thread))"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#spark-glow)"
          {...drawProps}
        />
        <motion.circle
          cx="32"
          cy="32"
          r="4"
          fill="hsl(var(--spark))"
          filter="url(#spark-glow)"
          initial={prefersReducedMotion ? undefined : { scale: 0 }}
          whileInView={prefersReducedMotion ? undefined : { scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8, ease: 'easeOut' }}
        />
      </svg>
    );
  }

  if (stageId === 'ignite') {
    return (
      <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden>
        <defs>
          <filter id="ignite-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Burst from center */}
        <motion.path
          d="M 32 32 L 32 12 M 32 32 L 48 20 M 32 32 L 52 32 M 32 32 L 48 44 M 32 32 L 32 52 M 32 32 L 16 44 M 32 32 L 12 32 M 32 32 L 16 20"
          stroke="hsl(var(--ember))"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#ignite-glow)"
          {...drawProps}
        />
        <motion.circle
          cx="32"
          cy="32"
          r="5"
          fill="hsl(var(--spark))"
          filter="url(#ignite-glow)"
          initial={prefersReducedMotion ? undefined : { scale: 0 }}
          whileInView={prefersReducedMotion ? undefined : { scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
        />
      </svg>
    );
  }

  if (stageId === 'weave') {
    return (
      <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden>
        <defs>
          <filter id="weave-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Interwoven threads */}
        <motion.path
          d="M 12 20 Q 32 8 52 20 Q 32 32 12 44 Q 32 56 52 44"
          stroke="hsl(var(--thread))"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#weave-glow)"
          {...drawProps}
        />
        <motion.path
          d="M 12 44 Q 32 32 52 20 M 12 20 Q 32 32 52 44"
          stroke="hsl(var(--spark))"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          filter="url(#weave-glow)"
          {...drawProps}
        />
      </svg>
    );
  }

  // share
  return (
    <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden>
      <defs>
        <filter id="share-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Radiating from center */}
      <motion.circle
        cx="32"
        cy="32"
        r="6"
        stroke="hsl(var(--spark))"
        strokeWidth="1.5"
        fill="none"
        filter="url(#share-glow)"
        {...drawProps}
      />
      <motion.path
        d="M 32 26 L 32 14 M 38 26 L 46 18 M 38 38 L 46 46 M 32 38 L 32 50 M 26 38 L 18 46 M 26 26 L 18 18"
        stroke="hsl(var(--thread))"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter="url(#share-glow)"
        {...drawProps}
      />
    </svg>
  );
}

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6"
    >
      <SectionHeading
        id="how-it-works-heading"
        eyebrow="How it works"
        title="From spark to story"
        align="center"
        className="mb-16"
      />

      {/* Desktop: horizontal flow with connecting thread */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Connecting thread */}
          <svg
            className="absolute left-0 right-0 top-20 w-full"
            height="2"
            viewBox="0 0 1000 2"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="flow-thread" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--thread))"
                  stopOpacity="0"
                />
                <stop
                  offset="50%"
                  stopColor="hsl(var(--spark))"
                  stopOpacity="0.5"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--thread))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <motion.line
              x1="0"
              y1="1"
              x2="1000"
              y2="1"
              stroke="url(#flow-thread)"
              strokeWidth="1.5"
              initial={prefersReducedMotion ? undefined : { pathLength: 0 }}
              whileInView={prefersReducedMotion ? undefined : { pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>

          <div className="relative grid grid-cols-4 gap-6">
            {STAGES.map((stage, index) => (
              <motion.div
                key={stage.id}
                className="flex flex-col items-center text-center"
                variants={cardVariants}
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.15 }}
              >
                <StageIcon stageId={stage.id} />
                <span className="mt-4 text-caption font-medium uppercase tracking-wider text-primary">
                  {stage.label}
                </span>
                <h3 className="mt-1 font-heading text-subheading text-foreground">
                  {stage.title}
                </h3>
                <p className="mt-2 text-caption text-muted-foreground">
                  {stage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-8 md:hidden">
        {STAGES.map((stage, index) => (
          <motion.div
            key={stage.id}
            className="flex flex-col items-center text-center"
            variants={cardVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.1 }}
          >
            <StageIcon stageId={stage.id} />
            <span className="mt-4 text-caption font-medium uppercase tracking-wider text-primary">
              {stage.label}
            </span>
            <h3 className="mt-1 font-heading text-subheading text-foreground">
              {stage.title}
            </h3>
            <p className="mt-2 text-caption text-muted-foreground">
              {stage.description}
            </p>
            {index < STAGES.length - 1 ? (
              <ThreadDivider className="mt-6" width="fixed" />
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
