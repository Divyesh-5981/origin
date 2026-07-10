export interface Answers {
  name: string;
  profession: string;
  country?: string;
  passion: string;
  originMoment: string;
  lowestPoint: string;
  turningPoint: string;
  dream: string;
  oneSentence: string;
}

export interface Draft {
  answers: Partial<Answers>;
  activeStep: number;
  updatedAt: number;
}

export type RenderMode = "3d-full" | "3d-reduced" | "2d-fallback";

export interface Capability {
  webglAvailable: boolean;
  reducedMotion: boolean;
  deviceTier: "high" | "low";
}

export type Provider = "elevenlabs" | "webspeech" | "none";

export type AttemptOutcome = "none" | "invalid" | "rate-limited" | "valid";

export interface AttemptState {
  attempt: number;
  maxAttempts: number;
  lastOutcome: AttemptOutcome;
  hasValidStory: boolean;
}

export type PosterLayout = "Centered" | "LeftAligned" | "Split";

export interface PosterSpec {
  theme: string;
  background: string;
  title: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accent: string;
  layout: PosterLayout;
  decorations: string[];
}
