## Product

# Origin

**Tagline**

> Every passion has a beginning. Tell yours like a movie.

---

# Vision

Origin transforms a few personal answers into a **cinematic, interactive origin story** that feels like the opening sequence of a movie.

Instead of receiving plain AI-generated text, users receive a premium microsite with:

- Hero story
- Interactive timeline
- Character profile
- Movie poster
- Voice narration
- Shareable website

Everything is generated using **100% free tools**.

---

# Problem

Current AI writing tools generate text.

They don't create an experience.

People want to proudly share their story—not copy paragraphs into social media.

---

# Target Users

- Developers
- Open Source Contributors
- Students
- Founders
- Designers
- Artists
- Athletes
- Gamers
- Writers
- Hackathon Participants

---

# Goals

### Primary

Create the most beautiful AI-powered storytelling experience possible.

### Secondary

Generate content people immediately want to share.

---

# MVP Scope

Everything below is achievable in a weekend.

✅ Landing Page

✅ Story Generator

✅ Interactive Story Website

✅ AI Poster

✅ Character Card

✅ Timeline

✅ Voice Narration

✅ Share Page

---

# User Flow

```text
Landing

↓

Begin Journey

↓

Conversational Questions

↓

AI Analysis

↓

Generation Animation

↓

Interactive Story

↓

Share
```

---

# User Input

## Step 1

Basic Information

Name

Profession

Country (optional)

---

## Step 2

Choose Passion

Programming

Photography

Music

Football

Gaming

Teaching

Cooking

Writing

Fitness

Custom

---

## Step 3

Origin Moment

"What first made you love it?"

---

## Step 4

Lowest Point

"What almost made you quit?"

---

## Step 5

Turning Point

"What changed everything?"

---

## Step 6

Dream

"What are you building toward?"

---

## Step 7

One Sentence

"Describe yourself."

---

# AI Pipeline

```text
User Answers

↓

Gemini Flash

↓

Extract

• Themes
• Emotions
• Milestones
• Hero Journey

↓

Generate

↓

Structured JSON

↓

UI Renderer
```

---

# AI Output

## Hero Title

Example

"The Engineer Who Refused To Quit"

---

## Tagline

"Dreams survive where excuses don't."

---

## Origin Story

1000–1500 words.

---

## Timeline

Beginning

↓

Failure

↓

Breakthrough

↓

Today

↓

Future

---

## Character Profile

Mission

Strengths

Weaknesses

Motivation

Core Values

---

## AI Quote

Example

> Small victories become legends when nobody quits.

---

## Movie Trailer Script

60-second narration.

---

## Social Assets

LinkedIn About

Twitter Thread

Instagram Caption

Portfolio Bio

Resume Summary

---

# Interactive Story Website

Sections

```text
Hero

↓

Story

↓

Timeline

↓

Character

↓

Poster

↓

Quotes

↓

Future

↓

Share
```

---

# 3D Experience (Free)

## Landing

Three.js particle galaxy.

Floating glowing memories.

Mouse interaction.

---

## Question Pages

Floating holographic cards.

Animated camera movement.

Smooth lighting.

---

## Generation

Floating energy sphere.

Story fragments orbit around it.

Progress animation.

---

## Story Page

3D timeline.

Camera moves while scrolling.

Particles react to scrolling.

---

## Character Card

Floating holographic trading card.

Mouse tilt.

Reflection.

Glow.

---

## Poster

Museum-style gallery.

Soft lighting.

Animated pedestal.

---

## Share Page

Floating trophy.

Celebration particles.

Confetti.

---

# Three.js Stack

Everything below is free.

- Three.js
- React Three Fiber
- Drei
- React Three Postprocessing
- Rapier Physics
- Motion

---

# Voice

Use Browser Speech API.

Advantages

- Completely free
- No API key
- No server cost
- Works in modern browsers

Users can choose

- Male
- Female

(depending on browser voices)

---

# Posters

Instead of paid image generation:

Gemini generates a **structured design specification**.

Example:

```json
{
	"theme": "Cyberpunk",
	"background": "Purple Nebula",
	"title": "The Builder",
	"subtitle": "Every dream begins somewhere.",
	"primaryColor": "#7C3AED",
	"secondaryColor": "#38BDF8",
	"accent": "#FACC15",
	"layout": "Centered",
	"decorations": ["Stars", "Particles", "Circuit Lines"]
}
```

The frontend renders the poster using:

- SVG
- HTML
- CSS
- Canvas

Result:

Unlimited poster generation.

Zero cost.

Instant.

---

# Share

Users receive

```
Public URL

↓

QR Code

↓

Download PNG

↓

Copy Story

↓

Share
```

---

# Accessibility

Keyboard navigation.

Reduced motion.

Screen reader labels.

High contrast.

Responsive.

---

# Performance

Lazy load Three.js scenes.

Dynamic imports.

Image optimization.

Suspense boundaries.

Streaming UI.

---

# Edge Cases

| Case                              | Solution                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Empty form                        | Disable generation until required fields are complete.                                   |
| One-word answers                  | Ask one contextual follow-up question.                                                   |
| Very long answers                 | Summarize before generation.                                                             |
| Contradicting answers             | Highlight inconsistencies and allow edits.                                               |
| Multiple passions                 | Let the user choose a primary passion or generate multiple chapters.                     |
| Unsupported language              | Detect language and translate internally using Gemini before generation.                 |
| Emoji-only input                  | Ask for a text description.                                                              |
| Offensive language                | Sanitize output and avoid amplifying abuse.                                              |
| Hate or extremist requests        | Refuse generation.                                                                       |
| Self-harm or suicide themes       | Respond safely without romanticizing or celebrating.                                     |
| Illegal achievements              | Refuse celebratory storytelling.                                                         |
| Copyright requests                | Create original content; don't imitate protected works.                                  |
| Network interruption              | Save draft to local storage and restore automatically.                                   |
| Browser without WebGL             | Fall back to a polished 2D interface.                                                    |
| Low-end devices                   | Reduce particles, shadows, and post-processing automatically.                            |
| Mobile landscape/portrait changes | Preserve progress and camera state.                                                      |
| Multiple Generate clicks          | Use request IDs and disable duplicate submissions.                                       |
| Gemini rate limit                 | Queue the request, show progress, and retry with exponential backoff.                    |
| AI returns invalid JSON           | Validate against a schema and retry automatically with a repair prompt.                  |
| AI hallucinates facts             | Restrict generation to user-provided information and clearly label any inferred content. |
| Browser lacks Speech API          | Hide narration controls and offer the script instead.                                    |
| Offline after starting            | Cache answers locally and resume when connectivity returns.                              |

---

# Tech Stack (100% Free)

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Framework        | Next.js 16 (React 19 + TypeScript)             |
| Styling          | Tailwind CSS v4                                |
| UI Components    | shadcn/ui                                      |
| 3D               | Three.js                                       |
| React 3D         | React Three Fiber                              |
| Helpers          | Drei                                           |
| Animations       | Motion                                         |
| Physics          | Rapier                                         |
| Post Processing  | React Three Postprocessing                     |
| Forms            | React Hook Form + Zod                          |
| State            | Zustand                                        |
| Server State     | TanStack Query                                 |
| AI               | Google Gemini 2.5 Flash (AI Studio free quota) |
| Database         | Supabase Free                                  |
| Authentication   | Clerk Free                                     |
| Storage          | Supabase Storage Free                          |
| Voice            | Browser Web Speech API                         |
| Poster Rendering | SVG + HTML Canvas                              |
| Analytics        | PostHog Free                                   |
| Error Monitoring | Sentry Free                                    |
| Deployment       | Vercel Free                                    |
| Icons            | Lucide React                                   |
| Fonts            | Geist + Google Fonts                           |

---

# System Architecture

```text
                Browser
                    │
                    ▼
        Next.js 16 Application
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Three.js Experience      App Router
        │                       │
        └───────────┬───────────┘
                    ▼
            API Route (/generate)
                    │
                    ▼
        Gemini 2.5 Flash (JSON)
                    │
                    ▼
         Zod Validation & Repair
                    │
                    ▼
        Persist to Supabase
                    │
                    ▼
        Render Interactive Story
```

---

# Why This Can Win

The differentiator isn't the AI model—it's the presentation.

Instead of giving users a document, **Origin** gives them an experience:

- An immersive **3D cinematic interface**.
- AI outputs rendered as a polished interactive microsite rather than plain text.
- Zero-cost architecture using free tiers and browser capabilities.
- A focused scope that can realistically be completed over a weekend while delivering a memorable demo and strong DEV article.
