import Link from "next/link";
import { HeroVisual } from "@/components/sections/hero-visual";

export function HeroLanding() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <HeroVisual />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-glow"
        aria-hidden
      />
      <section className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="mb-6 rounded-full border border-border bg-surface-elevated/80 px-4 py-1.5 text-caption font-medium text-muted-foreground backdrop-blur">
          Every passion has a beginning
        </span>
        <h1 className="bg-gradient-cinematic bg-clip-text text-heading-lg text-transparent sm:text-display md:text-display-lg">
          Origin
        </h1>
        <p className="mt-6 max-w-xl text-balance text-body-lg text-muted-foreground">
          Turn a few personal answers into a cinematic, interactive origin story
          you can share like the opening scene of a movie.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Begin Journey
          </Link>
        </div>
      </section>
    </main>
  );
}
