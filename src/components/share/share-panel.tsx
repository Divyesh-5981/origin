'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Link2, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  buildSocialShareIntent,
  type SocialTarget,
} from '@/lib/core/share-links';
import { PosterRenderer } from '@/components/story/poster-renderer';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import type { PosterSpec } from '@/types';

interface SharePanelProps {
  shareUrl: string | null;
  storyText: string;
  poster: Partial<PosterSpec>;
  heroTitle: string;
}

const SOCIAL_TARGETS: { target: SocialTarget; label: string }[] = [
  { target: 'twitter', label: 'X / Twitter' },
  { target: 'linkedin', label: 'LinkedIn' },
  { target: 'facebook', label: 'Facebook' },
  { target: 'whatsapp', label: 'WhatsApp' },
];

const COPY_RESET_MS = 2000;

export function SharePanel({
  shareUrl,
  storyText,
  poster,
  heroTitle,
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(storyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  if (shareUrl === null) {
    return (
      <GlassCard className="mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Share2 className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-body text-muted-foreground">
            Sharing is unavailable for this story right now.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="mx-auto flex w-full max-w-md flex-col gap-6 p-6 sm:p-8">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-4">
            <QRCodeSVG value={shareUrl} size={160} />
          </div>
          <p className="text-caption text-muted-foreground">
            Scan to open this story anywhere.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={handleCopyStory}>
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? 'Story copied' : 'Copy story text'}
          </Button>

          <a
            href={shareUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-caption font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Link2 className="size-4" aria-hidden />
            {shareUrl}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
            Share to
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SOCIAL_TARGETS.map(({ target, label }) => (
              <motion.a
                key={target}
                href={buildSocialShareIntent(target, shareUrl, heroTitle)}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 py-2 text-caption font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {label}
              </motion.a>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <PosterRenderer spec={poster} />
        </div>
      </div>
    </GlassCard>
  );
}
