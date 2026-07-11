"use client";

import { TextAreaField } from "@/components/generator/field-controls";

export function LowestPointStep() {
  return (
    <TextAreaField
      name="lowestPoint"
      label="What was your lowest point?"
      placeholder="Describe a struggle, setback, or moment of doubt."
      description="Every origin story has a trial. What almost stopped you?"
      followUpPrompt="Can you say more? What made this moment so hard?"
    />
  );
}
