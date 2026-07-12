import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI, ApiError } from "@google/genai";

export const runtime = "nodejs";

const TEST_MODEL = "gemini-3.5-flash";
const COOKIE_NAME = "origin-byok-key";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * GET — check whether a BYOK cookie is set (returns boolean only, never the key).
 * Used by the client to show "key configured" status on mount.
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const key = cookieStore.get(COOKIE_NAME)?.value;
  return NextResponse.json({ configured: typeof key === "string" && key.length > 0 });
}

/**
 * DELETE — clear the BYOK cookie.
 */
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ cleared: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/**
 * POST — validate the provided API key and, if valid, store it in an
 * httpOnly cookie so it is never accessible to client-side JavaScript.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { valid: false, message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { apiKey } = parsedBody as { apiKey?: string };

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json(
      { valid: false, message: "API key is required." },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    // Minimal call to verify the key works
    await ai.models.generateContent({
      model: TEST_MODEL,
      contents: "Reply with the single word: ok",
      config: { responseMimeType: "text/plain" },
    });

    // Key is valid — set it as an httpOnly cookie
    const response = NextResponse.json({ valid: true });
    response.cookies.set(COOKIE_NAME, apiKey.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 400 || error.status === 401
          ? "This API key is invalid or unauthorized. Please check and try again."
          : error.status === 403
            ? "This API key doesn't have access to Gemini. Check your Google AI permissions."
            : error.status === 429
              ? "Rate limit reached while validating. Your key may be valid — try saving it again in a moment."
              : `Validation failed: ${error.message}`;
      return NextResponse.json(
        { valid: false, message },
        { status: 200 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { valid: false, message: `Validation failed: ${message}` },
      { status: 200 },
    );
  }
}
