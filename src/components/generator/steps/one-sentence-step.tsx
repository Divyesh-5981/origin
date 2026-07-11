"use client";

import { TextAreaField } from "@/components/generator/field-controls";

export function OneSentenceStep() {
  return (
    <TextAreaField
      name="oneSentence"
      label="Describe yourself in one sentence"
      placeholder="e.g. A self-taught builder who turns curiosity into craft."
      description="This becomes the heartbeat of your origin story."
      followUpPrompt="Try a full sentence — it sets the tone for everything."
      rows={3}
    />
  );
}
