'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import type { StoryRecord } from '@/lib/services/story-repository';
import type { Story, TimelineStage } from '@/lib/core/story-schema';
import { CharacterCard3D } from '@/components/story/character-card-3d';
import { PosterRenderer } from '@/components/story/poster-renderer';
import { NarrationControls } from '@/components/story/narration-controls';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { HeroVisual } from '@/components/sections/hero-visual';
import { 
  Film, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Volume2, 
  Share2, 
  Sparkles, 
  Play,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIMELINE_ORDER: TimelineStage['key'][] = [
  'beginning',
  'failure',
  'breakthrough',
  'today',
  'future',
];

type SceneTab = 'story' | 'timeline' | 'character' | 'poster' | 'quotes' | 'premiere';

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

const fadeVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 15 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    filter: "blur(8px)", 
    y: -15, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  }
};

// --- HORIZONTAL FILM STRIP TIMELINE FRAME ---
function FilmFrame({ stage, index }: { stage: TimelineStage; index: number }) {
  // Generate 8 sprocket negative film holes procedurally
  const sprockets = Array.from({ length: 8 });

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] bg-black/80 border border-white/10 rounded-lg overflow-hidden flex flex-col relative">
      {/* Top Film Sprocket holes */}
      <div className="flex justify-between px-3 py-1 bg-neutral-900 border-b border-white/5">
        {sprockets.map((_, i) => (
          <div key={i} className="w-2.5 h-3 bg-black rounded-sm border border-white/10" />
        ))}
      </div>

      {/* Frame content */}
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

      {/* Bottom Film Sprocket holes */}
      <div className="flex justify-between px-3 py-1 bg-neutral-900 border-t border-white/5 mt-auto">
        {sprockets.map((_, i) => (
          <div key={i} className="w-2.5 h-3 bg-black rounded-sm border border-white/10" />
        ))}
      </div>
    </div>
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
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<SceneTab>('story');
  const [showIntro, setShowIntro] = useState(true);

  // Auto-skip intro if reduced motion is enabled
  useEffect(() => {
    if (prefersReducedMotion) {
      setShowIntro(false);
    }
  }, [prefersReducedMotion]);

  const stages = orderedTimeline(story.timeline);
  const paragraphs = toParagraphs(story.originStory);

  // Cinematic opening credits intro
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-center px-4 overflow-hidden">
        {/* Dynamic 3D backdrop rendering behind opening credits */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-25" aria-hidden>
          <HeroVisual />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-film-grain mix-blend-overlay opacity-30" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)]" />

        {/* Load cinematic font styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
          .film-title {
            font-family: 'Cinzel', serif;
            font-weight: 800;
            letter-spacing: 0.15em;
          }
          .film-subtitle {
            font-family: 'Playfair Display', serif;
            font-style: italic;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative z-20 max-w-2xl flex flex-col items-center"
        >
          {/* Eyebrow credits */}
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.4, duration: 1.0 }}
            className="tracking-[0.4em] text-[10px] text-white uppercase mb-6 block font-mono"
          >
            A NARRATIVE SCREENPLAY PREMIERE
          </motion.span>

          {/* Main Cinematic Title */}
          <motion.h1
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="film-title bg-gradient-to-r from-ignition-orange via-white to-electric-cyan bg-clip-text text-heading-lg text-transparent text-glow sm:text-display font-bold leading-tight"
          >
            {story.heroTitle}
          </motion.h1>

          {/* Golden lens flare divider line */}
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-ignition-orange to-transparent"
          />

          {/* Story Tagline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.4, duration: 1.0 }}
            className="film-subtitle mt-6 text-body-lg text-white leading-relaxed max-w-lg"
          >
            &quot;{story.tagline}&quot;
          </motion.p>

          {/* Cinematic Start Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            onClick={() => setShowIntro(false)}
            className="group mt-12 relative overflow-hidden rounded-full border border-white/20 bg-white/5 hover:border-white/40 px-8 py-4 text-xs font-bold text-white tracking-[0.2em] uppercase transition-all duration-300 transform-gpu hover:scale-105 shadow-glow-cyan"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              <Play className="size-3.5 fill-white" />
              Start Screening
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* LEFT COLUMN: DIRECTOR'S CAMERA CONTROLS */}
      <aside className="relative lg:w-[25%] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between shrink-0 z-30">
        <div className="flex flex-col gap-8">
          {/* Header Branding */}
          <div className="flex flex-col border-b border-white/5 pb-4">
            <span className="text-[10px] font-mono tracking-widest text-electric-cyan font-bold uppercase mb-1">
              DIRECTOR MONITOR
            </span>
            <h2 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="size-5 text-ignition-orange" />
              Origin Console
            </h2>
          </div>

          {/* Scene tabs navigation */}
          <nav className="flex flex-col gap-2" aria-label="Scene chapters">
            {(
              [
                { id: 'story', label: 'Scene I: Script', icon: Film },
                { id: 'timeline', label: 'Scene II: Chronology', icon: Calendar },
                { id: 'character', label: 'Scene III: Protagonist', icon: User },
                { id: 'poster', label: 'Scene IV: One-Sheet', icon: ImageIcon },
                { id: 'quotes', label: 'Scene V: Dialogue', icon: Volume2 },
                { id: 'premiere', label: 'Scene VI: Premiere', icon: Share2 },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-xs font-semibold tracking-wider uppercase transition-all duration-150 transform-gpu hover:scale-[1.02] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-white text-black border-white shadow-glow-cyan"
                      : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-ignition-orange" : "text-muted-foreground")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="mt-8 border-t border-white/5 pt-4">
          <Link
            href="/create"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-caption font-bold tracking-widest text-white uppercase transform-gpu duration-100 ease-out hover:scale-105"
          >
            Create Fresh Origin
          </Link>
        </div>
      </aside>

      {/* RIGHT COLUMN: CINEMATIC VIEWPORT */}
      <section className="flex-1 relative min-h-[60vh] lg:min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden z-10">
        {/* 3D background visual mapped behind card viewport */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <HeroVisual />
        </div>

        {/* Film grain and vignette drawing on top of WebGL scene */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-30" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

        {/* Camera guides border */}
        <div className="absolute inset-4 lg:inset-8 border border-white/5 pointer-events-none z-20">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        </div>

        {/* Active Scene Panel rendering viewport */}
        <div className="w-full max-w-3xl relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {/* TAB 1: SCRIPT/STORY */}
              {activeTab === 'story' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Film className="size-5 text-ignition-orange" />
                      The Screenplay
                    </h3>
                    <NarrationControls
                      recordId={id}
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
                  {story.inferredContent.length > 0 && (
                    <div className="rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-electric-cyan mb-2">
                        Imagined Details (Enriched by AI)
                      </p>
                      <ul className="list-disc pl-4 flex flex-col gap-1 text-xs text-muted-foreground">
                        {story.inferredContent.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHRONOLOGY/TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Calendar className="size-5 text-ignition-orange" />
                      Chronology Storyboard
                    </h3>
                  </div>
                  {/* Horizontal Scrollable Film Strip */}
                  <div className="w-full overflow-x-auto pb-4 flex gap-6 scrollbar-thin scrollbar-thumb-muted">
                    {stages.map((stage, index) => (
                      <FilmFrame key={stage.key} stage={stage} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CHARACTER DOSSIER */}
              {activeTab === 'character' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <User className="size-5 text-ignition-orange" />
                      Subject Dossier
                    </h3>
                  </div>
                  <CharacterCard3D character={story.character} />
                </div>
              )}

              {/* TAB 4: MOVIE POSTER */}
              {activeTab === 'poster' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <ImageIcon className="size-5 text-ignition-orange" />
                      Visual One-Sheet
                    </h3>
                  </div>
                  <PosterRenderer spec={story.poster} />
                </div>
              )}

              {/* TAB 5: DIALOGUE/TRAILER */}
              {activeTab === 'quotes' && (
                <div className="flex flex-col gap-6">
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
                </div>
              )}

              {/* TAB 6: PREMIERE/SHARE */}
              {activeTab === 'premiere' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Share2 className="size-5 text-ignition-orange" />
                      Launch Premiere
                    </h3>
                  </div>
                  <GlassCard className="p-6 sm:p-8 flex flex-col gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Professional Portfolio Bio
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {story.social.portfolioBio}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Resume Professional Summary
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {story.social.resumeSummary}
                      </p>
                    </div>
                  </GlassCard>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Public Share Page Ready</p>
                      <p className="text-xs text-muted-foreground">Open or copy the public link to showcase your film origin story.</p>
                    </div>
                    <Link
                      href={`/s/${slug}`}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black uppercase transform-gpu duration-100 ease-out hover:scale-105 hover:shadow-glow-cyan"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        Open Public Link
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
