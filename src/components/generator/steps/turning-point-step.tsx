"use client";

import { TextAreaField } from "@/components/generator/field-controls";

export function TurningPointStep() {
  return (
    <TextAreaField
      name="turningPoint"
      label="What was your turning point?"
      placeholder="Describe the breakthrough that changed everything."
      description="The decision, realization, or event that set you on your path."
      followUpPrompt="What shifted in that moment? A few more words will make it vivid."
    />
  );
}
