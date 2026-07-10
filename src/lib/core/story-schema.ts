import { z } from "zod";
import type { PosterSpec } from "@/types";

const ORIGIN_STORY_MIN_WORDS = 1000;
const ORIGIN_STORY_MAX_WORDS = 1500;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export const PosterSpecSchema = z.object({
  theme: z.string(),
  background: z.string(),
  title: z.string(),
  subtitle: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accent: z.string(),
  layout: z.enum(["Centered", "LeftAligned", "Split"]),
  decorations: z.array(z.string()),
});

export const TimelineStageSchema = z.object({
  key: z.enum(["beginning", "failure", "breakthrough", "today", "future"]),
  title: z.string(),
  body: z.string(),
});

export const CharacterProfileSchema = z.object({
  mission: z.string(),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  motivation: z.string(),
  coreValues: z.array(z.string()).min(1),
});

export const SocialAssetsSchema = z.object({
  linkedin: z.string(),
  twitterThread: z.array(z.string()).min(1),
  instagram: z.string(),
  portfolioBio: z.string(),
  resumeSummary: z.string(),
});

export const StorySchema = z.object({
  heroTitle: z.string().min(1),
  tagline: z.string().min(1),
  originStory: z.string().refine((s) => {
    const words = countWords(s);
    return words >= ORIGIN_STORY_MIN_WORDS && words <= ORIGIN_STORY_MAX_WORDS;
  }, "originStory must be 1000-1500 words"),
  timeline: z.array(TimelineStageSchema).length(5),
  character: CharacterProfileSchema,
  quote: z.string().min(1),
  trailerScript: z.string().min(1),
  social: SocialAssetsSchema,
  poster: PosterSpecSchema,
  inferredContent: z.array(z.string()).default([]),
});

export type Story = z.infer<typeof StorySchema>;
export type TimelineStage = z.infer<typeof TimelineStageSchema>;
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;
export type SocialAssets = z.infer<typeof SocialAssetsSchema>;

type PosterSpecShape = z.infer<typeof PosterSpecSchema>;
type AssertPosterSpecAligned = PosterSpecShape extends PosterSpec
  ? PosterSpec extends PosterSpecShape
  ? true
  : never
  : never;
const _posterSpecAligned: AssertPosterSpecAligned = true;
void _posterSpecAligned;

export type ValidateStoryResult =
  | { ok: true; story: Story }
  | { ok: false; issues: z.core.$ZodIssue[] };

export function validateStory(candidate: unknown): ValidateStoryResult {
  const result = StorySchema.safeParse(candidate);
  if (result.success) {
    return { ok: true, story: result.data };
  }
  return { ok: false, issues: result.error.issues };
}

export function issuesToRepairHints(issues: z.core.$ZodIssue[]): string {
  if (issues.length === 0) {
    return "";
  }
  return issues
    .map((issue) => {
      const path = issue.path.map((segment) => String(segment)).join(".");
      const location = path.length > 0 ? path : "(root)";
      return `- ${location}: ${issue.message}`;
    })
    .join("\n");
}

interface GeminiSchema {
  type: "OBJECT" | "STRING" | "ARRAY" | "NUMBER" | "INTEGER" | "BOOLEAN";
  description?: string;
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
  enum?: string[];
}

const posterSpecResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    theme: { type: "STRING" },
    background: { type: "STRING" },
    title: { type: "STRING" },
    subtitle: { type: "STRING" },
    primaryColor: { type: "STRING" },
    secondaryColor: { type: "STRING" },
    accent: { type: "STRING" },
    layout: { type: "STRING", enum: ["Centered", "LeftAligned", "Split"] },
    decorations: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "theme",
    "background",
    "title",
    "subtitle",
    "primaryColor",
    "secondaryColor",
    "accent",
    "layout",
    "decorations",
  ],
};

const timelineStageResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    key: {
      type: "STRING",
      enum: ["beginning", "failure", "breakthrough", "today", "future"],
    },
    title: { type: "STRING" },
    body: { type: "STRING" },
  },
  required: ["key", "title", "body"],
};

const characterProfileResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    mission: { type: "STRING" },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    weaknesses: { type: "ARRAY", items: { type: "STRING" } },
    motivation: { type: "STRING" },
    coreValues: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["mission", "strengths", "weaknesses", "motivation", "coreValues"],
};

const socialAssetsResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    linkedin: { type: "STRING" },
    twitterThread: { type: "ARRAY", items: { type: "STRING" } },
    instagram: { type: "STRING" },
    portfolioBio: { type: "STRING" },
    resumeSummary: { type: "STRING" },
  },
  required: [
    "linkedin",
    "twitterThread",
    "instagram",
    "portfolioBio",
    "resumeSummary",
  ],
};

export const storyResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    heroTitle: { type: "STRING" },
    tagline: { type: "STRING" },
    originStory: { type: "STRING" },
    timeline: { type: "ARRAY", items: timelineStageResponseSchema },
    character: characterProfileResponseSchema,
    quote: { type: "STRING" },
    trailerScript: { type: "STRING" },
    social: socialAssetsResponseSchema,
    poster: posterSpecResponseSchema,
    inferredContent: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "heroTitle",
    "tagline",
    "originStory",
    "timeline",
    "character",
    "quote",
    "trailerScript",
    "social",
    "poster",
    "inferredContent",
  ],
};

export type { GeminiSchema };
