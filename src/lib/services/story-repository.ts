import "server-only";
import { randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Answers } from "@/types";
import type { Story } from "@/lib/core/story-schema";

export interface StoryRecord {
  id: string;
  ownerId: string | null;
  slug: string;
  answers: Answers;
  story: Story;
  createdAt: string;
}

export interface StoryRecordRef {
  id: string;
  slug: string;
}

export interface InsertStoryInput {
  answers: Answers;
  story: Story;
  ownerId?: string | null;
}

export class StoryRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoryRepositoryError";
  }
}

type StoryRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  answers: Answers;
  story: Story;
  created_at: string;
};

type StoryInsert = {
  id?: string;
  owner_id?: string | null;
  slug: string;
  answers: Answers;
  story: Story;
  created_at?: string;
};

type Database = {
  public: {
    Tables: {
      stories: {
        Row: StoryRow;
        Insert: StoryInsert;
        Update: Partial<StoryRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const SLUG_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SLUG_LENGTH = 10;
const MAX_SLUG_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

let cachedClient: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (cachedClient !== null) {
    return cachedClient;
  }
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url === undefined || serviceRoleKey === undefined) {
    throw new StoryRepositoryError(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured",
    );
  }
  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

function generateSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = "";
  for (let index = 0; index < SLUG_LENGTH; index += 1) {
    slug += SLUG_ALPHABET.charAt(bytes[index] % SLUG_ALPHABET.length);
  }
  return slug;
}

function mapRow(row: StoryRow): StoryRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    answers: row.answers,
    story: row.story,
    createdAt: row.created_at,
  };
}

export async function insertStoryRecord(
  input: InsertStoryInput,
): Promise<StoryRecordRef> {
  const client = getClient();
  const ownerId = input.ownerId ?? null;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = generateSlug();
    const { data, error } = await client
      .from("stories")
      .insert({
        owner_id: ownerId,
        slug,
        answers: input.answers,
        story: input.story,
      })
      .select("id, slug")
      .single();

    if (error !== null) {
      if (error.code === UNIQUE_VIOLATION && attempt < MAX_SLUG_ATTEMPTS - 1) {
        continue;
      }
      throw new StoryRepositoryError(
        `Failed to insert story record: ${error.message}`,
      );
    }

    return { id: data.id, slug: data.slug };
  }

  throw new StoryRepositoryError(
    "Failed to generate a unique slug for the story record",
  );
}

export async function getStoryRecordBySlug(
  slug: string,
): Promise<StoryRecord | null> {
  const client = getClient();
  const { data, error } = await client
    .from("stories")
    .select("id, owner_id, slug, answers, story, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error !== null) {
    throw new StoryRepositoryError(
      `Failed to load story record by slug: ${error.message}`,
    );
  }
  if (data === null) {
    return null;
  }
  return mapRow(data);
}

export async function getStoryRecordById(
  id: string,
): Promise<StoryRecord | null> {
  const client = getClient();
  const { data, error } = await client
    .from("stories")
    .select("id, owner_id, slug, answers, story, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error !== null) {
    throw new StoryRepositoryError(
      `Failed to load story record by id: ${error.message}`,
    );
  }
  if (data === null) {
    return null;
  }
  return mapRow(data);
}

export async function listStoriesForUser(
  ownerId: string,
): Promise<StoryRecord[]> {
  const client = getClient();
  const { data, error } = await client
    .from("stories")
    .select("id, owner_id, slug, answers, story, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error !== null) {
    throw new StoryRepositoryError(
      `Failed to list story records: ${error.message}`,
    );
  }
  return data.map(mapRow);
}

export async function deleteStoryRecord(
  id: string,
  ownerId: string,
): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from("stories")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error !== null) {
    throw new StoryRepositoryError(
      `Failed to delete story record: ${error.message}`,
    );
  }
}
