"use client";

import { useRenderMode } from "@/components/providers/capability-provider";
import {
  createDynamicScene,
  DynamicScene,
} from "@/components/shared/dynamic-scene";
import { FallbackScene } from "@/components/shared/fallback-scene";

const HeroScene3D = createDynamicScene(
  () => import("@/components/sections/hero-scene-3d"),
);

const FALLBACK_CLASSNAME = "absolute inset-0 min-h-0 rounded-none";

function HeroFallback() {
  return <FallbackScene variant="landing" className={FALLBACK_CLASSNAME} />;
}

export function HeroVisual() {
  const renderMode = useRenderMode(true);

  if (renderMode === "2d-fallback") {
    return <HeroFallback />;
  }

  return (
    <DynamicScene
      component={HeroScene3D}
      sceneProps={{ reduced: renderMode === "3d-reduced" }}
      fallback={<HeroFallback />}
    />
  );
}
