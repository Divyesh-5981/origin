# Design Document

## Overview

Origin is a Next.js (App Router) application that turns seven personal answers into a cinematic, shareable "origin story" microsite. The core value is presentation: instead of returning plain text, Origin renders AI output as an immersive experience (3D hero, interactive timeline, holographic character card, movie poster, voice narration, public share page).

This design targets two hackathon judging levers directly:

- **Technical execution & presentation (45% combined weight):** a stable demo-critical flow (Landing → Generator → Progress → Story → Share) with a guaranteed 2D fallback so the demo never fails on unknown hardware or conference WiFi.
- **Meaningful prize-technology use:** Google Gemini 2.5 Flash powers the generation pipeline with schema-constrained structured output and self-repair; ElevenLabs powers premium narration with a Web Speech API fallback.

The system is guest-first: a visitor can generate and share a story with zero authentication. Stories persist as anonymous records so share links resolve for anyone. An optional Clerk account lets users associate, list, and delete their stories.

### Design Principles

1. **Server Components first.** The Landing, Story microsite, and Share pages render as React Server Components that read persisted data server-side. `"use client"` boundaries are pushed down to the smallest interactive leaves (3D canvases, forms, narration controls).
2. **Degrade gracefully, always.** Every 3D surface has a polished 2D fallback. WebGL absence, reduced-motion preference, and low device capability each map to a defined non-3D or reduced path. The system renders exactly one rendering mode per surface, never both.
3. **The AI boundary is untrusted.** Gemini output is never consumed directly. It is parsed, validated against a Zod schema, and repaired before it can become a `Story_Record`. Persistence only happens on the validated success path.
4. **Deterministic core, stochastic edge.** The logic that decides _what_ to render, _which_ provider to narrate with, _whether_ to accept input, and _how_ to repair output is written as pure, testable functions independent of React, network, and the Gemini SDK.

### Key Technical Decisions

| Decision             | Choice                                                                                       | Rationale                                                                                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structured AI output | Gemini `responseMimeType: "application/json"` + `responseSchema`, then Zod re-validation     | Schema-constrained decoding drastically reduces malformed JSON; Zod is the trust boundary because model schema adherence is not guaranteed ([Gemini structured output docs](https://ai.google.dev/gemini-api/docs/structured-output)) |
| Narration            | ElevenLabs streaming TTS via a Next.js Route Handler, Web Speech API fallback in the browser | ElevenLabs keys stay server-side; streaming gives low time-to-first-audio; Web Speech guarantees zero-cost fallback ([ElevenLabs TTS integration](https://elevenlabs.io/blog/text-to-speech-api-integration))                         |
| Persistence          | Supabase (Postgres) with a service-role client behind API routes                             | Anonymous records need server-side writes without exposing keys; RLS protects account-scoped reads/writes                                                                                                                             |
| Auth                 | Clerk, optional                                                                              | Guest-first flow requires generation without a session; Clerk augments rather than gates                                                                                                                                              |
| Server state         | TanStack Query on the client for generation mutation + polling; RSC fetch for page loads     | Mutation lifecycle (pending/error/retry) maps cleanly to the progress view; static reads stay on the server                                                                                                                           |
| Poster               | Client-rendered SVG/Canvas from a Gemini design spec                                         | Zero image-generation cost, instant, unlimited, and PNG-exportable via canvas serialization                                                                                                                                           |

---

## Architecture

### System Context

```mermaid
flowchart TD
    User[Browser] --> App[Next.js App Router on Vercel]

    subgraph Client
        Landing[Landing RSC + 3D leaf]
        Generator[Story Generator client]
        Progress[Generation Progress client]
        Microsite[Story Microsite RSC + 3D leaves]
        Share[Share Page RSC + 3D leaf]
    end

    App --> Landing
    App --> Generator
    App --> Progress
    App --> Microsite
    App --> Share

    Generator -->|POST /api/generate| GenAPI[Generation Route Handler]
    GenAPI --> Safety[Content Safety Filter]
    GenAPI --> Gemini[(Gemini 2.5 Flash)]
    GenAPI --> Validator[Zod Schema Validator + Repair]
    GenAPI --> DB[(Supabase Postgres)]

    Microsite -->|POST /api/narrate| NarrAPI[Narration Route Handler]
    NarrAPI --> Eleven[(ElevenLabs TTS)]
    Microsite -.fallback.-> WebSpeech[Browser Web Speech API]

    Share --> DB
    Microsite --> DB
    Generator -.optional.-> Clerk[(Clerk Auth)]
```

### Rendering & Degradation Strategy

Origin makes rendering decisions from three capability signals resolved on the client after hydration:

- `webglAvailable` — probed by attempting to acquire a WebGL context.
- `reducedMotion` — from `prefers-reduced-motion` (via Motion's `useReducedMotion`).
- `deviceTier` — a heuristic (`high` | `low`) from `navigator.hardwareConcurrency`, `deviceMemory`, and a first-frame timing sample.

A single pure function resolves these into a render mode per surface, guaranteeing mutual exclusivity (Requirement 1.7):

```
resolveRenderMode({ webglAvailable, reducedMotion, surfaceSupports3D }) -> "3d-full" | "3d-reduced" | "2d-fallback"
```

- No WebGL → `2d-fallback` (Requirements 1.4, 7.5, 15.3).
- WebGL + reduced motion → `2d-fallback` or `3d-reduced` with animation suppressed (Requirements 1.5, 14.3).
- WebGL + `deviceTier=low` → `3d-reduced` (fewer particles, no shadows, no post-processing) (Requirements 15.2, 15.5).
- Otherwise → `3d-full`.

All 3D scenes load through `next/dynamic` with `ssr: false` and a defined loading state, and are wrapped in Suspense so primary content paints first (Requirements 15.1, 15.4, 15.6). A shared `baseAnimationBudget` caps concurrent animations regardless of preference (Requirement 14.7).

### Generation Data Flow

```mermaid
sequenceDiagram
    participant C as Client (Generator)
    participant Q as TanStack Query
    participant G as /api/generate
    participant S as Content Safety
    participant AI as Gemini 2.5 Flash
    participant V as Zod Validator
    participant DB as Supabase

    C->>C: Assemble answers + requestId
    C->>Q: mutate(answers, requestId)
    Q->>G: POST /api/generate
    G->>G: Reject duplicate requestId if in-flight
    G->>S: screen(answers)
    alt unsafe (hate / illegal)
        S-->>G: refuse
        G-->>C: 422 refusal + message
    else safe
        G->>G: normalize (translate, summarize long answers)
        loop up to MAX_ATTEMPTS
            G->>AI: generate(prompt, responseSchema)
            AI-->>G: candidate JSON
            G->>V: validate(candidate)
            alt valid
                V-->>G: Story
            else invalid
                G->>AI: repair(prompt, errors)
            end
        end
        alt valid story produced
            G->>DB: insert Story_Record
            DB-->>G: recordId
            G-->>C: { recordId }
        else exhausted attempts
            G-->>C: 502 descriptive error
        end
    end
    C->>C: On success navigate to /story/{recordId}
```

### Route Map

| Route                | Type                         | Responsibility                                           |
| -------------------- | ---------------------------- | -------------------------------------------------------- |
| `/`                  | RSC                          | Landing page, hero CTA "Begin Journey"                   |
| `/create`            | Client                       | Story Generator multi-step flow                          |
| `/create/generating` | Client                       | Generation progress view (drives the mutation)           |
| `/story/[id]`        | RSC                          | Interactive story microsite (owner/preview view)         |
| `/s/[id]`            | RSC                          | Public share page (no auth)                              |
| `/stories`           | RSC (Clerk-gated)            | Authenticated user's saved stories                       |
| `/api/generate`      | Route Handler (Node runtime) | Orchestrates safety → Gemini → validate → persist        |
| `/api/narrate`       | Route Handler (Node runtime) | Proxies ElevenLabs streaming TTS                         |
| `/api/stories/[id]`  | Route Handler                | DELETE for account-owned records                         |
| `not-found.tsx`      | RSC                          | On-brand not-found for missing records (Requirement 7.6) |

`/api/generate` and `/api/narrate` use the Node runtime (not Edge) because they use the Gemini and ElevenLabs SDKs and the Supabase service-role client.

---

## Components and Interfaces

The system is organized into a **pure core** (framework-agnostic logic, fully unit- and property-testable), **services** (I/O adapters), and **UI** (RSC + client leaves).

### Pure Core (`src/lib/core/`)

These modules contain no React, network, or SDK imports. They are the primary target of property-based tests.

#### `render-mode.ts`

```ts
type Capability = {
	webglAvailable: boolean;
	reducedMotion: boolean;
	deviceTier: "high" | "low";
};
type RenderMode = "3d-full" | "3d-reduced" | "2d-fallback";

function resolveRenderMode(
	cap: Capability,
	surfaceSupports3D: boolean,
): RenderMode;
```

Guarantees exactly one mode; never returns a 3D mode when `webglAvailable` is false or `surfaceSupports3D` is false.

#### `input-classifier.ts`

```ts
type InputVerdict =
	| { kind: "ok" }
	| { kind: "needs-followup"; reason: "single-word" }
	| { kind: "needs-text"; reason: "emoji-only" };

function classifyAnswer(raw: string): InputVerdict;
function isEffectivelyEmpty(raw: string): boolean; // all-whitespace
function detectContradictions(answers: Answers): ContradictionFlag[];
```

Handles single-word (Requirement 9.1), emoji-only (9.2), empty/whitespace (2.5), and contradiction detection (9.4).

#### `answer-normalizer.ts`

```ts
function needsSummarization(text: string, max: number): boolean;
function prepareForGeneration(
	answers: Answers,
	cfg: NormalizeConfig,
): NormalizedAnswers;
```

Marks over-length answers for summarization (Requirement 9.3) and flags non-English answers for translation (Requirement 13.6).

#### `story-schema.ts`

The single Zod source of truth (`StorySchema`) plus derived TypeScript types and the Gemini `responseSchema` projection.

```ts
function validateStory(
	candidate: unknown,
): { ok: true; story: Story } | { ok: false; issues: ZodIssue[] };
function issuesToRepairHints(issues: ZodIssue[]): string;
```

#### `generation-policy.ts`

```ts
function nextAction(
	state: AttemptState,
): "call" | "repair" | "succeed" | "fail";
function shouldRetryRateLimit(attempt: number, max: number): boolean;
function backoffMs(attempt: number, base: number, cap: number): number;
```

Encodes the attempt/repair/backoff/exhaustion state machine (Requirements 4.4, 4.5, 4.7, 4.9, 4.10) as a pure reducer.

#### `poster-spec.ts`

```ts
function withPosterDefaults(spec: Partial<PosterSpec>): PosterSpec;
```

Fills any missing field with defined defaults so the poster always renders (Requirement 8.4).

#### `narration-selection.ts`

```ts
type Provider = "elevenlabs" | "webspeech" | "none";
function selectProvider(input: {
	elevenAvailable: boolean;
	webSpeechAvailable: boolean;
	userForcedWebSpeech: boolean;
}): Provider;
```

Encodes provider precedence and the manual Web Speech override (Requirements 10.1, 10.2, 10.6, 10.7).

#### `content-safety.ts`

```ts
type SafetyDecision =
	| { action: "allow" }
	| { action: "refuse"; category: "hate" | "illegal"; message: string }
	| { action: "sanitize"; category: "offensive" | "self-harm" | "copyright" };

function screenInput(answers: Answers): SafetyDecision;
```

Pre-generation screening (Requirements 13.1, 13.2); sanitize categories flow into prompt constraints rather than blocking.

#### `request-dedupe.ts`

```ts
function registerRequest(
	store: RequestStore,
	id: string,
): { accepted: boolean; store: RequestStore };
function resolveRequest(store: RequestStore, id: string): RequestStore;
```

In-flight request-id tracking (Requirements 6.2, 6.3).

#### `draft-codec.ts`

```ts
function encodeDraft(draft: Draft): string;
function decodeDraft(raw: string): { ok: true; draft: Draft } | { ok: false };
```

Serialize/deserialize the generator draft; `decode` never throws, returning `ok: false` on corruption (Requirement 3.7).

### Services (`src/lib/services/`)

Thin I/O adapters that compose the pure core with external systems.

- **`gemini-service.ts`** — wraps `@google/genai`. `generateStory(prompt, schema)` and `repairStory(prompt, hints)`. Distinguishes rate-limit errors so `generation-policy` can drive backoff.
- **`generation-orchestrator.ts`** — server-only. Runs safety → normalize → the `generation-policy` loop over `gemini-service` and `validateStory` → persist. Returns a discriminated result (`success | refusal | error`).
- **`narration-service.ts` (server)** — proxies ElevenLabs streaming; returns an audio stream. Reports availability for `selectProvider`.
- **`story-repository.ts`** — Supabase adapter: `insertStoryRecord`, `getStoryRecord`, `listStoriesForUser`, `deleteStoryRecord`. Anonymous inserts set `owner_id = null`.
- **`share-service.ts`** — builds the canonical share URL and QR payload; `insertStoryRecord` failure does not fail generation (Requirement 11.8).

### UI Components (`src/components/`)

Server Components by default; client leaves marked `"use client"`.

| Component                       | Kind                            | Notes                                                                                                       |
| ------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `sections/HeroLanding`          | RSC + `HeroScene3D` client leaf | CTA is a semantic `<Link>` button, keyboard-focusable (Requirements 1.1, 1.3, 1.6)                          |
| `generator/StepWizard`          | Client                          | Orchestrates 7 steps, progress indicator, back/next, RHF + Zod per step (Requirement 2.\*)                  |
| `generator/steps/*`             | Client                          | One component per Input_Step; Passion step includes custom entry (2.6, 2.7)                                 |
| `generator/useDraftPersistence` | Hook                            | Debounced write to `Draft_Store`; restore on mount (Requirement 3.\*)                                       |
| `progress/GenerationProgress`   | Client                          | Drives the TanStack Query mutation; energy-sphere 3D or reduced indicator; error + retry (Requirement 5.\*) |
| `story/StorySections`           | RSC                             | Renders Hero/Story/Timeline/Character/Poster/Quotes/Future/Share from the record (Requirement 7.1)          |
| `story/CharacterCard3D`         | Client leaf                     | Holographic tilt card; 2D fallback + error placeholder (7.4, 7.5, 7.8)                                      |
| `story/PosterRenderer`          | Client leaf                     | SVG/Canvas render + PNG export (Requirement 8.\*)                                                           |
| `story/NarrationControls`       | Client leaf                     | Provider selection, voice choice, play/pause (Requirement 10.\*)                                            |
| `share/SharePanel`              | Client leaf                     | QR, copy story, social targets, PNG download (Requirement 11.\*)                                            |
| `shared/FallbackScene`          | Client                          | Polished 2D hero used across surfaces (Requirements 1.4, 15.3)                                              |
| `shared/CapabilityProvider`     | Client context                  | Resolves capability signals once, exposes `RenderMode` per surface                                          |

### API Contracts

**`POST /api/generate`**

```ts
// Request
{ requestId: string; answers: Answers }
// Responses
200 { recordId: string; shareUrl: string | null }        // shareUrl null => Requirement 11.8
422 { error: "refused"; category: "hate" | "illegal"; message: string }
502 { error: "generation_failed"; message: string }      // Requirements 4.7, 4.10
409 { error: "duplicate"; requestId: string }             // Requirement 6.3
```

**`POST /api/narrate`**

```ts
// Request
{
	recordId: string;
	voice: "male" | "female";
	text: string;
}
// Response: audio/mpeg stream, or 503 when ElevenLabs unavailable (client falls back)
```

**`DELETE /api/stories/[id]`** — Clerk-authenticated; removes the record from the user's saved stories (Requirement 12.5).

---

## Data Models

### Answers (client input)

```ts
interface Answers {
	name: string;
	profession: string;
	country?: string;
	passion: string; // predefined or custom text
	originMoment: string;
	lowestPoint: string;
	turningPoint: string;
	dream: string;
	oneSentence: string;
}
```

Per-step Zod schemas back React Hook Form; required text fields reject all-whitespace values.

### Story (Gemini output, Zod-validated)

`StorySchema` is the trust boundary. The Gemini `responseSchema` mirrors it; Zod re-validates after decoding.

```ts
const PosterSpecSchema = z.object({
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

const TimelineStageSchema = z.object({
	key: z.enum(["beginning", "failure", "breakthrough", "today", "future"]),
	title: z.string(),
	body: z.string(),
});

const CharacterProfileSchema = z.object({
	mission: z.string(),
	strengths: z.array(z.string()).min(1),
	weaknesses: z.array(z.string()).min(1),
	motivation: z.string(),
	coreValues: z.array(z.string()).min(1),
});

const SocialAssetsSchema = z.object({
	linkedin: z.string(),
	twitterThread: z.array(z.string()).min(1),
	instagram: z.string(),
	portfolioBio: z.string(),
	resumeSummary: z.string(),
});

const StorySchema = z.object({
	heroTitle: z.string().min(1),
	tagline: z.string().min(1),
	originStory: z.string().refine((s) => {
		const words = s.trim().split(/\s+/).length;
		return words >= 1000 && words <= 1500;
	}, "originStory must be 1000-1500 words"),
	timeline: z.array(TimelineStageSchema).length(5),
	character: CharacterProfileSchema,
	quote: z.string().min(1),
	trailerScript: z.string().min(1),
	social: SocialAssetsSchema,
	poster: PosterSpecSchema,
	inferredContent: z.array(z.string()).default([]), // labels non-user-provided content (Requirement 4.8)
});

type Story = z.infer<typeof StorySchema>;
```

The word-count refinement enforces Requirement 4.2; a failure produces a Zod issue that `issuesToRepairHints` turns into a targeted repair instruction.

### Story_Record (Supabase `stories`)

```sql
create table stories (
  id           uuid primary key default gen_random_uuid(),
  owner_id     text,                       -- Clerk user id; null for anonymous
  slug         text unique not null,       -- short public share id
  answers      jsonb not null,             -- source of truth for regeneration/audit
  story        jsonb not null,             -- validated Story
  created_at   timestamptz not null default now()
);

create index stories_owner_id_idx on stories (owner_id);
```

- Public reads by `slug` are allowed via RLS for the share/microsite pages (Requirements 11.2, 12.2).
- Writes go through the service-role client in route handlers; account-scoped list/delete filter on `owner_id` (Requirements 12.3–12.5).

### Draft (local storage)

```ts
interface Draft {
	answers: Partial<Answers>;
	activeStep: number; // 0..6
	updatedAt: number;
}
```

Stored under a stable key. Writes are debounced on change (Requirement 3.1); reads decode defensively (Requirement 3.7); a successful generation clears the key (Requirement 3.5), and clear failures are swallowed (Requirement 3.6).

### AttemptState (generation policy)

```ts
interface AttemptState {
	attempt: number; // 0-based
	maxAttempts: number;
	lastOutcome: "none" | "invalid" | "rate-limited" | "valid";
	hasValidStory: boolean;
}
```

Consumed by `nextAction`/`backoffMs` to drive the orchestrator loop deterministically.
