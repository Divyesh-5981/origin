"use client";

import dynamic from "next/dynamic";
import { Suspense, type ComponentType, type ReactNode } from "react";
import { SceneErrorBoundary } from "@/components/shared/scene-error-boundary";
import { SceneLoading } from "@/components/shared/scene-loading";

type SceneLoader<TProps> = () => Promise<{
  default: ComponentType<TProps>;
}>;

export function createDynamicScene<TProps extends object>(
  loader: SceneLoader<TProps>,
): ComponentType<TProps> {
  return dynamic(loader, {
    ssr: false,
    loading: () => <SceneLoading />,
  });
}

interface DynamicSceneProps<TProps extends object> {
  component: ComponentType<TProps>;
  sceneProps: TProps;
  fallback?: ReactNode;
}

export function DynamicScene<TProps extends object>({
  component: SceneComponent,
  sceneProps,
  fallback = null,
}: DynamicSceneProps<TProps>) {
  return (
    <SceneErrorBoundary fallback={fallback}>
      <Suspense fallback={<SceneLoading />}>
        <SceneComponent {...sceneProps} />
      </Suspense>
    </SceneErrorBoundary>
  );
}
