import Link from 'next/link';
import { Flame } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ThreadDivider } from '@/components/ui/thread-divider';

export default function ShareNotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-24 text-center sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
        aria-hidden
      />
      <GlassCard className="flex max-w-md flex-col items-center gap-5 p-8">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Flame className="size-7" aria-hidden />
          </div>
          <h1 className="font-heading text-heading text-foreground">
            This shared story isn&apos;t available
          </h1>
          <ThreadDivider width="fixed" />
          <p className="text-body text-muted-foreground">
            The link may be incorrect or the story may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-heading text-body font-semibold text-primary-foreground shadow-ignition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Return to landing
          </Link>
        </div>
      </GlassCard>
    </main>
  );
}
