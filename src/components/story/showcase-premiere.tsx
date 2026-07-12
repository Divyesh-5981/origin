'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { StoryRecord } from '@/lib/services/story-repository';
import type { TimelineStage } from '@/lib/core/story-schema';
import { CharacterCard3D } from '@/components/story/character-card-3d';
import { PosterRenderer } from '@/components/story/poster-renderer';
import { NarrationControls } from '@/components/story/narration-controls';
import { SharePanel } from '@/components/share/share-panel';
import { GlassCard } from '@/components/ui/glass-card';
import { HeroVisual } from '@/components/sections/hero-visual';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Volume2, 
  Share2, 
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcasePremiereProps {
  record: StoryRecord;
  shareUrl: string | null;
  elevenAvailable: boolean;
}

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

// --- HORIZONTAL FILM STRIP TIMELINE FRAME ---
function FilmFrame({ stage, index }: { stage: TimelineStage; index: number }) {
  const sprockets = Array.from({ length: 8 });

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] bg-black/80 border border-white/10 rounded-lg overflow-hidden flex flex-col relative">
      <div className="flex justify-between px-3 py-1 bg-neutral-900 border-b border-white/5">
        {sprockets.map((_, i) => (
          <div key={i} className="w-2.5 h-3 bg-black rounded-sm border border-white/10" />
        ))}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between min-h-[220px]">
        <div>
          <span className="text-[9px] font-mono tracking-widest text-electric-cyan font-bold block mb-1">
            SCENE CELL 0{index + 1}
          </span>
          <h4 className="font-heading text-lg font-medium text-foreground tracking-tight mb-2">
            {stage.title}
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {stage.body}
          </p>
        </div>
      </div>

      <div className="flex justify-between px-3 py-1 bg-neutral-900 border-t border-white/5 mt-auto">
        {sprockets.map((_, i) => (
          <div key={i} className="w-2.5 h-3 bg-black rounded-sm border border-white/10" />
        ))}
      </div>
    </div>
  );
}

export function ShowcasePremiere({
  record,
  shareUrl,
  elevenAvailable,
}: ShowcasePremiereProps) {
  const { story } = record;
  const prefersReducedMotion = useReducedMotion();
  const [showTicket, setShowTicket] = useState(false);

  const stages = orderedTimeline(story.timeline);
  const paragraphs = toParagraphs(story.originStory);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground pb-24 overflow-x-hidden">
      
      {/* 3D background behind entire landing page */}
      <div className="pointer-events-none absolute inset-0 z-0 h-[80vh] lg:h-screen" aria-hidden>
        <HeroVisual />
      </div>

      {/* Overlays for cinematic vignette depth */}
      <div className="pointer-events-none absolute inset-0 z-0 h-[80vh] lg:h-screen bg-film-grain mix-blend-overlay opacity-30" />
      <div className="pointer-events-none absolute inset-0 z-0 h-[80vh] lg:h-screen bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

      {/* TOP HEADER / TITLE CARD */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
          <Film className="size-3.5 text-ignition-orange animate-pulse" />
          <span>A Story of Passion // Premiere Showcase</span>
        </span>
        <h1 className="bg-gradient-to-r from-ignition-orange via-white to-electric-cyan bg-clip-text text-heading-lg text-transparent text-glow sm:text-display font-bold leading-[1.0] mt-4">
          {story.heroTitle}
        </h1>
        <p className="mt-6 text-body-lg text-muted-foreground italic max-w-2xl mx-auto">
          &quot;{story.tagline}&quot;
        </p>
      </section>

      {/* MAIN CONTENT CONTAINERS */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 flex flex-col gap-16">
        
        {/* Section 1: The Screenplay */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="size-5 text-ignition-orange" />
              The Screenplay
            </h3>
            <NarrationControls
              recordId={record.id}
              text={story.originStory}
              trailerScript={story.trailerScript}
              elevenAvailable={elevenAvailable}
            />
          </div>
          <GlassCard className="p-6 sm:p-8">
            <div className="relative z-10 flex flex-col gap-4 text-body text-foreground/90 font-serif leading-relaxed">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Section 2: Chronology Storyboard */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="size-5 text-ignition-orange" />
              Chronology Storyboard
            </h3>
          </div>
          <div className="w-full overflow-x-auto pb-4 flex gap-6 scrollbar-thin scrollbar-thumb-muted">
            {stages.map((stage, index) => (
              <FilmFrame key={stage.key} stage={stage} index={index} />
            ))}
          </div>
        </section>

        {/* Section 3: Cast & Poster (Side by side on desktop) */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Cast Dossier */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <User className="size-5 text-ignition-orange" />
                Subject Dossier
              </h3>
            </div>
            <CharacterCard3D character={story.character} />
          </div>

          {/* Film Poster */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ImageIcon className="size-5 text-ignition-orange" />
                Visual One-Sheet
              </h3>
            </div>
            <PosterRenderer spec={story.poster} />
          </div>
        </section>

        {/* Section 4: Trailer dialogue script */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Volume2 className="size-5 text-ignition-orange" />
              The Dialogue
            </h3>
          </div>
          <GlassCard className="p-6 sm:p-8">
            <div className="relative z-10">
              <span className="font-heading text-4xl text-ignition-orange/20 block -mb-2" aria-hidden>&ldquo;</span>
              <blockquote className="border-l-2 border-ignition-orange pl-6">
                <p className="font-heading text-lg font-medium text-foreground leading-relaxed italic">
                  {story.quote}
                </p>
              </blockquote>
            </div>
          </GlassCard>
          <div className="rounded-lg border border-white/5 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-electric-cyan mb-2">
              Official Trailer Script
            </p>
            <p className="whitespace-pre-line text-sm text-foreground/80 leading-relaxed font-mono">
              {story.trailerScript}
            </p>
          </div>
        </section>

      </div>

      {/* FLOATING ACTION SHARE TICKET BUTTON */}
      <button
        onClick={() => setShowTicket(true)}
        className="fixed bottom-6 right-6 z-40 group inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-white/95 px-6 py-4 text-xs font-bold text-black uppercase transition-all duration-100 ease-out transform-gpu hover:scale-105 shadow-glow-cyan"
      >
        <Share2 className="size-4 text-black shrink-0" />
        Share Ticket
      </button>

      {/* FLOATING GLASS TICKET DIALOG MODAL */}
      <AnimatePresence>
        {showTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicket(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Ticket Dialog Box */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted rounded-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowTicket(false)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-colors focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>

              <SharePanel
                shareUrl={shareUrl}
                storyText={story.originStory}
                poster={story.poster}
                heroTitle={story.heroTitle}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
