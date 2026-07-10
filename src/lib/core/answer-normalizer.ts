import type { Answers } from "@/types";

const MIN_ANSWER_LENGTH = 0;

const NON_LATIN_LETTER_PATTERN = /(?=\p{L})(?!\p{Script=Latin})[\s\S]/u;

export type AnswerField = keyof Answers;

export interface NormalizeConfig {
  maxAnswerLength: number;
}

export interface NormalizedAnswers {
  values: Answers;
  needsSummarization: AnswerField[];
  needsTranslation: AnswerField[];
}

const ANSWER_FIELDS: readonly AnswerField[] = [
  "name",
  "profession",
  "country",
  "passion",
  "originMoment",
  "lowestPoint",
  "turningPoint",
  "dream",
  "oneSentence",
];

export function needsSummarization(text: string, max: number): boolean {
  return text.length > max;
}

function needsTranslation(text: string): boolean {
  return NON_LATIN_LETTER_PATTERN.test(text);
}

function boundToMax(text: string, max: number): string {
  const limit = Math.max(MIN_ANSWER_LENGTH, max);
  return text.length > limit ? text.slice(0, limit) : text;
}

export function prepareForGeneration(
  answers: Answers,
  cfg: NormalizeConfig,
): NormalizedAnswers {
  const values: Answers = { ...answers };
  const summarizationFields: AnswerField[] = [];
  const translationFields: AnswerField[] = [];

  for (const field of ANSWER_FIELDS) {
    const original = answers[field];
    if (original === undefined) {
      continue;
    }
    if (needsSummarization(original, cfg.maxAnswerLength)) {
      summarizationFields.push(field);
    }
    if (needsTranslation(original)) {
      translationFields.push(field);
    }
    values[field] = boundToMax(original, cfg.maxAnswerLength);
  }

  return {
    values,
    needsSummarization: summarizationFields,
    needsTranslation: translationFields,
  };
}
