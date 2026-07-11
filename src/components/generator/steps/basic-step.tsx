"use client";

import { TextField } from "@/components/generator/field-controls";

export function BasicStep() {
  return (
    <div className="flex flex-col gap-5">
      <TextField
        name="name"
        label="What's your name?"
        placeholder="e.g. Ada Lovelace"
      />
      <TextField
        name="profession"
        label="What do you do?"
        placeholder="e.g. Software engineer"
      />
      <TextField
        name="country"
        label="Where are you based?"
        placeholder="e.g. United Kingdom"
        optional
      />
    </div>
  );
}
