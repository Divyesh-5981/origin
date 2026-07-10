import { buildShareUrl, encodeQrPayload } from "@/lib/core/share-links";

const DEFAULT_APP_URL = "http://localhost:3000";

export interface ShareableStoryRecord {
  id: string;
  slug: string;
}

export interface ShareLink {
  shareUrl: string;
  qrPayload: string;
}

function resolveAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (configured === undefined) {
    return DEFAULT_APP_URL;
  }

  const trimmed = configured.trim();
  return trimmed.length === 0 ? DEFAULT_APP_URL : trimmed;
}

function resolveShareSlug(record: ShareableStoryRecord): string {
  const slug = record.slug.trim();
  return slug.length === 0 ? record.id.trim() : slug;
}

export function createShareLink(record: ShareableStoryRecord): ShareLink | null {
  try {
    const slug = resolveShareSlug(record);

    if (slug.length === 0) {
      return null;
    }

    const shareUrl = buildShareUrl(resolveAppBaseUrl(), slug);

    return { shareUrl, qrPayload: encodeQrPayload(shareUrl) };
  } catch {
    return null;
  }
}

export function createShareUrl(record: ShareableStoryRecord): string | null {
  const link = createShareLink(record);
  return link === null ? null : link.shareUrl;
}
