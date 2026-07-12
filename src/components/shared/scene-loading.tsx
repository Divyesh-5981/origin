'use client';

import { SparkLoader } from '@/components/ui/spark-loader';
import { cn } from '@/lib/utils';

interface SceneLoadingProps {
  className?: string;
  label?: string;
}

export function SceneLoading({
  className,
  label = 'Loading scene',
}: SceneLoadingProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        'relative flex h-full min-h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-sunken bg-gradient-ignition',
        className,
      )}
    >
      <SparkLoader size="lg" label={label} />
    </div>
  );
}
