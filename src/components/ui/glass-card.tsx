import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated' | 'subtle';
};

const VARIANT_STYLES = {
  default:
    'border border-border/60 bg-card/60 backdrop-blur-xl shadow-elevated',
  elevated:
    'border border-border/50 bg-card/70 backdrop-blur-2xl shadow-elevated',
  subtle: 'border border-border/40 bg-card/40 backdrop-blur-md',
} as const;

/**
 * GlassCard — frosted glass container with subtle inner glow.
 * Used for character card, share panel, story sections, and other
 * content containers throughout the ignition design system.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        VARIANT_STYLES[variant],
        // Subtle inner glow
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-ignition before:opacity-30 before:content-['']",
        className,
      )}
      {...props}
    />
  ),
);

GlassCard.displayName = 'GlassCard';
