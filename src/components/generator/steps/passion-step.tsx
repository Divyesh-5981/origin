'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'motion/react';
import { PASSION_OPTIONS } from '@/config';
import { acceptCustomPassion } from '@/lib/core/generator-nav';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AnswersForm } from '@/components/generator/answers-schema';

export function PassionStep() {
  const { watch, setValue, formState } = useFormContext<AnswersForm>();
  const passion = watch('passion');
  const error = formState.errors.passion;
  const isCustom =
    passion.length > 0 &&
    !PASSION_OPTIONS.includes(passion as (typeof PASSION_OPTIONS)[number]);

  const commit = (value: string) => {
    setValue('passion', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="flex flex-col gap-3">
        <Label>Pick a passion</Label>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Passions"
        >
          {PASSION_OPTIONS.map((option) => {
            const selected = passion === option;
            return (
              <motion.button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => commit(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative rounded-full border px-4 py-2 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-ignition'
                    : 'border-border bg-surface-elevated text-foreground hover:bg-secondary hover:text-secondary-foreground',
                )}
              >
                {selected ? (
                  <motion.span
                    className="mr-1 inline-block"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    aria-hidden
                  >
                    ✦
                  </motion.span>
                ) : null}
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="custom-passion">Or describe your own</Label>
        <Input
          id="custom-passion"
          placeholder="e.g. Restoring vintage motorcycles"
          value={isCustom ? passion : ''}
          aria-invalid={error !== undefined}
          aria-describedby={error ? 'passion-error' : undefined}
          onChange={(event) => commit(acceptCustomPassion(event.target.value))}
        />
      </div>

      {error ? (
        <p
          id="passion-error"
          role="alert"
          className="text-caption text-destructive"
        >
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
