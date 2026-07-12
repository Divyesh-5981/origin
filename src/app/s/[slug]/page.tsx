import { notFound } from 'next/navigation';
import { getStoryRecordBySlug } from '@/lib/services/story-repository';
import { isElevenLabsAvailable } from '@/lib/services/narration-service';
import { createShareUrl } from '@/lib/services/share-service';
import { HeroVisual } from '@/components/sections/hero-visual';
import { SharePanel } from '@/components/share/share-panel';
import { StorySections } from '@/components/story/story-sections';

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const record = await getStoryRecordBySlug(slug);

  if (record === null) {
    notFound();
  }

  const shareUrl = createShareUrl({ id: record.id, slug: record.slug });

  return (
    <main className="flex flex-1 flex-col bg-background pb-24">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <HeroVisual />
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
          aria-hidden
        />
        <h1 className="bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent text-glow-spark sm:text-display">
          {record.story.heroTitle}
        </h1>
        <p className="mt-4 max-w-xl text-balance text-body-lg text-muted-foreground">
          {record.story.tagline}
        </p>
      </section>

      <div className="px-4 py-12 sm:px-6">
        <SharePanel
          shareUrl={shareUrl}
          storyText={record.story.originStory}
          poster={record.story.poster}
          heroTitle={record.story.heroTitle}
        />
      </div>

      <StorySections
        record={record}
        elevenAvailable={isElevenLabsAvailable()}
        showHero={false}
      />
    </main>
  );
}
