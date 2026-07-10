import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createShareLink,
  createShareUrl,
} from "@/lib/services/share-service";
import { decodeQrPayload } from "@/lib/core/share-links";

const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

describe("createShareUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://origin.example";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  });

  it("builds the canonical share URL from the record slug", () => {
    expect(createShareUrl({ id: "abc", slug: "hero-story" })).toBe(
      "https://origin.example/s/hero-story",
    );
  });

  it("falls back to the record id when the slug is blank", () => {
    expect(createShareUrl({ id: "abc", slug: "   " })).toBe(
      "https://origin.example/s/abc",
    );
  });

  it("returns null when both slug and id are blank", () => {
    expect(createShareUrl({ id: "  ", slug: "" })).toBeNull();
  });

  it("uses the localhost fallback when the base URL is unset", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(createShareUrl({ id: "abc", slug: "hero-story" })).toBe(
      "http://localhost:3000/s/hero-story",
    );
  });
});

describe("createShareLink", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://origin.example";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  });

  it("produces a QR payload that round-trips to the share URL", () => {
    const link = createShareLink({ id: "abc", slug: "hero-story" });

    expect(link).not.toBeNull();
    expect(decodeQrPayload(link!.qrPayload)).toBe(link!.shareUrl);
  });
});
