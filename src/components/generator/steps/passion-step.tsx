'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { PASSION_OPTIONS } from '@/config';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AnswersForm } from '@/components/generator/answers-schema';

export function PassionStep() {
  const { watch, setValue, formState } = useFormContext<AnswersForm>();
  const passionValue = watch('passion') || '';
  const error = formState.errors.passion;

  // Extract selected passions from comma-separated string value
  const selectedPassions = useMemo(() => {
    if (!passionValue) return [];
    return passionValue.split(',').map((p) => p.trim()).filter(Boolean);
  }, [passionValue]);

  // Extract custom text (items not in the PASSION_OPTIONS config list)
  const customText = useMemo(() => {
    const nonOptions = selectedPassions.filter(
      (p) => !PASSION_OPTIONS.includes(p as (typeof PASSION_OPTIONS)[number])
    );
    return nonOptions.join(', ');
  }, [selectedPassions]);

  const commit = (value: string) => {
    setValue('passion', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleToggle = (option: string) => {
    let next: string[];
    if (selectedPassions.includes(option)) {
      // Toggle off
      next = selectedPassions.filter((p) => p !== option);
    } else {
      // Toggle on
      next = [...selectedPassions, option];
    }
    commit(next.join(', '));
  };

  const handleCustomChange = (text: string) => {
    // Keep standard options selected, append/replace custom text
    const standardSelected = selectedPassions.filter((p) =>
      PASSION_OPTIONS.includes(p as (typeof PASSION_OPTIONS)[number])
    );
    const next = [...standardSelected];
    if (text.trim()) {
      next.push(text.trim());
    }
    commit(next.join(', '));
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="flex flex-col gap-3">
        <Label>Pick your passions (Select multiple)</Label>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Passions"
        >
          {PASSION_OPTIONS.map((option) => {
            const selected = selectedPassions.includes(option);
            return (
              <motion.button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => handleToggle(option)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative rounded-full border px-4 py-2 text-caption font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background duration-100 ease-out active:scale-95',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-ignition'
                    : 'border-border bg-surface-elevated text-foreground hover:bg-secondary hover:text-secondary-foreground',
                )}
              >
                {selected ? (
                  <motion.span
                    className="mr-1.5 inline-block"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
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
          value={customText}
          aria-invalid={error !== undefined}
          aria-describedby={error ? 'passion-error' : undefined}
          onChange={(event) => handleCustomChange(event.target.value)}
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
