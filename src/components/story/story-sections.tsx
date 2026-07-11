import Link from "next/link";
import type { ReactNode } from "react";
import type { StoryRecord } from "@/lib/services/story-repository";
import type { Story, TimelineStage } from "@/lib/core/story-schema";
import { CharacterCard3D } from "@/components/story/character-card-3d";
import { PosterRenderer } from "@/components/story/poster-renderer";
import { NarrationControls } from "@/components/story/narration-controls";

const TIMELINE_ORDER: TimelineStage["key"][] = [
  "beginning",
  "failure",
  "breakthrough",
  "today",
  "future",
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
      <p className="mb-2 text-caption font-medium uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mb-8 font-heading text-heading text-foreground"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function HeroSection({ story }: { story: Story }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-glow"
        aria-hidden
      />
      <h1
        id="hero-heading"
        className="bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent sm:text-display"
      >
        {story.heroTitle}
      </h1>
      <p className="mt-6 max-w-xl text-balance text-body-lg text-muted-foreground">
        {story.tagline}
      </p>
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
      <div className="flex flex-col gap-4 text-body text-foreground/90">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
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
  const stages = orderedTimeline(story.timeline);
  return (
    <Section id="timeline" eyebrow="The journey" title="Your timeline">
      <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
        {stages.map((stage) => (
          <li key={stage.key} className="relative">
            <span
              className="absolute left-[-1.9rem] top-1 size-3 rounded-full bg-primary shadow-glow"
              aria-hidden
            />
            <h3 className="font-heading text-subheading text-foreground">
              {stage.title}
            </h3>
            <p className="mt-2 text-body text-muted-foreground">{stage.body}</p>
          </li>
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
      <blockquote className="border-l-4 border-primary pl-6">
        <p className="font-heading text-subheading text-foreground">
          &ldquo;{story.quote}&rdquo;
        </p>
      </blockquote>
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
      <div className="flex flex-col gap-6">
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
    </Section>
  );
}

function ShareSection({ slug }: { slug: string }) {
  return (
    <Section id="share" eyebrow="Share it" title="Send your story into the world">
      <p className="text-body text-muted-foreground">
        Your story lives at a public link anyone can open.
      </p>
      <Link
        href={`/s/${slug}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
