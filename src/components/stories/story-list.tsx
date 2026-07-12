'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export interface SavedStory {
  id: string;
  slug: string;
  heroTitle: string;
  createdAt: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function StoryList({ stories }: { stories: SavedStory[] }) {
  const [items, setItems] = useState(stories);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setPendingId(id);
    try {
      const response = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setItems((previous) => previous.filter((story) => story.id !== id));
      }
    } finally {
      setPendingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="relative z-10 text-body text-muted-foreground">
          You haven&apos;t saved any stories yet.
        </p>
      </GlassCard>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((story) => (
        <motion.li key={story.id} whileHover={{ y: -2 }} className="list-none">
          <GlassCard className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="relative z-10 flex flex-col">
              <Link
                href={`/story/${story.id}`}
                className="font-heading text-subheading text-foreground hover:text-primary focus-visible:outline-none focus-visible:underline"
              >
                {story.heroTitle}
              </Link>
              <span className="text-caption text-muted-foreground">
                {formatDate(story.createdAt)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(story.id)}
              disabled={pendingId === story.id}
              aria-label={`Delete ${story.heroTitle}`}
            >
              <Trash2 className="size-4" aria-hidden />
              {pendingId === story.id ? 'Deleting…' : 'Delete'}
            </Button>
          </GlassCard>
        </motion.li>
      ))}
    </ul>
  );
}
