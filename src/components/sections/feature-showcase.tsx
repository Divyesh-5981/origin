'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Film, Mic, Share2, User, Clock, Image, Sparkles } from 'lucide-react';

interface Feature {
  icon: typeof Film;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Film,
    title: 'The Opening Sequence',
    description: 'A cinematic hero narrative that introduces your journey with blockbuster flair.',
  },
  {
    icon: Clock,
    title: 'Interactive Timeline',
    description: 'Trace your origin from the initial spark to your defining breakthrough.',
  },
  {
    icon: User,
    title: 'Hero Dossier',
    description: 'A sleek, holographic cast profile revealing your strengths and core mission.',
  },
  {
    icon: Image,
    title: 'Movie Poster',
    description: "An ultra-premium, downloadable poster starring you as the protagonist.",
  },
  {
    icon: Mic,
    title: 'Voice Narration',
    description: 'Experience your story through dramatic, synthesized voice commentary.',
  },
  {
    icon: Share2,
    title: 'World Premiere',
    description: 'Launch your interactive origin site to fans and friends via a shareable link.',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeatureShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="features-heading"
      className="relative mx-auto w-full max-w-6xl px-4 py-32 sm:px-6"
    >
      <div className="mb-20 flex flex-col items-center text-center">
        <motion.div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles className="size-3.5 text-ignition-orange" />
          <span>The Experience</span>
        </motion.div>
        <motion.h2
          id="features-heading"
          className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Everything a Legend Needs
        </motion.h2>
      </div>

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
              className="h-full group"
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white/30 hover:shadow-glow-orange">
                {/* Glow behind icon */}
                <div className="absolute top-8 left-8 size-12 bg-ignition-orange/20 blur-2xl rounded-full transition-opacity opacity-0 group-hover:opacity-100" />
                
                <div className="relative mb-6 flex size-12 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-muted-foreground transition-colors group-hover:text-ignition-orange group-hover:border-ignition-orange/50">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
