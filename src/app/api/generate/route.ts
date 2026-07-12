import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import {
  emptyRequestStore,
  registerRequest,
  resolveRequest,
  type RequestStore,
} from "@/lib/core/request-dedupe";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { runGeneration } from "@/lib/services/generation-orchestrator";
import { createShareUrl } from "@/lib/services/share-service";
import type {
  GenerateDuplicateResponse,
  GenerateFailedResponse,
  GenerateRefusalResponse,
  GenerateSuccessResponse,
} from "@/types/api";

export const runtime = "nodejs";

const GENERATION_FAILED_MESSAGE =
  "We couldn't craft your story right now. Please try again in a moment.";

const nonEmptyString = z.string().trim().min(1);

const answersSchema = z.object({
  name: nonEmptyString,
  profession: nonEmptyString,
  country: z.string().trim().min(1).optional(),
  passion: nonEmptyString,
  originMoment: nonEmptyString,
  lowestPoint: nonEmptyString,
  turningPoint: nonEmptyString,
  dream: nonEmptyString,
  oneSentence: nonEmptyString,
});

const generateRequestSchema = z.object({
  requestId: nonEmptyString,
  answers: answersSchema,
});

const BYOK_COOKIE_NAME = "origin-byok-key";

let requestStore: RequestStore = emptyRequestStore();

export async function POST(request: Request): Promise<NextResponse> {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = generateRequestSchema.safeParse(parsedBody);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const { requestId, answers } = parsed.data;

  // BYOK: read user-provided API key from httpOnly cookie (never from client JS)
  const cookieStore = await cookies();
  const userApiKey = cookieStore.get(BYOK_COOKIE_NAME)?.value ?? null;

  const registration = registerRequest(requestStore, requestId);

  if (!registration.accepted) {
    const duplicate: GenerateDuplicateResponse = {
      error: "duplicate",
      requestId,
    };
    return NextResponse.json(duplicate, { status: 409 });
  }

  requestStore = registration.store;

  try {
    const ownerId = isClerkConfigured() ? (await auth()).userId : null;
    const result = await runGeneration({ answers, ownerId, userApiKey: userApiKey ?? null });

    if (result.kind === "refusal") {
      const refusal: GenerateRefusalResponse = {
        error: "refused",
        category: result.category,
        message: result.message,
      };
      return NextResponse.json(refusal, { status: 422 });
    }

    if (result.kind === "error") {
      const failed: GenerateFailedResponse = {
        error: "generation_failed",
        message: result.message,
      };
      return NextResponse.json(failed, { status: 502 });
    }

    const success: GenerateSuccessResponse = {
      recordId: result.record.id,
      shareUrl: createShareUrl(result.record),
    };
    return NextResponse.json(success, { status: 200 });
  } catch {
    const failed: GenerateFailedResponse = {
      error: "generation_failed",
      message: GENERATION_FAILED_MESSAGE,
    };
    return NextResponse.json(failed, { status: 502 });
  } finally {
    requestStore = resolveRequest(requestStore, requestId);
  }
}
