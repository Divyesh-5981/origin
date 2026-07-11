import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  deleteStoryRecord,
  StoryRepositoryError,
} from "@/lib/services/story-repository";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (typeof id !== "string" || id.trim().length === 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  try {
    await deleteStoryRecord(id, userId);
  } catch (error) {
    const message =
      error instanceof StoryRepositoryError
        ? error.message
        : "Failed to delete story record";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true }, { status: 200 });
}
