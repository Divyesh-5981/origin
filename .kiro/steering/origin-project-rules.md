---
inclusion: always
---

# Origin — Project Working Agreement

These rules apply to every conversation and every task on the Origin project. Read and honor them before starting any work.

## Project Context

- **Product**: Origin — transforms personal answers into a cinematic, interactive origin story (premium microsite: hero story, timeline, character profile, movie poster, voice narration, shareable site).
- **Competition**: DEV Weekend Challenge: Passion Edition. Goal is to win.
- **Source of truth**: `PRD.md` (product) and `HACKATHON_DETAILS.md` (rules, deadlines, judging).
- **Judging criteria to optimize for**: Relevance to Theme, Creativity, Technical Execution, Writing Quality, and (optional) meaningful use of a prize-category technology (Snowflake, Solana, ElevenLabs, Google AI). Google AI (Gemini) is already core to the product.

## 1. Pre-Development Planning

- Every feature starts from an analysis tied back to the PRD and the hackathon judging criteria.
- Scope each effort to what is realistically achievable and demo-ready within the hackathon window.
- Prioritize work that maximizes judged value: implementation polish and presentation/UX carry heavy weight.

## 2. Coding Conventions & Tech Stack

- Follow industry-leading best practices at all times (see the global steering rules for tech stack, code standards, theming, animations, and hackathon patterns).
- Source technical skill references from Vercel's skills ecosystem (`npx skills find ...`). Only adopt tools, libraries, or frameworks with **over 100,000 downloads** and strong, active community adoption.
- When blocked, use web search to find robust, long-term sustainable solutions — never temporary patches. Do a short comparative analysis and pick the most reliable option for the product's lifecycle.
- Mandatory stack (no substitutions): Next.js App Router + TypeScript (strict), Tailwind CSS, shadcn/ui, Motion (framer-motion via `motion/react`), Lucide icons, pnpm, deploy to Vercel. 3D via Three.js + React Three Fiber + Drei. AI via Google Gemini. Forms via React Hook Form + Zod. State via Zustand. Server state via TanStack Query.
- TypeScript strict mode; never use `any`. Self-documenting code; no explanatory comments.

## 3. Post-Task Code Review (Senior Engineer + Strict Mentor Persona)

After completing each individual development task, conduct a rigorous code review as a senior software engineer and strict, growth-focused mentor:

- Identify and eliminate every code smell and anti-pattern (god components, prop drilling, magic numbers, dead code, `useEffect` for derived state, client components for static content, etc.).
- Verify accessibility (WCAG AA, reduced motion, keyboard nav, semantic HTML).
- Verify performance (Server Components first, lazy-load heavy 3D, transform/opacity-only animations, no layout shift).
- Confirm the build compiles and relevant tests pass before declaring a task done.
- Only pass the review when the code meets competitive, production-grade standards.

## 4. Documentation & Explanation (After Each Task)

After each task and its code review, provide a clear, friendly explanation that:

- Summarizes what was accomplished.
- Details the best coding practices applied during the task.
- Explains technical decisions in approachable, accessible language.

## Definition of Done (per task)

1. Feature works and matches the spec/PRD intent.
2. Code review completed; all smells/anti-patterns resolved.
3. Build compiles, no TypeScript errors, relevant tests pass.
4. Accessibility and performance checks pass.
5. Friendly explanation of the work and practices provided.
