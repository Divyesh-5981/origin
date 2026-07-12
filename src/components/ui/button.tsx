'use client';

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-heading text-body font-semibold transition-transform duration-100 ease-out transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 duration-100 ease-out transform-gpu',
        secondary:
          'border border-border bg-card text-card-foreground hover:bg-surface-elevated duration-100 ease-out transform-gpu',
        ghost: 'text-foreground hover:bg-surface-elevated duration-100 ease-out transform-gpu',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-surface-elevated duration-100 ease-out transform-gpu',
      },
      size: {
        sm: 'px-3 py-2 text-caption',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-body-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const SPARK_COUNT = 5;
const SPARK_RADIUS = 32;

const sparkVariants: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0.5],
    x: Math.cos((i / SPARK_COUNT) * Math.PI * 2) * SPARK_RADIUS,
    y: Math.sin((i / SPARK_COUNT) * Math.PI * 2) * SPARK_RADIUS,
    transition: { duration: 0.6, delay: i * 0.02, ease: 'easeOut' },
  }),
};

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [showSparks, setShowSparks] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEnter = useCallback(() => {
      if (
        prefersReducedMotion ||
        variant === 'ghost' ||
        variant === 'outline'
      ) {
        return;
      }
      setShowSparks(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowSparks(false), 700);
    }, [prefersReducedMotion, variant]);

    const handleLeave = useCallback(() => {
      setShowSparks(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        onHoverStart={handleEnter}
        onHoverEnd={handleLeave}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        {...(props as Omit<React.ComponentProps<typeof motion.button>, 'ref'>)}
      >
        {/* Spark particle burst on hover */}
        {showSparks && !prefersReducedMotion ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {Array.from({ length: SPARK_COUNT }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute size-1 rounded-full bg-spark"
                style={{ boxShadow: '0 0 6px hsl(var(--spark))' }}
                custom={i}
                variants={sparkVariants}
                initial="initial"
                animate="animate"
              />
            ))}
          </span>
        ) : null}
        {/* Content sits above sparks */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
