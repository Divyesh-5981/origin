"use client";

import { TextAreaField } from "@/components/generator/field-controls";

export function OriginMomentStep() {
  return (
    <TextAreaField
      name="originMoment"
      label="When did it all begin?"
      placeholder="Describe the moment your passion first sparked."
      description="The first time it clicked, a person who inspired you, or an early experience."
      followUpPrompt="One word is a great start — what actually happened in that first moment?"
    />
  );
}
