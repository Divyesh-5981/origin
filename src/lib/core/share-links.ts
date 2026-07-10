export type SocialTarget = "twitter" | "facebook" | "linkedin" | "whatsapp";

const SHARE_PATH_PREFIX = "/s/";

const TRAILING_SLASHES = /\/+$/u;

const SOCIAL_ENDPOINTS: Record<SocialTarget, string> = {
  twitter: "https://twitter.com/intent/tweet",
  facebook: "https://www.facebook.com/sharer/sharer.php",
  linkedin: "https://www.linkedin.com/sharing/share-offsite/",
  whatsapp: "https://wa.me/",
};

export function buildShareUrl(baseUrl: string, slug: string): string {
  const normalizedBase = baseUrl.replace(TRAILING_SLASHES, "");
  const normalizedSlug = slug.replace(/^\/+/u, "");
  return `${normalizedBase}${SHARE_PATH_PREFIX}${normalizedSlug}`;
}

export function encodeQrPayload(shareUrl: string): string {
  return encodeURIComponent(shareUrl);
}

export function decodeQrPayload(payload: string): string {
  return decodeURIComponent(payload);
}

export function buildSocialShareIntent(
  target: SocialTarget,
  shareUrl: string,
  text?: string,
): string {
  const encodedUrl = encodeURIComponent(shareUrl);
  const endpoint = SOCIAL_ENDPOINTS[target];

  if (target === "facebook") {
    return `${endpoint}?u=${encodedUrl}`;
  }

  if (target === "linkedin") {
    return `${endpoint}?url=${encodedUrl}`;
  }

  if (target === "whatsapp") {
    const message = text === undefined ? shareUrl : `${text} ${shareUrl}`;
    return `${endpoint}?text=${encodeURIComponent(message)}`;
  }

  const encodedText = text === undefined ? "" : encodeURIComponent(text);
  return `${endpoint}?url=${encodedUrl}&text=${encodedText}`;
}
