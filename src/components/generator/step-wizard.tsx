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
import { GeneratorVisual } from '@/components/generator/generator-visual';

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
      <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-background overflow-hidden">
        {/* Left column: 3D viewport */}
        <div className="relative h-[38vh] w-full lg:h-screen lg:w-[42%] border-b lg:border-b-0 lg:border-r border-white/10 bg-black/30 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-20 bg-film-grain mix-blend-overlay opacity-25" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          
          {/* Director's Camera Viewfinder HUD */}
          <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between font-mono text-[9px] text-white/40 tracking-wider">
            {/* Top row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="font-bold text-white/70">REC</span>
              </div>
              <div className="text-[10px]">TC 00:04:12:18</div>
            </div>

            {/* Viewfinder Crop Marks */}
            <div className="absolute inset-8 border border-white/5 border-dashed pointer-events-none">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />
            </div>

            {/* Center grid line crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none size-4 opacity-30">
              <div className="absolute top-2 left-0 w-4 h-[1px] bg-white" />
              <div className="absolute top-0 left-2 w-[1px] h-4 bg-white" />
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-center text-[8px]">
              <div>4K ProRes 422</div>
              <div>50mm f/2.8</div>
              <div>ISO 400</div>
            </div>
          </div>

          <div className="absolute inset-0 z-10">
            <GeneratorVisual activeStep={activeStep} />
          </div>
        </div>

        {/* Right column: Form */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto z-30 relative bg-black/45">
          {/* Ambient glowing blobs behind the form card to highlight frosted glass refractions */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
            <div className="absolute top-[25%] left-[25%] size-[280px] rounded-full bg-ignition-orange/5 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[25%] right-[25%] size-[320px] rounded-full bg-electric-cyan/5 blur-[120px] animate-pulse" />
          </div>

          <div className="w-full max-w-xl flex flex-col gap-6 relative z-10">
            {/* Progress bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-caption text-muted-foreground">
                <span>
                  Step {activeStep + 1} of {STEP_COUNT}
                </span>
                <span className="font-bold uppercase tracking-wider text-electric-cyan">{definition.title}</span>
              </div>
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={STEP_COUNT}
                aria-valuenow={activeStep + 1}
                aria-label="Generator progress"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-ignition-orange to-electric-cyan shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                  initial={false}
                  animate={{
                    width: `${((activeStep + 1) / STEP_COUNT) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {draftRecovered ? (
              <div
                role="status"
                className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-caption text-muted-foreground"
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
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
                }
                animate={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-2 text-left"
              >
                <h1 className="font-heading text-4xl font-medium tracking-tight text-white">
                  {definition.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {definition.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <GlassCard className="p-6 sm:p-8 relative border-white/10">
              <div className="pointer-events-none absolute inset-0 z-0 bg-film-grain mix-blend-overlay opacity-10 rounded-2xl" />
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

            <div className="flex items-center justify-between gap-4 mt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="size-4 mr-1.5" aria-hidden />
                Back
              </Button>

              {isLastStep ? (
                <Button onClick={handleGenerate} disabled={!generationEnabled} className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-ignition">
                  <Sparkles className="size-4 mr-1.5" aria-hidden />
                  Generate my story
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canAdvanceStep} className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-ignition">
                  Next
                  <ArrowRight className="size-4 ml-1.5" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
