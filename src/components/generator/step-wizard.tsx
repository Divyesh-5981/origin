'use client';

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  advance,
  back,
  canGenerate,
  STEP_TYPES,
  type StepType,
} from '@/lib/core/generator-nav';
import {
  classifyAnswer,
  detectContradictions,
  isEffectivelyEmpty,
} from '@/lib/core/input-classifier';
import type { Answers, Draft } from '@/types';
import { useGeneratorStore } from '@/lib/stores/generator-store';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  answersSchema,
  EMPTY_ANSWERS,
  type AnswersForm,
} from '@/components/generator/answers-schema';
import { useDraftPersistence } from '@/components/generator/use-draft-persistence';
import { BasicStep } from '@/components/generator/steps/basic-step';
import { PassionStep } from '@/components/generator/steps/passion-step';
import { OriginMomentStep } from '@/components/generator/steps/origin-moment-step';
import { LowestPointStep } from '@/components/generator/steps/lowest-point-step';
import { TurningPointStep } from '@/components/generator/steps/turning-point-step';
import { DreamStep } from '@/components/generator/steps/dream-step';
import { OneSentenceStep } from '@/components/generator/steps/one-sentence-step';
import { ByokSettings } from '@/components/generator/byok-settings';
interface StepDefinition {
  type: StepType;
  title: string;
  subtitle: string;
  fields: (keyof AnswersForm)[];
  required: (keyof AnswersForm)[];
  render: () => ReactElement;
}

const STEP_DEFINITIONS: Record<StepType, StepDefinition> = {
  basic: {
    type: 'basic',
    title: 'The basics',
    subtitle: 'A little about who you are.',
    fields: ['name', 'profession', 'country'],
    required: ['name', 'profession'],
    render: () => <BasicStep />,
  },
  passion: {
    type: 'passion',
    title: 'Your passion',
    subtitle: 'The subject at the heart of your story.',
    fields: ['passion'],
    required: ['passion'],
    render: () => <PassionStep />,
  },
  'origin-moment': {
    type: 'origin-moment',
    title: 'The origin',
    subtitle: 'Where it all began.',
    fields: ['originMoment'],
    required: ['originMoment'],
    render: () => <OriginMomentStep />,
  },
  'lowest-point': {
    type: 'lowest-point',
    title: 'The trial',
    subtitle: 'The struggle that tested you.',
    fields: ['lowestPoint'],
    required: ['lowestPoint'],
    render: () => <LowestPointStep />,
  },
  'turning-point': {
    type: 'turning-point',
    title: 'The turning point',
    subtitle: 'The moment everything changed.',
    fields: ['turningPoint'],
    required: ['turningPoint'],
    render: () => <TurningPointStep />,
  },
  dream: {
    type: 'dream',
    title: 'The dream',
    subtitle: "Where you're headed next.",
    fields: ['dream'],
    required: ['dream'],
    render: () => <DreamStep />,
  },
  'one-sentence': {
    type: 'one-sentence',
    title: 'In one sentence',
    subtitle: 'The essence of your journey.',
    fields: ['oneSentence'],
    required: ['oneSentence'],
    render: () => <OneSentenceStep />,
  },
};

const STEP_COUNT = STEP_TYPES.length;
const LAST_STEP_INDEX = STEP_COUNT - 1;

const NARRATIVE_FIELDS: (keyof AnswersForm)[] = [
  'originMoment',
  'lowestPoint',
  'turningPoint',
  'dream',
  'oneSentence',
];

const STEP_NARRATIVE_FIELD: Partial<Record<StepType, keyof AnswersForm>> = {
  'origin-moment': 'originMoment',
  'lowest-point': 'lowestPoint',
  'turning-point': 'turningPoint',
  dream: 'dream',
  'one-sentence': 'oneSentence',
};

const FIELD_STEP_INDEX: Partial<Record<keyof Answers, number>> = {
  passion: 1,
  originMoment: 2,
  lowestPoint: 3,
  turningPoint: 4,
  dream: 5,
  oneSentence: 6,
};

const FIELD_LABEL: Partial<Record<keyof Answers, string>> = {
  passion: 'Passion',
  originMoment: 'Origin',
  lowestPoint: 'Trial',
  turningPoint: 'Turning point',
  dream: 'Dream',
  oneSentence: 'One sentence',
};

function clampStepIndex(step: number): number {
  if (step < 0) {
    return 0;
  }
  if (step > LAST_STEP_INDEX) {
    return LAST_STEP_INDEX;
  }
  return step;
}

export function StepWizard() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const setAnswers = useGeneratorStore((state) => state.setAnswers);
  const [activeStep, setActiveStep] = useState(0);
  const [draftRecovered, setDraftRecovered] = useState(false);

  const form = useForm<AnswersForm>({
    resolver: zodResolver(answersSchema),
    defaultValues: EMPTY_ANSWERS,
    mode: 'onTouched',
  });

  const { handleSubmit, reset, trigger, control } = form;
  const values = useWatch({ control }) as AnswersForm;

  const handleRestore = useCallback(
    (draft: Draft) => {
      reset({ ...EMPTY_ANSWERS, ...draft.answers });
      setActiveStep(clampStepIndex(draft.activeStep));
    },
    [reset],
  );

  const handleCorrupted = useCallback(() => {
    setDraftRecovered(true);
  }, []);

  useDraftPersistence({
    answers: values,
    activeStep,
    onRestore: handleRestore,
    onCorrupted: handleCorrupted,
  });

  const stepType = STEP_TYPES[clampStepIndex(activeStep)];
  const definition = STEP_DEFINITIONS[stepType];

  const canAdvanceStep = useMemo(() => {
    const requiredFilled = definition.required.every(
      (field) => !isEffectivelyEmpty(values[field] ?? ''),
    );
    if (!requiredFilled) {
      return false;
    }
    const narrativeField = STEP_NARRATIVE_FIELD[definition.type];
    if (
      narrativeField !== undefined &&
      classifyAnswer(values[narrativeField] ?? '').kind !== 'ok'
    ) {
      return false;
    }
    return true;
  }, [definition, values]);

  const narrativeClean = useMemo(
    () =>
      NARRATIVE_FIELDS.every(
        (field) => classifyAnswer(values[field] ?? '').kind === 'ok',
      ),
    [values],
  );

  const contradictionFields = useMemo(() => {
    const flags = detectContradictions(values as Answers);
    const seen = new Set<keyof Answers>();
    for (const flag of flags) {
      for (const field of flag.fields) {
        if (FIELD_STEP_INDEX[field] !== undefined) {
          seen.add(field);
        }
      }
    }
    return [...seen];
  }, [values]);

  const generationEnabled = canGenerate(values as Answers) && narrativeClean;
  const isLastStep = activeStep === LAST_STEP_INDEX;

  const handleNext = async () => {
    const valid = await trigger(definition.fields);
    if (!valid) {
      return;
    }
    setActiveStep((step) => advance(step));
  };

  const handleBack = () => {
    setActiveStep((step) => back(step));
  };

  const handleGenerate = handleSubmit((submitted) => {
    setAnswers(submitted as Answers);
    router.push('/create/generating');
  });

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        {/* Ignition progress bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-caption text-muted-foreground">
            <span>
              Step {activeStep + 1} of {STEP_COUNT}
            </span>
            <span>{definition.title}</span>
          </div>
          <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEP_COUNT}
            aria-valuenow={activeStep + 1}
            aria-label="Generator progress"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-cinematic shadow-ignition"
              initial={false}
              animate={{
                width: `${((activeStep + 1) / STEP_COUNT) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Spark nodes for completed steps */}
            <div className="absolute inset-0 flex items-center">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="relative flex-1 flex justify-center"
                  aria-hidden
                >
                  <motion.span
                    className="size-2 rounded-full"
                    style={{
                      background:
                        i <= activeStep
                          ? 'hsl(var(--spark))'
                          : 'hsl(var(--muted-foreground) / 0.3)',
                      boxShadow:
                        i < activeStep ? '0 0 8px hsl(var(--spark))' : 'none',
                    }}
                    animate={
                      i === activeStep
                        ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }
                        : undefined
                    }
                    transition={
                      i === activeStep
                        ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {draftRecovered ? (
          <div
            role="status"
            className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-caption text-muted-foreground"
          >
            We couldn&apos;t restore your previous draft, so we started fresh.
          </div>
        ) : null}

        {contradictionFields.length > 0 ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3"
          >
            <p className="text-caption text-foreground">
              A few answers look identical. Make them distinct so your story
              stays coherent.
            </p>
            <div className="flex flex-wrap gap-2">
              {contradictionFields.map((field) => (
                <Button
                  key={field}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveStep(clampStepIndex(FIELD_STEP_INDEX[field] ?? 0))
                  }
                >
                  Edit {FIELD_LABEL[field]}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={stepType}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }
            }
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-2 text-center"
          >
            <h1 className="font-heading text-heading text-foreground">
              {definition.title}
            </h1>
            <p className="text-body text-muted-foreground">
              {definition.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <GlassCard className="p-6 sm:p-8">
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepType}
                initial={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
                }
                animate={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {definition.render()}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>

        {isLastStep ? <ByokSettings /> : null}

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>

          {isLastStep ? (
            <Button onClick={handleGenerate} disabled={!generationEnabled}>
              <Sparkles className="size-4" aria-hidden />
              Generate my story
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canAdvanceStep}>
              Next
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
