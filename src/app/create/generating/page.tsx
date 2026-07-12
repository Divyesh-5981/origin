import { GenerationProgress } from '@/components/progress/generation-progress';

export default function GeneratingPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ignition"
        aria-hidden
      />
      <GenerationProgress />
    </main>
  );
}
