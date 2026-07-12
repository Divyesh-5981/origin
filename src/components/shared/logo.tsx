import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Show the "Origin" wordmark next to the icon */
  showWordmark?: boolean;
  /** Size of the icon in pixels */
  size?: number;
}

/**
 * Origin Logo — a cinematic camera shutter/aperture with a pulsing spark center.
 * Matches the favicon.svg design: orange→cyan gradient spark, rotating iris blades.
 */
export function Logo({ className, showWordmark = true, size = 32 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-spark-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        {/* Outer ring */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.15"
        />
        {/* Iris blades */}
        <g opacity="0.7">
          <path
            d="M 16 2 A 14 14 0 0 1 30 16 L 25 16 A 9 9 0 0 0 16 7 Z"
            fill="hsl(var(--secondary))"
            opacity="0.5"
          />
          <path
            d="M 16 30 A 14 14 0 0 1 2 16 L 7 16 A 9 9 0 0 0 16 25 Z"
            fill="hsl(var(--primary))"
            opacity="0.5"
          />
        </g>
        {/* Inner orbit */}
        <circle
          cx="16"
          cy="16"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.2"
        />
        {/* Center spark */}
        <path
          d="M 16 11 L 17.2 14.8 L 21 16 L 17.2 17.2 L 16 21 L 14.8 17.2 L 11 16 L 14.8 14.8 Z"
          fill="url(#logo-spark-grad)"
        />
      </svg>
      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Origin
        </span>
      ) : null}
    </div>
  );
}
