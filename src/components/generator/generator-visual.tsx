'use client';

import { useRenderMode } from '@/components/providers/capability-provider';
import {
  createDynamicScene,
  DynamicScene,
} from '@/components/shared/dynamic-scene';

const GeneratorScene3D = createDynamicScene(
  () => import('@/components/generator/generator-visual-3d'),
);

interface GeneratorVisualProps {
  activeStep: number;
}

export function GeneratorVisual({ activeStep }: GeneratorVisualProps) {
  const renderMode = useRenderMode(true);

  if (renderMode === '2d-fallback') {
    return (
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] bg-film-grain mix-blend-overlay opacity-30 pointer-events-none" 
        aria-hidden 
      />
    );
  }

  return (
    <DynamicScene
      component={GeneratorScene3D}
      sceneProps={{ activeStep, reduced: renderMode === '3d-reduced' }}
      fallback={
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] bg-film-grain mix-blend-overlay opacity-30 pointer-events-none" 
          aria-hidden 
        />
      }
    />
  );
}
