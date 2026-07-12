import { notFound } from 'next/navigation';
import { getStoryRecordBySlug } from '@/lib/services/story-repository';
import { isElevenLabsAvailable } from '@/lib/services/narration-service';
import { createShareUrl } from '@/lib/services/share-service';
import { ShowcasePremiere } from '@/components/story/showcase-premiere';

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
    <ShowcasePremiere
      record={record}
      shareUrl={shareUrl}
      elevenAvailable={isElevenLabsAvailable()}
    />
  );
}
