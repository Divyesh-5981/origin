import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isElevenLabsAvailable,
  streamNarration,
} from "@/lib/services/narration-service";

export const runtime = "nodejs";
export const maxDuration = 60;

const narrateRequestSchema = z.object({
  recordId: z.string().min(1),
  voice: z.enum(["male", "female"]),
  text: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const payload: unknown = await request.json().catch(() => null);
    const parsed = narrateRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", message: "Request body is invalid." },
        { status: 400 },
      );
    }

    if (!isElevenLabsAvailable()) {
      return NextResponse.json(
        { error: "narration_unavailable" },
        { status: 503 },
      );
    }

    const { voice, text } = parsed.data;
    const result = await streamNarration({ voice, text });

    if (result.ok) {
      return new Response(result.stream, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Cache-Control": "no-store",
        },
      });
    }

    switch (result.reason) {
      case "unavailable":
        return NextResponse.json(
          { error: "narration_unavailable" },
          { status: 503 },
        );
      case "empty-text":
        return NextResponse.json(
          { error: "invalid_request", message: "Narration text is empty." },
          { status: 400 },
        );
      case "provider-error":
        return NextResponse.json(
          {
            error: "narration_provider_error",
            message: "The narration provider returned an error.",
          },
          { status: 502 },
        );
    }
  } catch {
    return NextResponse.json(
      {
        error: "narration_provider_error",
        message: "The narration request could not be completed.",
      },
      { status: 502 },
    );
  }
}
