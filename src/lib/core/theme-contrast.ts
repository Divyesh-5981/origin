export const BODY_CONTRAST_MIN = 4.5;

export const LARGE_TEXT_CONTRAST_MIN = 3;

const SRGB_MAX = 255;

const LINEARIZE_THRESHOLD = 0.03928;

const LINEARIZE_DIVISOR = 12.92;

const LINEARIZE_OFFSET = 0.055;

const LINEARIZE_SCALE = 1.055;

const LINEARIZE_EXPONENT = 2.4;

const LUMINANCE_R = 0.2126;

const LUMINANCE_G = 0.7152;

const LUMINANCE_B = 0.0722;

const CONTRAST_OFFSET = 0.05;

const HEX_SHORT_LENGTH = 3;

const HEX_FULL_LENGTH = 6;

const HEX_RADIX = 16;

const PERCENT_MAX = 100;

const DEGREES_PER_CIRCLE = 360;

const HSL_COMPONENT_COUNT = 3;

const HUE_CHANNEL_OFFSET = 1 / 3;

export interface NormalizedRgb {
  r: number;
  g: number;
  b: number;
}

const BLACK: NormalizedRgb = { r: 0, g: 0, b: 0 };

function clampChannel(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function parseHex(input: string): NormalizedRgb | null {
  const body = input.slice(1);
  const expanded =
    body.length === HEX_SHORT_LENGTH
      ? body
        .split("")
        .map((char) => char + char)
        .join("")
      : body;
  if (expanded.length !== HEX_FULL_LENGTH) {
    return null;
  }
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }
  const r = Number.parseInt(expanded.slice(0, 2), HEX_RADIX);
  const g = Number.parseInt(expanded.slice(2, 4), HEX_RADIX);
  const b = Number.parseInt(expanded.slice(4, 6), HEX_RADIX);
  return { r: r / SRGB_MAX, g: g / SRGB_MAX, b: b / SRGB_MAX };
}

function hueToChannel(p: number, q: number, tRaw: number): number {
  let t = tRaw;
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

function hslToRgb(h: number, s: number, l: number): NormalizedRgb {
  if (s === 0) {
    return { r: l, g: l, b: l };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const normalizedDegrees =
    ((h % DEGREES_PER_CIRCLE) + DEGREES_PER_CIRCLE) % DEGREES_PER_CIRCLE;
  const hk = normalizedDegrees / DEGREES_PER_CIRCLE;
  return {
    r: hueToChannel(p, q, hk + HUE_CHANNEL_OFFSET),
    g: hueToChannel(p, q, hk),
    b: hueToChannel(p, q, hk - HUE_CHANNEL_OFFSET),
  };
}

function parseHslTokens(input: string): NormalizedRgb | null {
  const tokens = input.trim().split(/\s+/);
  if (tokens.length !== HSL_COMPONENT_COUNT) {
    return null;
  }
  const hueToken = tokens[0];
  const satToken = tokens[1];
  const lightToken = tokens[2];
  if (!satToken.endsWith("%") || !lightToken.endsWith("%")) {
    return null;
  }
  const hue = Number.parseFloat(hueToken);
  const sat = Number.parseFloat(satToken.slice(0, -1));
  const light = Number.parseFloat(lightToken.slice(0, -1));
  if (!Number.isFinite(hue) || !Number.isFinite(sat) || !Number.isFinite(light)) {
    return null;
  }
  const s = clampChannel(sat / PERCENT_MAX);
  const l = clampChannel(light / PERCENT_MAX);
  return hslToRgb(hue, s, l);
}

export function parseColor(input: string): NormalizedRgb {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return BLACK;
  }
  if (trimmed.startsWith("#")) {
    return parseHex(trimmed) ?? BLACK;
  }
  return parseHslTokens(trimmed) ?? BLACK;
}

function linearizeChannel(channel: number): number {
  const c = clampChannel(channel);
  if (c <= LINEARIZE_THRESHOLD) {
    return c / LINEARIZE_DIVISOR;
  }
  return ((c + LINEARIZE_OFFSET) / LINEARIZE_SCALE) ** LINEARIZE_EXPONENT;
}

function relativeLuminance(color: NormalizedRgb): number {
  return (
    LUMINANCE_R * linearizeChannel(color.r) +
    LUMINANCE_G * linearizeChannel(color.g) +
    LUMINANCE_B * linearizeChannel(color.b)
  );
}

export function contrastRatio(a: string, b: string): number {
  const luminanceA = relativeLuminance(parseColor(a));
  const luminanceB = relativeLuminance(parseColor(b));
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
}

export function meetsBodyContrast(a: string, b: string): boolean {
  return contrastRatio(a, b) >= BODY_CONTRAST_MIN;
}

export function meetsLargeTextContrast(a: string, b: string): boolean {
  return contrastRatio(a, b) >= LARGE_TEXT_CONTRAST_MIN;
}
