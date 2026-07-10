# Implementation Plan: Origin

## Overview

This plan converts the Origin design into incremental, test-driven coding steps. It builds the framework-agnostic **pure core** first (fully unit- and property-testable), layers **services** (Gemini, Supabase, ElevenLabs, share) on top, exposes **API route handlers**, and finally assembles the **UI** (RSC pages + client leaves) and wires the demo-critical flow (Landing → Generator → Progress → Microsite → Share) end to end.

The 23 correctness properties from the design are each implemented as a single `fast-check` property test (minimum 100 iterations) placed next to the module it validates. Test sub-tasks are marked optional with `*` and can be skipped for a faster MVP, but core implementation tasks are mandatory.

Stack: Next.js (App Router) + TypeScript strict, Tailwind + shadcn/ui, Motion, Three.js/R3F/Drei, React Hook Form + Zod, Zustand, TanStack Query, Gemini 2.5 Flash, Supabase, Clerk, ElevenLabs, Vitest + fast-check. Package manager: pnpm.

## Tasks

- [x] 1. Project foundation and shared contracts
  - [x] 1.1 Initialize Next.js App Router project and mandatory stack
    - Scaffold `src/` App Router project with TypeScript strict mode and `@/*` import alias
    - Install and configure Tailwind, shadcn/ui, Motion, Lucide, next-themes, TanStack Query, Zustand, RHF + Zod
    - Define the Origin theme design tokens in `src/app/globals.css` (HSL tokens + dark mode) and base layout/providers
    - _Requirements: 14.4, 14.5_

  - [x] 1.2 Set up the testing toolchain
    - Configure Vitest for TS/Next, add React Testing Library, add `fast-check`
    - Add `test` and `tsc --noEmit` scripts; create a sample passing test to verify the runner
    - _Requirements: 4.2, 4.3_

  - [x] 1.3 Define shared types and configuration
    - Create `src/types` (`Answers`, `Draft`, `RenderMode`, `Capability`, `Provider`, `AttemptState`, `PosterSpec`, API request/response types)
    - Create `src/config` constants (`MAX_ATTEMPTS`, backoff base/cap, max answer length, `baseAnimationBudget`, draft storage key, passion options)
    - _Requirements: 2.1, 4.2, 6.2, 9.3, 14.7_

- [x] 2. Pure core — rendering, capability, and accessibility budgets
  - [x] 2.1 Implement `src/lib/core/render-mode.ts`
    - Implement `resolveRenderMode(cap, surfaceSupports3D)` returning exactly one of `3d-full | 3d-reduced | 2d-fallback`
    - Guarantee no 3D mode when `webglAvailable` is false or the surface does not support 3D; reduced motion never yields `3d-full`; low tier with WebGL yields `3d-reduced`
    - _Requirements: 1.2, 1.4, 1.5, 1.7, 7.4, 7.5, 11.7, 15.2, 15.3_

  - [ ]\* 2.2 Write property test for render-mode single-valued safety
    - **Property 1: Render mode is single-valued and never 3D without capability**
    - **Validates: Requirements 1.2, 1.4, 1.7, 7.4, 7.5, 11.7, 15.3**

  - [ ]\* 2.3 Write property test for capability degradation
    - **Property 2: Capability degrades to reduced or fallback**
    - **Validates: Requirements 1.5, 14.3, 15.2**

  - [x] 2.4 Implement contrast and animation-budget utilities
    - Add `src/lib/core/theme-contrast.ts` computing WCAG contrast ratio for token pairs (>= 4.5:1 body, >= 3:1 large)
    - Add `src/lib/core/animation-budget.ts` resolving concurrent non-essential animations capped at `baseAnimationBudget` for any motion preference
    - _Requirements: 14.4, 14.7_

  - [ ]\* 2.5 Write property test for contrast thresholds
    - **Property 22: Text contrast meets accessibility thresholds**
    - **Validates: Requirements 14.4**

  - [ ]\* 2.6 Write property test for animation budget
    - **Property 23: Concurrent animations respect the baseline budget**
    - **Validates: Requirements 14.7**

- [x] 3. Pure core — input classification, normalization, and step navigation
  - [x] 3.1 Implement `src/lib/core/input-classifier.ts`
    - Implement `classifyAnswer` (`ok | needs-followup:single-word | needs-text:emoji-only`), `isEffectivelyEmpty` (all-whitespace/empty), and `detectContradictions(answers)`
    - _Requirements: 2.5, 9.1, 9.2, 9.4_

  - [ ]\* 3.2 Write property test for empty-input detection
    - **Property 4: Empty required input blocks advancing**
    - **Validates: Requirements 2.5**

  - [ ]\* 3.3 Write property test for single-word classification
    - **Property 15: Single-word answers require a follow-up**
    - **Validates: Requirements 9.1**

  - [ ]\* 3.4 Write property test for emoji-only classification
    - **Property 16: Emoji-only answers require a text description**
    - **Validates: Requirements 9.2**

  - [x] 3.5 Implement `src/lib/core/answer-normalizer.ts`
    - Implement `needsSummarization(text, max)` and `prepareForGeneration(answers, cfg)` (mark over-length for summarization bounded by max; flag non-English answers for translation)
    - _Requirements: 9.3, 13.6_

  - [ ]\* 3.6 Write property test for over-length summarization
    - **Property 17: Over-length answers are summarized and bounded**
    - **Validates: Requirements 9.3**

  - [x] 3.7 Implement `src/lib/core/generator-nav.ts`
    - Implement pure step navigation (`advance`, `back`, `activeStepType`) bounded to 7 steps, custom-passion acceptance, and `canGenerate(answers)`
    - _Requirements: 2.2, 2.3, 2.7, 2.8, 2.9, 2.10_

  - [ ]\* 3.8 Write property test for step navigation consistency
    - **Property 3: Step navigation is consistent and bounded**
    - **Validates: Requirements 2.2, 2.3, 2.9, 2.10**

  - [ ]\* 3.9 Write property test for custom passion acceptance
    - **Property 5: Custom passion is accepted verbatim**
    - **Validates: Requirements 2.7**

  - [ ]\* 3.10 Write property test for generation-enabled gating
    - **Property 6: Generation enabled iff all answers valid**
    - **Validates: Requirements 2.8**

- [x] 4. Pure core — story schema, generation policy, and request dedupe
  - [x] 4.1 Implement `src/lib/core/story-schema.ts`
    - Define `StorySchema` (hero title, tagline, 1000–1500 word originStory refinement, 5 timeline stages, character profile, quote, trailer script, social assets, poster spec, inferredContent) and derived types
    - Implement `validateStory(candidate)`, `issuesToRepairHints(issues)`, and the Gemini `responseSchema` projection
    - _Requirements: 4.2, 4.3, 4.8_

  - [ ]\* 4.2 Write property test for schema validation
    - **Property 8: Story schema validation enforces structure and word count**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 4.3 Implement `src/lib/core/generation-policy.ts`
    - Implement `nextAction(state)` (`call | repair | succeed | fail`), `shouldRetryRateLimit(attempt, max)`, `backoffMs(attempt, base, cap)` as a pure reducer
    - _Requirements: 4.4, 4.5, 4.7, 4.9, 4.10_

  - [ ]\* 4.4 Write property test for generation-policy transitions
    - **Property 9: Generation policy transitions are correct and terminal**
    - **Validates: Requirements 4.4, 4.7, 4.9, 4.10**

  - [ ]\* 4.5 Write property test for rate-limit backoff
    - **Property 10: Rate-limit backoff is monotonic, capped, and bounded by max attempts**
    - **Validates: Requirements 4.5**

  - [x] 4.6 Implement `src/lib/core/request-dedupe.ts`
    - Implement `registerRequest(store, id)` and `resolveRequest(store, id)` tracking in-flight request identifiers
    - _Requirements: 6.2, 6.3_

  - [ ]\* 4.7 Write property test for duplicate request rejection
    - **Property 11: Duplicate in-flight requests are ignored**
    - **Validates: Requirements 6.3**

- [x] 5. Pure core — safety, poster, narration, draft, and share helpers
  - [x] 5.1 Implement `src/lib/core/content-safety.ts`
    - Implement `screenInput(answers)` returning `allow | refuse(hate|illegal) | sanitize(offensive|self-harm|copyright)`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]\* 5.2 Write property test for input safety classification
    - **Property 21: Unsafe input is classified into the correct action**
    - **Validates: Requirements 13.1, 13.2, 13.4**

  - [x] 5.3 Implement `src/lib/core/poster-spec.ts`
    - Implement `withPosterDefaults(spec)` filling every missing field with defined defaults
    - _Requirements: 8.4_

  - [ ]\* 5.4 Write property test for poster defaulting
    - **Property 14: Poster defaulting fills every missing field**
    - **Validates: Requirements 8.4**

  - [x] 5.5 Implement `src/lib/core/narration-selection.ts`
    - Implement `selectProvider({ elevenAvailable, webSpeechAvailable, userForcedWebSpeech })` encoding precedence and manual override
    - _Requirements: 10.1, 10.2, 10.6, 10.7_

  - [ ]\* 5.6 Write property test for narration provider precedence
    - **Property 18: Narration provider precedence and override**
    - **Validates: Requirements 10.1, 10.2, 10.6, 10.7**

  - [x] 5.7 Implement `src/lib/core/draft-codec.ts`
    - Implement `encodeDraft(draft)` and total `decodeDraft(raw)` that never throws and returns `{ ok: false }` on corruption
    - _Requirements: 3.2, 3.7_

  - [ ]\* 5.8 Write property test for draft codec round-trip and totality
    - **Property 7: Draft codec round-trips and decodes total**
    - **Validates: Requirements 3.2, 3.7**

  - [x] 5.9 Implement `src/lib/core/share-links.ts`
    - Implement canonical share-URL builder, QR payload encoder/decoder, and social share-intent URL construction with percent-encoding
    - _Requirements: 11.3, 11.6_

  - [ ]\* 5.10 Write property test for QR round-trip
    - **Property 19: QR code round-trips the share URL**
    - **Validates: Requirements 11.3**

  - [ ]\* 5.11 Write property test for social share intents
    - **Property 20: Social share intents embed the encoded share URL**
    - **Validates: Requirements 11.6**

- [ ] 6. Checkpoint - pure core complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Services layer (I/O adapters)
  - [ ] 7.1 Implement `src/lib/services/gemini-service.ts`
    - Wrap `@google/genai` with `generateStory(prompt, schema)` and `repairStory(prompt, hints)`; distinguish rate-limit errors for backoff
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ] 7.2 Implement `src/lib/services/story-repository.ts`
    - Supabase adapter with `insertStoryRecord` (anonymous `owner_id = null`), `getStoryRecord`, `listStoriesForUser`, `deleteStoryRecord`; include SQL/migration for the `stories` table and RLS
    - _Requirements: 4.6, 11.2, 12.2, 12.3, 12.4, 12.5_

  - [ ] 7.3 Implement `src/lib/services/generation-orchestrator.ts`
    - Compose safety screen → normalize → the `generation-policy` loop over `gemini-service` + `validateStory` → persist; return discriminated `success | refusal | error`; enforce success-path-only persistence
    - _Requirements: 4.1, 4.4, 4.6, 4.7, 4.9, 4.10, 9.3, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]\* 7.4 Write integration test for the orchestrator
    - Mock Gemini + Supabase; assert happy path generates with schema, persists, returns record id; refusal and exhaustion produce correct discriminated results
    - _Requirements: 4.1, 4.6, 4.7_

  - [ ] 7.5 Implement `src/lib/services/narration-service.ts`
    - Server-only ElevenLabs streaming proxy returning an audio stream; report availability for provider selection
    - _Requirements: 10.1, 10.2_

  - [ ] 7.6 Implement `src/lib/services/share-service.ts`
    - Compose `share-links` helpers with the record; ensure share-URL creation failure does not fail generation (returns `shareUrl: null`)
    - _Requirements: 11.1, 11.8_

- [ ] 8. API route handlers
  - [ ] 8.1 Implement `POST /api/generate`
    - Node-runtime handler: reject duplicate in-flight `requestId` (409), run orchestrator, return `200 { recordId, shareUrl }`, `422` refusal, `502` generation failure
    - _Requirements: 4.1, 4.6, 4.7, 4.10, 6.2, 6.3, 11.1, 11.8_

  - [ ]\* 8.2 Write integration test for `/api/generate`
    - Assert 200/422/502/409 branches and `shareUrl: null` on share failure using mocked services
    - _Requirements: 4.6, 4.7, 6.3, 11.8_

  - [ ] 8.3 Implement `POST /api/narrate`
    - Node-runtime handler proxying ElevenLabs streaming TTS with voice selection; return `503` when unavailable so the client falls back
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 8.4 Implement `DELETE /api/stories/[id]`
    - Clerk-authenticated handler removing an account-owned record
    - _Requirements: 12.5_

- [ ] 9. Checkpoint - backend and services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Capability provider and shared rendering surfaces
  - [ ] 10.1 Implement `CapabilityProvider` context and hooks
    - Probe `webglAvailable`, `reducedMotion`, and `deviceTier` once after hydration; expose per-surface `RenderMode` via `resolveRenderMode`
    - _Requirements: 1.2, 1.5, 15.2, 15.5_

  - [ ] 10.2 Implement `shared/FallbackScene` 2D hero
    - Polished 2D fallback used across Landing, Character, and Share surfaces
    - _Requirements: 1.4, 7.5, 15.3_

  - [ ] 10.3 Implement dynamic 3D scene loader wrappers
    - `next/dynamic` (`ssr: false`) + Suspense + error boundary wrappers with defined loading states so primary content paints first and 3D loads independently
    - _Requirements: 15.1, 15.4, 15.6_

- [ ] 11. Landing page
  - [ ] 11.1 Implement Landing RSC with `HeroLanding` and `HeroScene3D` leaf
    - Render product name, tagline, keyboard-focusable/activatable "Begin Journey" CTA linking to the generator; render exactly one of 3D hero or 2D fallback
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 14.1, 14.2_

  - [ ]\* 11.2 Write component test for the landing page
    - Assert CTA presence, accessible name, keyboard activation, and single-render-mode behavior
    - _Requirements: 1.1, 1.3, 1.6_

- [ ] 12. Story generator flow
  - [ ] 12.1 Implement `StepWizard` and seven step components
    - Orchestrate 7 ordered steps with progress indicator and back/next wired to `generator-nav`; RHF + per-step Zod; disabled advance on empty required fields; Passion step with predefined + custom entry; enable generation when all valid
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 14.6_

  - [ ] 12.2 Implement `useDraftPersistence` hook
    - Debounced write to `Draft_Store` on change; restore answers + active step on mount; notify and start fresh on corrupted draft; clear on success and swallow clear failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 12.3 Implement follow-up and contradiction handling UI
    - Prompt one contextual follow-up for single-word answers, prompt for text on emoji-only, and surface contradiction flags with edit affordances via `input-classifier`
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ]\* 12.4 Write component tests for the generator
    - Assert step list/position, custom passion entry, draft restore, corrupted-draft recovery, and follow-up/contradiction prompts
    - _Requirements: 2.1, 2.4, 2.6, 3.6, 3.7, 9.4_

- [ ] 13. Generation progress experience
  - [ ] 13.1 Implement `GenerationProgress` client
    - Drive the TanStack Query mutation to `/api/generate`; disable the generation control until resolve and while duplicates are ignored; animated (or reduced) progress; navigate to the microsite on success; error + retry; inline fallback/link if navigation fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4_

  - [ ]\* 13.2 Write component test for the progress view
    - Assert progress render, disabled control on submit, error + retry control, and reduced-motion indicator behavior
    - _Requirements: 5.1, 5.3, 5.4, 6.1_

- [ ] 14. Interactive story microsite
  - [ ] 14.1 Implement Story microsite RSC, `StorySections`, and not-found
    - Render Hero/Story/Timeline/Character/Poster/Quotes/Future/Share from a valid record; render no story text or timeline without a valid record; add on-brand `not-found.tsx` with a Return-to-Landing control
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7_

  - [ ]\* 14.2 Write property test for microsite render completeness
    - **Property 12: Microsite render completeness is gated by a valid record**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.7**

  - [ ] 14.3 Implement `CharacterCard3D` with fallback and error placeholder
    - Holographic tilt card when capability allows; 2D fallback otherwise; error placeholder if the fallback fails
    - _Requirements: 7.4, 7.5, 7.8_

  - [ ] 14.4 Implement `PosterRenderer`
    - Render poster from spec via SVG/Canvas applying theme/colors/title/subtitle/layout/decorations with `withPosterDefaults`; PNG export; error message with suppressed download on failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]\* 14.5 Write property test for poster reflecting its specification
    - **Property 13: Poster reflects its specification**
    - **Validates: Requirements 8.2**

  - [ ] 14.6 Implement `NarrationControls`
    - Provider selection via `selectProvider` (ElevenLabs → Web Speech), male/female voice choice, play/pause; manual Web Speech override; hide controls and show trailer script when no provider
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 15. Share page
  - [ ] 15.1 Implement Share page RSC and `SharePanel`
    - Public no-auth render from persisted record; QR code, copy-story, social share targets, PNG download; celebratory 3D hero when capability allows
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ]\* 15.2 Write component test for the share page
    - Assert unauthenticated render, QR display, copy-to-clipboard, social intent targets, and PNG download availability
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [ ] 16. Optional accounts (guest-first)
  - [ ] 16.1 Integrate Clerk and the saved-stories page
    - Guest generation without auth; associate new records with authenticated users; `/stories` RSC listing saved records with delete wired to `DELETE /api/stories/[id]`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]\* 16.2 Write integration test for the account flow
    - Assert anonymous vs authenticated insert, list, and delete against a test Supabase instance
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 17. Final checkpoint - full demo flow
  - Ensure all tests pass and the Landing → Generator → Progress → Microsite → Share flow is wired end to end; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP; all other tasks are mandatory.
- Each of the 23 correctness properties is its own sub-task, annotated with its property number and the requirements it validates, placed next to the module it exercises so failures surface early.
- Property tests use `fast-check` with a minimum of 100 iterations and reference the design property in a `// Feature: origin, Property {n}` comment.
- UI presence, navigation, persistence, and external-service wiring are covered by example/integration tests rather than property tests, matching the design's Testing Strategy.
- Checkpoints (tasks 6, 9, 17) provide incremental validation between the core, backend, and UI phases.

## Task Dependency Graph

```json
{
	"waves": [
		{ "id": 0, "tasks": ["1.1"] },
		{ "id": 1, "tasks": ["1.2", "1.3"] },
		{
			"id": 2,
			"tasks": [
				"2.1",
				"2.4",
				"3.1",
				"3.5",
				"3.7",
				"4.1",
				"4.3",
				"4.6",
				"5.1",
				"5.3",
				"5.5",
				"5.7",
				"5.9"
			]
		},
		{
			"id": 3,
			"tasks": [
				"2.2",
				"2.3",
				"2.5",
				"2.6",
				"3.2",
				"3.3",
				"3.4",
				"3.6",
				"3.8",
				"3.9",
				"3.10",
				"4.2",
				"4.4",
				"4.5",
				"4.7",
				"5.2",
				"5.4",
				"5.6",
				"5.8",
				"5.10",
				"5.11",
				"7.1",
				"7.2",
				"7.5",
				"7.6",
				"10.1",
				"10.2",
				"10.3"
			]
		},
		{
			"id": 4,
			"tasks": [
				"7.3",
				"8.3",
				"8.4",
				"11.1",
				"12.1",
				"12.2",
				"14.1",
				"14.3",
				"14.4",
				"15.1",
				"16.1"
			]
		},
		{
			"id": 5,
			"tasks": [
				"7.4",
				"8.1",
				"12.3",
				"14.6",
				"11.2",
				"14.2",
				"14.5",
				"15.2",
				"16.2"
			]
		},
		{ "id": 6, "tasks": ["8.2", "13.1", "12.4"] },
		{ "id": 7, "tasks": ["13.2"] }
	]
}
```
