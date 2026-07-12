'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { StoryRecord } from '@/lib/services/story-repository';
import type { Story, TimelineStage } from '@/lib/core/story-schema';
import { CharacterCard3D } from '@/components/story/character-card-3d';
import { PosterRenderer } from '@/components/story/poster-renderer';
import { NarrationControls } from '@/components/story/narration-controls';
import { SectionHeading } from '@/components/ui/section-heading';
import { GlassCard } from '@/components/ui/glass-card';

const TIMELINE_ORDER: TimelineStage['key'][] = [
  'beginning',
  'failure',
  'breakthrough',
  'today',
  'future',
];

function orderedTimeline(timeline: TimelineStage[]): TimelineStage[] {
  const byKey = new Map(timeline.map((stage) => [stage.key, stage]));
  return TIMELINE_ORDER.map((key) => byKey.get(key)).filter(
    (stage): stage is TimelineStage => stage !== undefined,
  );
}

function toParagraphs(text: string): string[] {
  const paragraphs = text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  return paragraphs.length > 0 ? paragraphs : [text.trim()];
}

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const timelineItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mx-auto w-full max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6"
    >
      <SectionHeading
        id={`${id}-heading`}
        eyebrow={eyebrow}
        title={title}
        className="mb-8"
      />
      {children}
    </section>
  );
}

function HeroSection({ story }: { story: Story }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
        aria-hidden
      />
      <motion.div
        variants={heroVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        className="flex flex-col items-center"
      >
        <h1
          id="hero-heading"
          className="bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent text-glow-spark sm:text-display"
        >
          {story.heroTitle}
        </h1>
        <p className="mt-6 max-w-xl text-balance text-body-lg text-muted-foreground">
          {story.tagline}
        </p>
      </motion.div>
    </section>
  );
}

function StorySection({
  story,
  recordId,
  elevenAvailable,
}: {
  story: Story;
  recordId: string;
  elevenAvailable: boolean;
}) {
  const paragraphs = toParagraphs(story.originStory);
  return (
    <Section id="story" eyebrow="The origin" title="Your story">
      <div className="mb-8">
        <NarrationControls
          recordId={recordId}
          text={story.originStory}
          trailerScript={story.trailerScript}
          elevenAvailable={elevenAvailable}
        />
      </div>
      <GlassCard className="p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 text-body text-foreground/90">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </GlassCard>
      {story.inferredContent.length > 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface-elevated px-4 py-3">
          <p className="text-caption font-medium text-foreground">
            Imagined to enrich your story
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-caption text-muted-foreground">
            {story.inferredContent.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

function TimelineSection({ story }: { story: Story }) {
  const prefersReducedMotion = useReducedMotion();
  const stages = orderedTimeline(story.timeline);
  return (
    <Section id="timeline" eyebrow="The journey" title="Your timeline">
      <ol className="relative flex flex-col gap-8">
        {/* Vertical golden thread */}
        <div
          className="absolute bottom-0 left-2 top-2 w-px bg-gradient-thread"
          aria-hidden
        />
        {stages.map((stage, index) => (
          <motion.li
            key={stage.key}
            className="relative pl-8"
            variants={timelineItemVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Spark node */}
            <span
              className="absolute left-0 top-1.5 size-4 rounded-full bg-spark shadow-ignition"
              aria-hidden
            />
            <span
              className="absolute left-0.5 top-2 size-3 animate-ignite rounded-full bg-spark/50"
              aria-hidden
            />
            <h3 className="font-heading text-subheading text-foreground">
              {stage.title}
            </h3>
            <p className="mt-2 text-body text-muted-foreground">{stage.body}</p>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}

function CharacterSection({ story }: { story: Story }) {
  return (
    <Section id="character" eyebrow="The character" title="Who you are">
      <CharacterCard3D character={story.character} />
    </Section>
  );
}

function PosterSection({ story }: { story: Story }) {
  return (
    <Section id="poster" eyebrow="The poster" title="Your movie poster">
      <PosterRenderer spec={story.poster} />
    </Section>
  );
}

function QuotesSection({ story }: { story: Story }) {
  return (
    <Section id="quotes" eyebrow="In your words" title="The quote">
      <GlassCard className="p-6 sm:p-8">
        <div className="relative z-10">
          <span
            className="font-heading text-display text-primary/20"
            aria-hidden
          >
            &ldquo;
          </span>
          <blockquote className="border-l-2 border-primary pl-6">
            <p className="font-heading text-subheading text-foreground">
              {story.quote}
            </p>
          </blockquote>
        </div>
      </GlassCard>
      <div className="mt-8 rounded-lg border border-border bg-surface-elevated px-4 py-4">
        <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
          Trailer script
        </p>
        <p className="mt-2 whitespace-pre-line text-body text-foreground/90">
          {story.trailerScript}
        </p>
      </div>
    </Section>
  );
}

function FutureSection({ story }: { story: Story }) {
  const { social } = story;
  return (
    <Section id="future" eyebrow="What's next" title="Your future">
      <GlassCard className="p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              Portfolio bio
            </p>
            <p className="mt-1 text-body text-foreground/90">
              {social.portfolioBio}
            </p>
          </div>
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              Resume summary
            </p>
            <p className="mt-1 text-body text-foreground/90">
              {social.resumeSummary}
            </p>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function ShareSection({ slug }: { slug: string }) {
  return (
    <Section
      id="share"
      eyebrow="Share it"
      title="Send your story into the world"
    >
      <p className="text-body text-muted-foreground">
        Your story lives at a public link anyone can open.
      </p>
      <Link
        href={`/s/${slug}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-ignition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Open your share page
      </Link>
    </Section>
  );
}

export function StorySections({
  record,
  elevenAvailable,
  showHero = true,
}: {
  record: StoryRecord;
  elevenAvailable: boolean;
  showHero?: boolean;
}) {
  const { story, slug, id } = record;
  return (
    <main className="flex flex-1 flex-col bg-background pb-24">
      {showHero ? <HeroSection story={story} /> : null}
      <StorySection
        story={story}
        recordId={id}
        elevenAvailable={elevenAvailable}
      />
      <TimelineSection story={story} />
      <CharacterSection story={story} />
      <PosterSection story={story} />
      <QuotesSection story={story} />
      <FutureSection story={story} />
      <ShareSection slug={slug} />
    </main>
  );
}
