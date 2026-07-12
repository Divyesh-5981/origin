'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { ThreadDivider } from '@/components/ui/thread-divider';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  id?: string;
  className?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const eyebrowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: 0.05 },
  },
};

/**
 * SectionHeading — consistent eyebrow + title + animated thread divider.
 * Animates into view on scroll. Used across all story sections and landing
 * sections for visual consistency.
 */
export function SectionHeading({
  eyebrow,
  title,
  id,
  className,
  align = 'left',
  children,
}: SectionHeadingProps) {
  const prefersReducedMotion = useReducedMotion();
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        isCenter && 'items-center text-center',
        className,
      )}
    >
      <motion.p
        className="text-caption font-medium uppercase tracking-wider text-primary"
        variants={eyebrowVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        id={id}
        className="font-heading text-heading text-foreground"
        variants={titleVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {title}
      </motion.h2>
      <ThreadDivider
        className={cn('mt-2', isCenter && 'mx-auto')}
        width={isCenter ? 'fixed' : 'full'}
      />
      {children}
    </div>
  );
}
