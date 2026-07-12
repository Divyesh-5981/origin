'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Film, Mic, Share2, User, Clock, Image } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { GlassCard } from '@/components/ui/glass-card';

interface Feature {
  icon: typeof Film;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Film,
    title: 'Cinematic Story',
    description:
      'A hero narrative written like the opening sequence of a movie.',
  },
  {
    icon: Clock,
    title: 'Interactive Timeline',
    description:
      'Your journey from origin to dream, visualized as a golden thread.',
  },
  {
    icon: User,
    title: 'Character Profile',
    description:
      'A 3D tilt card revealing your strengths, weaknesses, and mission.',
  },
  {
    icon: Image,
    title: 'Movie Poster',
    description: "A downloadable poster with your story's theme and title.",
  },
  {
    icon: Mic,
    title: 'Voice Narration',
    description: 'Hear your story read aloud with cinematic voice synthesis.',
  },
  {
    icon: Share2,
    title: 'Shareable Link',
    description:
      'Send your origin story to anyone with a public link and QR code.',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function FeatureShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6"
    >
      <SectionHeading
        id="features-heading"
        eyebrow="What you get"
        title="A story worth sharing"
        align="center"
        className="mb-16"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (index % 3) * 0.1 }}
            >
              <GlassCard className="h-full p-6">
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="font-heading text-subheading text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-caption text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
