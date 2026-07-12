import { GenerationProgress } from '@/components/progress/generation-progress';
import { GeneratingVisual3D } from '@/components/progress/generating-visual-3d';

export default function GeneratingPage() {
  return (
    <main className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8 bg-black">
      {/* 3D WebGL Cosmic Vortex Loader Backdrop */}
      <GeneratingVisual3D />

      {/* Glassmorphic UI progress controller overlay */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center">
        <GenerationProgress />
      </div>
    </main>
  );
}
