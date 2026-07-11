"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SavedStory {
  id: string;
  slug: string;
  heroTitle: string;
  createdAt: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StoryList({ stories }: { stories: SavedStory[] }) {
  const [items, setItems] = useState(stories);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setPendingId(id);
    try {
      const response = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (response.ok) {
        setItems((previous) => previous.filter((story) => story.id !== id));
      }
    } finally {
      setPendingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-body text-muted-foreground">
        You haven&apos;t saved any stories yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((story) => (
        <li
          key={story.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col">
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
            {pendingId === story.id ? "Deleting…" : "Delete"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
