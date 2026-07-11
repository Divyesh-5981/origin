import "server-only";
import type { Answers } from "@/types";
import type { Story } from "@/lib/core/story-schema";
import { POSTER_DEFAULTS } from "@/lib/core/poster-spec";

const MIN_ORIGIN_WORDS = 1000;

function value(raw: string | undefined, fallback: string): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildOriginStory(answers: Answers): string {
  const name = value(answers.name, "The Dreamer");
  const profession = value(answers.profession, "creator");
  const passion = value(answers.passion, "their craft");
  const origin = value(answers.originMoment, "a quiet, ordinary afternoon");
  const lowest = value(answers.lowestPoint, "a season of doubt");
  const turning = value(answers.turningPoint, "a single decisive moment");
  const dream = value(answers.dream, "a future worth building");
  const oneSentence = value(answers.oneSentence, "someone who refuses to quit");

  const paragraphs: string[] = [
    `Every origin begins before the world is watching, and ${name}'s begins with ${origin}. There was no audience, no applause, only a spark of curiosity that would refuse to fade. What looked like an ordinary beginning was in truth the first frame of a much larger story, the moment a passion for ${passion} quietly took root.`,
    `${name} would come to be known as a ${profession}, but titles never tell the whole truth. Beneath the label lived a relentless questioner, someone who saw ${passion} not as a task but as a language, a way of shaping meaning from raw possibility. Each early attempt was clumsy, each result imperfect, yet every failure carried a lesson that sharpened the next attempt.`,
    `The path was never smooth. ${name} arrived at ${lowest}, the kind of low point that tests whether a passion is a fleeting hobby or a calling. Doubt spoke loudly in those days. It whispered that the dream was too large, the odds too steep, the effort unlikely to matter. Many would have stopped there, and no one would have blamed them.`,
    `But endings disguised as setbacks are often just intermissions. ${turning} changed everything. It was not a lightning strike so much as a slow dawn, a realization that the struggle itself was forging exactly the resilience the dream required. ${name} chose to continue, and that choice rewrote the trajectory of everything that followed.`,
    `From that turning point forward, ${passion} became less about proving something and more about building something. Skill compounded. Small wins stacked into momentum. The work that once felt impossible became a craft practiced with intention, and the ${profession} the world would recognize began to take clear shape.`,
    `Today, ${name} carries the whole arc forward: the humble start, the trial, the breakthrough. The story is not a monument to talent but a testament to persistence, a reminder that ${oneSentence}. What began as a private spark now lights a path others can follow.`,
    `And the horizon still calls. ${name} looks toward ${dream}, not as a finish line but as the next chapter. The origin was never about arriving; it was about becoming. Every lesson, every stumble, every quiet victory was preparation for the story still being written.`,
  ];

  const fillerSentences = [
    `The pursuit of ${passion} demanded patience on the days when progress felt invisible.`,
    `${name} learned that discipline outlasts motivation, and that showing up is its own quiet triumph.`,
    `There were mentors who offered a word at the right moment, and setbacks that offered lessons no mentor could.`,
    `Each obstacle reframed the goal, turning a distant ambition into a series of achievable steps.`,
    `The craft of a ${profession} is rarely glamorous up close; it is built from repetition, revision, and resolve.`,
    `Belief, ${name} discovered, is not a feeling that arrives fully formed but a habit practiced daily.`,
    `Even in the shadow of ${lowest}, small acts of courage kept the dream of ${dream} alive.`,
    `Progress came in uneven waves, and ${name} learned to trust the direction even when the pace disappointed.`,
    `What others mistook for luck was the quiet residue of countless unseen hours devoted to ${passion}.`,
    `The story of ${name} is proof that ordinary beginnings can carry extraordinary momentum.`,
  ];

  let story = paragraphs.join("\n\n");
  let index = 0;
  while (countWords(story) < MIN_ORIGIN_WORDS) {
    story += ` ${fillerSentences[index % fillerSentences.length]}`;
    index += 1;
  }
  return story;
}

export function buildMockStory(answers: Answers): Story {
  const name = value(answers.name, "The Dreamer");
  const passion = value(answers.passion, "their craft");
  const profession = value(answers.profession, "creator");
  const dream = value(answers.dream, "a future worth building");

  return {
    heroTitle: `${name}: The ${passion} Origin`,
    tagline: `Every legend of ${passion} begins with a single spark.`,
    originStory: buildOriginStory(answers),
    timeline: [
      {
        key: "beginning",
        title: "The Spark",
        body: value(
          answers.originMoment,
          `Where ${name}'s passion for ${passion} first took root.`,
        ),
      },
      {
        key: "failure",
        title: "The Trial",
        body: value(
          answers.lowestPoint,
          "A low point that tested the dream.",
        ),
      },
      {
        key: "breakthrough",
        title: "The Turning Point",
        body: value(
          answers.turningPoint,
          "The moment everything changed.",
        ),
      },
      {
        key: "today",
        title: "Today",
        body: `${name} now moves through the world as a ${profession}, shaped by the whole journey.`,
      },
      {
        key: "future",
        title: "What's Next",
        body: dream,
      },
    ],
    character: {
      mission: `To master ${passion} and turn it into something that outlasts ${name}.`,
      strengths: ["Relentless curiosity", "Resilience", "Craftsmanship"],
      weaknesses: ["Impatience with slow progress", "A tendency to overwork"],
      motivation: `The belief that ${dream} is worth every difficult step.`,
      coreValues: ["Growth", "Authenticity", "Perseverance"],
    },
    quote: `The origin was never about arriving. It was about becoming.`,
    trailerScript: `In a world of easy shortcuts, one ${profession} chose the harder, truer path. This is the story of ${name} — and a passion for ${passion} that refused to fade.`,
    social: {
      linkedin: `My origin story: how a passion for ${passion} shaped my path as a ${profession}, from the first spark to the dream of ${dream}.`,
      twitterThread: [
        `1/ Everyone has an origin story. Here's mine, built around ${passion}. 🧵`,
        `2/ It started small and survived the low points. The turning point changed everything.`,
        `3/ Today I'm chasing one dream: ${dream}.`,
      ],
      instagram: `Every legend begins somewhere. This is where mine began. ✨ #${passion.replace(/\s+/g, "")}`,
      portfolioBio: `${name} is a ${profession} driven by a lifelong passion for ${passion}, working toward ${dream}.`,
      resumeSummary: `${profession} with a proven record of turning curiosity about ${passion} into lasting results.`,
    },
    poster: {
      ...POSTER_DEFAULTS,
      title: name,
      subtitle: `A ${passion} Origin Story`,
    },
    inferredContent: [
      "Character strengths, weaknesses, and values",
      "Timeline framing and section titles",
      "Poster theme and decorative styling",
    ],
  };
}
