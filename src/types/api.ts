import type { Answers } from "./domain";

export type NarrationVoice = "male" | "female";

export interface GenerateRequest {
  requestId: string;
  answers: Answers;
}

export interface GenerateSuccessResponse {
  recordId: string;
  shareUrl: string | null;
}

export interface GenerateRefusalResponse {
  error: "refused";
  category: "hate" | "illegal";
  message: string;
}

export interface GenerateFailedResponse {
  error: "generation_failed";
  message: string;
}

export interface GenerateDuplicateResponse {
  error: "duplicate";
  requestId: string;
}

export type GenerateErrorResponse =
  | GenerateRefusalResponse
  | GenerateFailedResponse
  | GenerateDuplicateResponse;

export type GenerateResponse =
  | GenerateSuccessResponse
  | GenerateErrorResponse;

export interface NarrateRequest {
  recordId: string;
  voice: NarrationVoice;
  text: string;
}
