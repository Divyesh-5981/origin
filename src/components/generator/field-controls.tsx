"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { classifyAnswer } from "@/lib/core/input-classifier";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnswersForm } from "@/components/generator/answers-schema";

type FieldName = keyof AnswersForm;

const EMOJI_ONLY_PROMPT =
  "Add a few words in text so we can weave this into your story.";

interface FieldProps {
  name: FieldName;
  label: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
}

function useFieldMeta(name: FieldName, description?: string) {
  const {
    formState: { errors },
  } = useFormContext<AnswersForm>();
  const error = errors[name];
  const errorId = error ? `${name}-error` : undefined;
  const descriptionId = description ? `${name}-description` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return { error, errorId, descriptionId, describedBy };
}

export function TextField({
  name,
  label,
  placeholder,
  description,
  optional = false,
}: FieldProps) {
  const { register } = useFormContext<AnswersForm>();
  const { error, errorId, descriptionId, describedBy } = useFieldMeta(
    name,
    description,
  );

  return (
    <div className="flex flex-col gap-2 text-left">
      <Label htmlFor={name}>
        {label}
        {optional ? (
          <span className="ml-1 text-muted-foreground">(optional)</span>
        ) : null}
      </Label>
      <Input
        id={name}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy}
        {...register(name)}
      />
      {description ? (
        <p id={descriptionId} className="text-caption text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

interface TextAreaFieldProps extends FieldProps {
  rows?: number;
  followUpPrompt: string;
}

export function TextAreaField({
  name,
  label,
  placeholder,
  description,
  rows = 5,
  followUpPrompt,
}: TextAreaFieldProps) {
  const { register, control } = useFormContext<AnswersForm>();
  const { error, errorId, descriptionId, describedBy } = useFieldMeta(
    name,
    description,
  );

  const value = (useWatch({ control, name }) as string | undefined) ?? "";
  const verdict = classifyAnswer(value);
  const followUpId = `${name}-followup`;
  const followUpMessage =
    verdict.kind === "needs-followup"
      ? followUpPrompt
      : verdict.kind === "needs-text"
        ? EMOJI_ONLY_PROMPT
        : null;

  const textareaDescribedBy =
    [describedBy, followUpMessage ? followUpId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2 text-left">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        aria-describedby={textareaDescribedBy}
        {...register(name)}
      />
      {description ? (
        <p id={descriptionId} className="text-caption text-muted-foreground">
          {description}
        </p>
      ) : null}
      {followUpMessage ? (
        <p
          id={followUpId}
          role="status"
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-caption text-foreground"
        >
          {followUpMessage}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
