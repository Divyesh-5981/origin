import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { isClerkConfigured } from '@/lib/auth/clerk-config';
import { listStoriesForUser } from '@/lib/services/story-repository';
import { StoryList, type SavedStory } from '@/components/stories/story-list';
import { GlassCard } from '@/components/ui/glass-card';

function MessagePanel({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className="font-heading text-heading text-foreground">{title}</h1>
        <p className="text-body text-muted-foreground">{body}</p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-ignition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Create a story
        </Link>
      </div>
    </GlassCard>
  );
}

export default async function StoriesPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="relative flex flex-1 items-center justify-center bg-background px-4 py-24 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
          aria-hidden
        />
        <MessagePanel
          title="Accounts aren't set up"
          body="Saving stories to an account requires authentication to be configured. You can still create and share stories as a guest."
        />
      </main>
    );
  }

  const { userId } = await auth();

  if (userId === null) {
    return (
      <main className="relative flex flex-1 items-center justify-center bg-background px-4 py-24 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
          aria-hidden
        />
        <MessagePanel
          title="Sign in to see your stories"
          body="Your saved origin stories will appear here once you're signed in."
        />
      </main>
    );
  }

  const records = await listStoriesForUser(userId);
  const stories: SavedStory[] = records.map((record) => ({
    id: record.id,
    slug: record.slug,
    heroTitle: record.story.heroTitle,
    createdAt: record.createdAt,
  }));

  return (
    <main className="relative mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
        aria-hidden
      />
      <h1 className="mb-8 bg-gradient-to-r from-ignition-orange via-white to-electric-cyan bg-clip-text font-heading text-heading-lg text-transparent text-glow">
        Your stories
      </h1>
      <StoryList stories={stories} />
    </main>
  );
}
