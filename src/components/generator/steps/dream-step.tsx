"use client";

import { TextAreaField } from "@/components/generator/field-controls";

export function DreamStep() {
  return (
    <TextAreaField
      name="dream"
      label="What's your dream?"
      placeholder="Describe where you want your passion to take you."
      description="The future you're building toward."
      followUpPrompt="Paint the picture — what does reaching that dream look like?"
    />
  );
}
