import "server-only";
import type { Answers } from "@/types";
import type { Story } from "@/lib/core/story-schema";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyzedAnswer {
  raw: string;
  sentences: string[];
  keywords: string[];
  emotionalTone: Emotion;
  wordCount: number;
}

type Emotion =
  | "hopeful"
  | "struggling"
  | "triumphant"
  | "reflective"
  | "determined"
  | "nostalgic";

interface StoryAnalysis {
  name: string;
  profession: string;
  country: string;
  passion: string;
  origin: AnalyzedAnswer;
  lowest: AnalyzedAnswer;
  turning: AnalyzedAnswer;
  dream: AnalyzedAnswer;
  oneSentence: string;
  dominantTheme: NarrativeTheme;
  emotionalArc: Emotion[];
  keywords: string[];
}

type NarrativeTheme =
  | "underdog"
  | "discovery"
  | "transformation"
  | "obsession"
  | "legacy"
  | "renaissance";

// Helper to resolve singular/plural descriptors for passions
function parsePassions(passionStr: string) {
  const rawItems = (passionStr || "").split(",").map((p) => p.trim()).filter(Boolean);
  const items = rawItems.length > 0 ? rawItems : ["their craft"];
  const isPlural = items.length > 1;

  let formatted = items[0];
  if (items.length === 2) {
    formatted = `${items[0]} and ${items[1]}`;
  } else if (items.length > 2) {
    formatted = `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  const hashtags = items.map((p) => `#${p.replace(/\s+/g, "")}`).join(" ");

  return {
    isPlural,
    formatted,
    hashtags,
    label: isPlural ? "passions" : "passion",
    verbIs: isPlural ? "are" : "is",
    verbWas: isPlural ? "were" : "was",
    nounHobby: isPlural ? "hobbies" : "hobby",
    pronounIts: isPlural ? "their" : "its",
    pronounIt: isPlural ? "them" : "it",
  };
}

// ─── Text Analysis Utilities ────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "was", "are", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "can", "this", "that",
  "these", "those", "i", "you", "he", "she", "it", "we", "they", "me",
  "him", "her", "us", "them", "my", "your", "his", "its", "our", "their",
  "as", "if", "then", "than", "so", "such", "not", "no", "nor", "just",
  "also", "very", "too", "more", "most", "some", "any", "all", "each",
  "every", "other", "same", "own", "about", "into", "through", "during",
  "before", "after", "above", "below", "up", "down", "out", "off",
  "over", "under", "again", "further", "once", "here", "there", "when",
  "where", "why", "how", "what", "which", "who", "whom", "whose",
]);

const EMOTION_INDICATORS: Record<Emotion, string[]> = {
  hopeful: ["dream", "future", "hope", "aspire", "believe", "vision", "imagine", "someday", "will", "build"],
  struggling: ["hard", "difficult", "fail", "lost", "gave up", "quit", "tired", "exhausted", "doubt", "fear", "alone", "broke", "impossible"],
  triumphant: ["won", "succeeded", "achieved", "finally", "breakthrough", "overcame", "proved", "victory", "proud", "milestone"],
  reflective: ["realized", "understood", "learned", "discovered", "found", "knew", "thought", "wondered", "remembered", "looked back"],
  determined: ["decided", "committed", "promised", "chose", "refused", "kept going", "pushed", "fought", "insisted", "persevered"],
  nostalgic: ["remember", "childhood", "young", "first", "always", "used to", "back then", "growing up", "early", "began"],
};

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function extractKeywords(text: string, maxCount = 12): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCount)
    .map(([word]) => word);
}

function detectEmotion(text: string): Emotion {
  const lower = text.toLowerCase();
  let bestEmotion: Emotion = "reflective";
  let bestScore = 0;

  for (const [emotion, indicators] of Object.entries(EMOTION_INDICATORS)) {
    let score = 0;
    for (const indicator of indicators) {
      if (lower.includes(indicator)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEmotion = emotion as Emotion;
    }
  }

  return bestEmotion;
}

function analyzeAnswer(raw: string): AnalyzedAnswer {
  const trimmed = raw.trim();
  const sentences = splitSentences(trimmed);
  const keywords = extractKeywords(trimmed);
  const emotionalTone = detectEmotion(trimmed);
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  return { raw: trimmed, sentences, keywords, emotionalTone, wordCount };
}

// ─── Theme Detection ────────────────────────────────────────────────────────

function detectTheme(analysis: StoryAnalysis): NarrativeTheme {
  const { origin, lowest, turning, dream, passion } = analysis;
  const allText = `${origin.raw} ${lowest.raw} ${turning.raw} ${dream.raw} ${passion}`.toLowerCase();

  // Underdog: mentions of struggle against odds, proving people wrong
  if (
    lowest.emotionalTone === "struggling" &&
    (allText.includes("prove") || allText.includes("against") || allText.includes("nobody") || allText.includes("odds"))
  ) {
    return "underdog";
  }

  // Discovery: origin is about finding something new
  if (
    origin.emotionalTone === "reflective" &&
    (allText.includes("discover") || allText.includes("found") || allText.includes("first time") || allText.includes("realized"))
  ) {
    return "discovery";
  }

  // Transformation: dramatic change from low to high
  if (
    lowest.emotionalTone === "struggling" &&
    turning.emotionalTone === "triumphant"
  ) {
    return "transformation";
  }

  // Obsession: intense dedication, mentions of all-consuming passion
  if (
    allText.includes("every") && (allText.includes("day") || allText.includes("hour") || allText.includes("moment"))
    || allText.includes("obsess") || allText.includes("consume") || allText.includes("dedicated")
  ) {
    return "obsession";
  }

  // Legacy: building something that lasts, helping others
  if (
    dream.emotionalTone === "hopeful" &&
    (allText.includes("leave") || allText.includes("legacy") || allText.includes("others") || allText.includes("community") || allText.includes("help"))
  ) {
    return "legacy";
  }

  // Renaissance: rebirth, starting over, second chance
  if (
    allText.includes("again") || allText.includes("restart") || allText.includes("second chance") || allText.includes("new beginning")
  ) {
    return "renaissance";
  }

  // Default based on emotional arc
  if (lowest.emotionalTone === "struggling") {
    return "transformation";
  }
  return "discovery";
}

// ─── Story Generation ───────────────────────────────────────────────────────

const THEME_LABELS: Record<NarrativeTheme, string> = {
  underdog: "The Underdog",
  discovery: "The Discovery",
  transformation: "The Transformation",
  obsession: "The Obsession",
  legacy: "The Legacy",
  renaissance: "The Renaissance",
};

const THEME_OPENINGS: Record<NarrativeTheme, string[]> = {
  underdog: [
    "They said it couldn't be done.",
    "Nobody believed it was possible.",
    "The odds were never in their favor.",
  ],
  discovery: [
    "It started with a question.",
    "Some passions are chosen. Others arrive unannounced.",
    "The first encounter was unremarkable, almost accidental.",
  ],
  transformation: [
    "The person who began this journey is not the person who finished it.",
    "Transformation rarely announces itself.",
    "Before the change, there was a breaking.",
  ],
  obsession: [
    "There are hobbies, and then there are callings.",
    "Not everyone understands what it means to be consumed.",
    "It began as interest. It became identity.",
  ],
  legacy: [
    "Every legacy begins with a single, quiet decision.",
    "The greatest stories are not about what we achieve, but what we leave behind.",
    "Long before the world noticed, the foundation was being laid.",
  ],
  renaissance: [
    "Not every beginning is the first.",
    "Sometimes the story starts over.",
    "Rebirth doesn't require permission.",
  ],
};

const REFLECTION_SENTENCES = [
  "Looking back, the signs were always there.",
  "Hindsight turns uncertainty into inevitability.",
  "What felt like wandering was, in truth, navigation.",
  "The pieces only make sense once the picture is complete.",
  "Every step, even the uncertain ones, was necessary.",
];

const CLOSING_SENTENCES = [
  "And the story, of course, is far from over.",
  "The next chapter is already being written.",
  "The origin was never the ending — only the beginning.",
  "What comes next is a story for another time.",
  "The horizon, as always, keeps moving forward.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function joinSentences(sentences: string[]): string {
  return sentences.join(" ");
}

function buildParagraphs(analysis: StoryAnalysis): string[] {
  const { name, profession, passion, origin, lowest, turning, dream, oneSentence, dominantTheme } = analysis;
  const seed = name.length + passion.length;
  const paragraphs: string[] = [];
  const pData = parsePassions(passion);

  // Paragraph 1: Cinematic opening + origin
  const opening = pick(THEME_OPENINGS[dominantTheme], seed);
  const originText = origin.sentences.length > 0
    ? origin.sentences[0]
    : `It began, as most things do, with a moment of quiet curiosity.`;
  paragraphs.push(
    `${opening} ${name}'s story with ${pData.formatted} didn't begin with fanfare or recognition. ${originText} ${origin.sentences.length > 1 ? origin.sentences.slice(1).join(" ") : "What started as a flicker of interest would, over time, grow into something undeniable — a force that would shape not just a career but an identity."}`,
  );

  // Paragraph 2: Deepening the passion
  const deepeningSentences = [
    `In those early days, ${name} was not yet the ${profession} they would become.`,
    `The relationship with ${pData.formatted} ${pData.verbWas} raw, unformed, full of trial and error.`,
    `Every attempt was a lesson; every failure, a tutor.`,
    `There was no roadmap, only the pull of something that felt important without yet knowing why.`,
    `The craft of ${pData.formatted} demanded patience ${name} didn't always have, and taught lessons ${name} didn't always want to learn.`,
  ];
  paragraphs.push(joinSentences(deepeningSentences));

  // Paragraph 3: The lowest point
  const lowestText = lowest.sentences.length > 0
    ? lowest.sentences.join(" ")
    : "There came a point where the dream felt impossibly far away.";
  const struggleSentences = [
    `Then came the trial. ${lowestText}`,
    lowest.emotionalTone === "struggling"
      ? `These were the days when ${pData.formatted} felt less like a calling and more like a burden, when the gap between where ${name} was and where they wanted to be seemed unbridgeable.`
      : `It was the kind of moment that forces a choice: continue or walk away. ${name} chose to continue.`,
    `Doubt is a patient adversary. It doesn't shout; it whispers, and it whispers most loudly in the spaces between effort and result.`,
    `Many people, faced with the same crossroads, would have chosen the safer path. No one would have blamed them.`,
  ];
  paragraphs.push(joinSentences(struggleSentences));

  // Paragraph 4: The turning point
  const turningText = turning.sentences.length > 0
    ? turning.sentences.join(" ")
    : "And then, as it often does, the tide turned.";
  const turningSentences = [
    `But the story doesn't end in the valley. ${turningText}`,
    turning.emotionalTone === "triumphant"
      ? `It was the kind of moment that rewires a person — not because it was dramatic, but because it was clarifying.`
      : `What changed was not the circumstances but the perspective. ${name} began to see the struggle not as punishment but as preparation.`,
    `The breakthrough didn't erase the difficulty; it redeemed it. Every setback had been building something, even when the blueprint was invisible.`,
    `From that point forward, the work shifted. It became less about proving and more about becoming.`,
  ];
  paragraphs.push(joinSentences(turningSentences));

  // Paragraph 5: Growth and craft
  const growthSentences = [
    `Skill, ${name} discovered, is not a destination but a direction.`,
    `The ${profession} the world would come to know was forged in those unglamorous hours — the repetitions, the revisions, the quiet decisions to show up one more time.`,
    `${pData.formatted} had transformed from a spark of interest into a lifetime craft.`,
    `Small wins accumulated. Momentum, that most underrated force, began to carry the work forward.`,
    `What once felt impossible became routine; what once felt routine became instinct.`,
  ];
  paragraphs.push(joinSentences(growthSentences));

  // Paragraph 6: Reflection + oneSentence
  const reflection = pick(REFLECTION_SENTENCES, seed + 1);
  paragraphs.push(
    `${reflection} ${name}'s journey with ${pData.formatted} is not a tale of overnight success or innate genius. It is, at its core, the story of ${oneSentence}. The origin was never about talent finding ${pData.pronounIts} stage — it was about persistence finding its voice.`,
  );

  // Paragraph 7: The dream / future
  const dreamText = dream.sentences.length > 0
    ? dream.sentences.join(" ")
    : "And the dream? It's still unfolding.";
  paragraphs.push(
    `Today, ${name} stands at a vantage point that the beginning could not have imagined. ${dreamText} The spark that started it all has become a guiding light, and the journey that tested everything has become the foundation of everything that comes next.`,
  );

  // Paragraph 8: Closing
  const closing = pick(CLOSING_SENTENCES, seed + 2);
  paragraphs.push(
    `${closing} ${name}'s origin story with ${pData.formatted} is a reminder that every expert was once a beginner, every success was once a maybe, and every legend was once someone who simply refused to stop.`,
  );

  return paragraphs;
}

function buildOriginStory(analysis: StoryAnalysis): string {
  const paragraphs = buildParagraphs(analysis);
  let story = paragraphs.join("\n\n");

  const wordCount = story.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 1000) {
    const { name, passion, profession } = analysis;
    const pData = parsePassions(passion);
    const expansions = [
      `The pursuit of ${pData.formatted}, ${name} would come to understand, is not a linear path but a spiral. Each pass brings you back to familiar territory, but at a higher elevation, seeing what you couldn't see before.`,
      `There is a particular kind of loneliness in the early stages of any craft. It's the loneliness of caring about something before anyone else can see why it matters. ${name} knew that loneliness well, and learned that it is not a sign of being on the wrong path but of being on an uncrowded one.`,
      `The work of a ${profession} is rarely as glamorous as it appears from the outside. It is built from the unglamorous: the early mornings, the abandoned drafts, the moments of staring at a screen or a canvas or a problem and feeling the weight of not-yet-knowing.`,
      `What ${name} discovered, slowly, is that the gap between amateur and expert is not talent. It is tolerance — tolerance for uncertainty, for imperfection, for the long stretch between starting and arriving.`,
      `There were people along the way who mattered more than they knew. A word of encouragement at the right moment. A critique that stung but sharpened. A peer who made the work feel less solitary. ${name} carries all of them forward, even the ones who never realized they were part of the story.`,
    ];
    let i = 0;
    while (
      story.trim().split(/\s+/).filter(Boolean).length < 1000 &&
      i < expansions.length
    ) {
      story += `\n\n${expansions[i]}`;
      i++;
    }
  }

  const words = story.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1500) {
    return words.slice(0, 1500).join(" ");
  }

  return story;
}

// ─── Character Inference ────────────────────────────────────────────────────

function inferStrengths(analysis: StoryAnalysis): string[] {
  const strengths = new Set<string>();
  const { lowest, turning, origin, dream } = analysis;

  if (lowest.emotionalTone === "struggling" && turning.emotionalTone !== "struggling") {
    strengths.add("Resilience under pressure");
  }
  if (origin.emotionalTone === "reflective" || origin.emotionalTone === "nostalgic") {
    strengths.add("Self-awareness");
  }
  if (turning.emotionalTone === "triumphant" || turning.emotionalTone === "determined") {
    strengths.add("Decisive action");
  }
  if (dream.emotionalTone === "hopeful") {
    strengths.add("Visionary thinking");
  }
  strengths.add("Relentless curiosity");
  strengths.add("Disciplined craft");

  return [...strengths].slice(0, 4);
}

function inferWeaknesses(analysis: StoryAnalysis): string[] {
  const weaknesses = new Set<string>();
  const { lowest, origin } = analysis;

  if (lowest.emotionalTone === "struggling") {
    weaknesses.add("Tendency to doubt during slow progress");
  }
  if (origin.emotionalTone === "determined") {
    weaknesses.add("Can become consumed by the work");
  }
  weaknesses.add("Impatience with invisible growth");
  weaknesses.add("Reluctance to celebrate small wins");

  return [...weaknesses].slice(0, 3);
}

function inferCoreValues(analysis: StoryAnalysis): string[] {
  const values = new Set<string>(["Growth", "Authenticity"]);

  if (analysis.dominantTheme === "legacy") {
    values.add("Service");
  }
  if (analysis.dominantTheme === "obsession") {
    values.add("Mastery");
  }
  if (analysis.dominantTheme === "underdog") {
    values.add("Perseverance");
  }
  if (analysis.dominantTheme === "discovery") {
    values.add("Curiosity");
  }
  if (analysis.dominantTheme === "transformation") {
    values.add("Courage");
  }
  if (analysis.dominantTheme === "renaissance") {
    values.add("Renewal");
  }

  return [...values].slice(0, 3);
}

function inferMission(analysis: StoryAnalysis): string {
  const { passion, dream } = analysis;
  const pData = parsePassions(passion);
  const dreamText = dream.sentences.length > 0
    ? dream.sentences[0].toLowerCase().replace(/[.!?]$/, "")
    : "build something that lasts";
  return `To master ${pData.formatted} and turn ${pData.pronounIt} into work that matters — and to ${dreamText}.`;
}

function inferMotivation(analysis: StoryAnalysis): string {
  const { passion, dream } = analysis;
  const pData = parsePassions(passion);
  const dreamText = dream.raw.length > 0 ? dream.raw : "a future worth building";
  return `The conviction that ${dreamText} is not just possible but necessary, and that ${pData.formatted} ${pData.verbIs} the vehicle to get there.`;
}

// ─── Timeline Generation ────────────────────────────────────────────────────

function buildTimeline(analysis: StoryAnalysis): Story["timeline"] {
  const { name, passion, profession, origin, lowest, turning, dream } = analysis;
  const pData = parsePassions(passion);

  return [
    {
      key: "beginning",
      title: "The Spark",
      body: origin.raw.length > 0
        ? origin.raw
        : `Where ${name}'s ${pData.label} for ${pData.formatted} first took root — a moment of curiosity that would refuse to fade.`,
    },
    {
      key: "failure",
      title: "The Trial",
      body: lowest.raw.length > 0
        ? lowest.raw
        : `The low point that tested whether ${pData.formatted} ${pData.verbWas} a ${pData.nounHobby} or a calling.`,
    },
    {
      key: "breakthrough",
      title: "The Turning Point",
      body: turning.raw.length > 0
        ? turning.raw
        : `The moment the struggle became clarity, and the path forward revealed itself.`,
    },
    {
      key: "today",
      title: "Today",
      body: `${name} now moves through the world as a ${profession}, carrying the full arc of the journey — the spark, the trial, and the breakthrough — into everything that follows.`,
    },
    {
      key: "future",
      title: "What's Next",
      body: dream.raw.length > 0
        ? dream.raw
        : `The horizon keeps calling, and ${name} keeps answering.`,
    },
  ];
}

// ─── Quote & Trailer ────────────────────────────────────────────────────────

const QUOTE_TEMPLATES = [
  "The origin was never about arriving. It was about becoming.",
  "Every expert was once a beginner who refused to stop.",
  "The struggle isn't the obstacle. The struggle is the path.",
  "What looks like wandering is sometimes the truest navigation.",
  "Passion doesn't ask for permission. It asks for persistence.",
  "The spark doesn't become a fire by accident.",
];

function buildQuote(analysis: StoryAnalysis): string {
  const seed = analysis.name.length + analysis.passion.length;
  return pick(QUOTE_TEMPLATES, seed);
}

function buildTrailerScript(analysis: StoryAnalysis): string {
  const { name, passion, profession, dominantTheme } = analysis;
  const pData = parsePassions(passion);
  const themeLabel = THEME_LABELS[dominantTheme];

  return `In a world of easy shortcuts and quiet surrenders, one ${profession} chose the harder, truer path.\n\nThis is the story of ${name} — a ${themeLabel.toLowerCase} built on ${pData.label} for ${pData.formatted}, tested by doubt, and forged in the moments that mattered most.\n\nEvery legend has an origin. This one is theirs.`;
}

// ─── Social Assets ──────────────────────────────────────────────────────────

function buildSocialAssets(analysis: StoryAnalysis): Story["social"] {
  const { name, passion, profession, dream } = analysis;
  const pData = parsePassions(passion);

  return {
    linkedin: `My origin story: how a ${pData.label} for ${pData.formatted} shaped my path as a ${profession} — from the first spark, through the lowest point, to the dream of ${dream.raw.length > 0 ? dream.raw.toLowerCase().replace(/[.!?]$/, "") : "building something that lasts"}.`,
    twitterThread: [
      `1/ Every passion has an origin. Here's mine — built around ${pData.formatted}. 🧵`,
      `2/ It started with curiosity, survived the lowest point, and turned a corner I didn't see coming.`,
      `3/ Today I'm a ${profession} chasing one dream: ${dream.raw.length > 0 ? dream.raw.toLowerCase().replace(/[.!?]$/, "") : "to keep building"}.`,
      `4/ If you're in the struggle right now: keep going. The breakthrough is closer than it feels. ✨`,
    ],
    instagram: `Every legend begins somewhere. This is where mine began. ✨ ${pData.hashtags} #OriginStory`,
    portfolioBio: `${name} is a ${profession} driven by a lifelong ${pData.label} for ${pData.formatted}, working toward ${dream.raw.length > 0 ? dream.raw.toLowerCase().replace(/[.!?]$/, "") : "a future worth building"}.`,
    resumeSummary: `${profession} with a proven record of turning curiosity about ${pData.formatted} into lasting results. Resilient, adaptable, and driven by a vision that has been tested and refined through real-world challenge.`,
  };
}

// ─── Poster Generation ──────────────────────────────────────────────────────

const THEME_POSTER_COLORS: Record<NarrativeTheme, { primary: string; secondary: string; accent: string; bg: string }> = {
  underdog: { primary: "hsl(275 82% 62%)", secondary: "hsl(199 89% 58%)", accent: "hsl(43 96% 62%)", bg: "hsl(240 32% 8%)" },
  discovery: { primary: "hsl(199 89% 58%)", secondary: "hsl(168 76% 42%)", accent: "hsl(43 96% 62%)", bg: "hsl(210 40% 6%)" },
  transformation: { primary: "hsl(275 82% 62%)", secondary: "hsl(340 82% 56%)", accent: "hsl(38 95% 58%)", bg: "hsl(280 30% 6%)" },
  obsession: { primary: "hsl(0 74% 56%)", secondary: "hsl(275 82% 62%)", accent: "hsl(43 96% 62%)", bg: "hsl(0 30% 5%)" },
  legacy: { primary: "hsl(38 95% 58%)", secondary: "hsl(275 82% 62%)", accent: "hsl(43 96% 72%)", bg: "hsl(40 30% 6%)" },
  renaissance: { primary: "hsl(168 76% 42%)", secondary: "hsl(199 89% 58%)", accent: "hsl(43 96% 62%)", bg: "hsl(170 30% 5%)" },
};

function buildPoster(analysis: StoryAnalysis): Story["poster"] {
  const colors = THEME_POSTER_COLORS[analysis.dominantTheme];
  const layouts: Story["poster"]["layout"][] = ["Centered", "LeftAligned", "Split"];
  const layout = layouts[analysis.name.length % layouts.length];
  const pData = parsePassions(analysis.passion);

  return {
    theme: THEME_LABELS[analysis.dominantTheme],
    background: colors.bg,
    title: analysis.name,
    subtitle: `A ${pData.formatted} Origin Story`,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accent: colors.accent,
    layout,
    decorations: ["film-grain", "vignette", "starfield"],
  };
}

// ─── Inferred Content ───────────────────────────────────────────────────────

function buildInferredContent(analysis: StoryAnalysis): string[] {
  const items: string[] = [];

  items.push(`Narrative theme: ${THEME_LABELS[analysis.dominantTheme]}`);
  items.push(`Emotional arc: ${analysis.emotionalArc.join(" → ")}`);
  if (analysis.keywords.length > 0) {
    items.push(`Key themes detected: ${analysis.keywords.slice(0, 5).join(", ")}`);
  }
  items.push("Character strengths, weaknesses, and values inferred from emotional tone of answers");
  items.push("Timeline structure derived from the hero's journey framework");
  items.push("Poster color palette selected based on narrative theme");

  return items;
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

function analyzeAnswers(answers: Answers): StoryAnalysis {
  const origin = analyzeAnswer(answers.originMoment);
  const lowest = analyzeAnswer(answers.lowestPoint);
  const turning = analyzeAnswer(answers.turningPoint);
  const dream = analyzeAnswer(answers.dream);

  const emotionalArc: Emotion[] = [
    origin.emotionalTone,
    lowest.emotionalTone,
    turning.emotionalTone,
    dream.emotionalTone,
  ];

  const allKeywords = [
    ...origin.keywords,
    ...lowest.keywords,
    ...turning.keywords,
    ...dream.keywords,
  ];

  const analysis: StoryAnalysis = {
    name: answers.name.trim() || "The Dreamer",
    profession: answers.profession.trim() || "creator",
    country: (answers.country ?? "").trim(),
    passion: answers.passion.trim() || "their craft",
    origin,
    lowest,
    turning,
    dream,
    oneSentence: answers.oneSentence.trim() || "someone who refuses to quit",
    dominantTheme: "discovery",
    emotionalArc,
    keywords: [...new Set(allKeywords)],
  };

  analysis.dominantTheme = detectTheme(analysis);

  return analysis;
}

export function generateHeuristicStory(answers: Answers): Story {
  const analysis = analyzeAnswers(answers);

  return {
    heroTitle: `${analysis.name}: ${THEME_LABELS[analysis.dominantTheme]}`,
    tagline: `Every passion has a beginning. This is ${analysis.name}'s.`,
    originStory: buildOriginStory(analysis),
    timeline: buildTimeline(analysis),
    character: {
      mission: inferMission(analysis),
      strengths: inferStrengths(analysis),
      weaknesses: inferWeaknesses(analysis),
      motivation: inferMotivation(analysis),
      coreValues: inferCoreValues(analysis),
    },
    quote: buildQuote(analysis),
    trailerScript: buildTrailerScript(analysis),
    social: buildSocialAssets(analysis),
    poster: buildPoster(analysis),
    inferredContent: buildInferredContent(analysis),
  };
}
