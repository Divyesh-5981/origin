'use client';

import { useRef, useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { withPosterDefaults } from '@/lib/core/poster-spec';
import type { PosterSpec } from '@/types';
import { Button } from '@/components/ui/button';

const POSTER_WIDTH = 800;
const POSTER_HEIGHT = 1200;
const EXPORT_SCALE = 2;

interface PosterRendererProps {
  spec: Partial<PosterSpec>;
  fileName?: string;
}

function wrapText(text: string, maxCharsPerLine = 35): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function PosterSvg({
  spec,
  svgRef,
}: {
  spec: PosterSpec;
  svgRef: React.Ref<SVGSVGElement>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wrap title (user name) if too long
  const titleLines = wrapText(spec.title, 15);
  const titleFontSize = titleLines.length > 2 ? 40 : titleLines.length > 1 ? 52 : 72;
  const titleLineHeight = titleFontSize + 8;
  const titleStartY = 530 - ((titleLines.length - 1) * titleLineHeight) / 2;

  // Wrap subtitle (passions) if too long
  const subtitleText = `“ ${spec.subtitle} ”`;
  const subtitleLines = wrapText(subtitleText, 35);
  const subtitleLineHeight = subtitleLines.length > 3 ? 24 : 32;
  const subtitleFontSize = subtitleLines.length > 3 ? 18 : subtitleLines.length > 1 ? 22 : 28;

  // Compute subtitle start position dynamically to prevent overlap
  const titleBottom = titleStartY + (titleLines.length - 1) * titleLineHeight;
  const subtitleStartY = titleBottom + 75 - ((subtitleLines.length - 1) * subtitleLineHeight) / 2;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}`}
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${spec.title} poster`}
      className="h-auto w-full max-w-sm rounded-2xl border border-border shadow-elevated"
    >
      <defs>
        {/* Cinematic Web Fonts - Only render on the client after mount to prevent React 19 styles hoisting / SSR hydration mismatch */}
        {mounted && (
          <style type="text/css">
            {`
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Playfair+Display:ital,wght@0,500;1,500&family=Inter:wght@400;500&display=swap');
              
              .cinematic-title {
                font-family: 'Cinzel', serif;
                font-weight: 800;
                letter-spacing: 8px;
              }
              
              .script-subtitle {
                font-family: 'Playfair Display', serif;
                font-style: italic;
              }
              
              .mono-credits {
                font-family: 'Inter', sans-serif;
                font-weight: 500;
                letter-spacing: 4px;
              }
              
              .billing-block {
                font-family: 'Inter', sans-serif;
                font-weight: 400;
                letter-spacing: 2px;
                fill: #7c7c7c;
                font-size: 8.5px;
              }
            `}
          </style>
        )}

        <linearGradient id="poster-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={spec.primaryColor} />
          <stop offset="100%" stopColor={spec.secondaryColor} />
        </linearGradient>
        
        {/* Golden spotlight glow */}
        <radialGradient id="center-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={spec.accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={spec.accent} stopOpacity="0" />
        </radialGradient>

        {/* Cinematic vignette */}
        <radialGradient id="poster-vignette" cx="0.5" cy="0.5" r="0.7">
          <stop offset="60%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.7" />
        </radialGradient>

        {/* Film grain filter */}
        <filter id="poster-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0"
          />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>

        {/* Text soft outer glow */}
        <filter id="text-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main color background base */}
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill={spec.background}
      />
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill="url(#poster-bg)"
        opacity="0.8"
      />

      {/* Film grain and Vignette overlay (drawn on background layer to avoid obscuring text) */}
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        filter="url(#poster-grain)"
        opacity="0.45"
        pointerEvents="none"
      />
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill="url(#poster-vignette)"
        pointerEvents="none"
      />

      {/* CREATIVE VECTOR PORTAL GRAPHIC (BACKDROP) */}
      <g opacity="0.8">
        {/* Outer dashed orbit */}
        <circle cx="400" cy="560" r="230" fill="none" stroke={spec.accent} strokeWidth="1" strokeDasharray="3,7" opacity="0.3" />
        
        {/* Diagonal elliptical trajectories */}
        <ellipse cx="400" cy="560" rx="270" ry="70" fill="none" stroke={spec.primaryColor} strokeWidth="1" transform="rotate(-30 400 560)" opacity="0.35" />
        <ellipse cx="400" cy="560" rx="270" ry="70" fill="none" stroke={spec.secondaryColor} strokeWidth="1" transform="rotate(30 400 560)" opacity="0.25" />

        {/* Central solid geometric orbit */}
        <circle cx="400" cy="560" r="160" fill="none" stroke={spec.accent} strokeWidth="0.75" opacity="0.2" />

        {/* Vertical crosshair line */}
        <line x1="400" y1="260" x2="400" y2="860" stroke={spec.accent} strokeWidth="0.5" strokeDasharray="4,8" opacity="0.15" />

        {/* Glowing center focal point */}
        <circle cx="400" cy="560" r="140" fill="url(#center-glow)" />

        {/* Vector Sparks (Star markers) */}
        <path d="M 400 375 L 402 383 L 410 385 L 402 387 L 400 395 L 398 387 L 390 385 L 398 383 Z" fill={spec.accent} opacity="0.6" />
        <path d="M 400 725 L 402 733 L 410 735 L 402 737 L 400 745 L 398 737 L 390 735 L 398 733 Z" fill={spec.accent} opacity="0.6" />
        <path d="M 225 560 L 227 568 L 235 570 L 227 572 L 225 580 L 223 572 L 215 570 L 223 568 Z" fill={spec.accent} opacity="0.6" />
        <path d="M 575 560 L 577 568 L 585 570 L 577 572 L 575 580 L 573 572 L 565 570 L 573 568 Z" fill={spec.accent} opacity="0.6" />
      </g>

      {/* Decorative double frame border */}
      <rect
        x="32"
        y="32"
        width={POSTER_WIDTH - 64}
        height={POSTER_HEIGHT - 64}
        fill="none"
        stroke={spec.accent}
        strokeWidth="1.5"
        opacity="0.45"
      />
      <rect
        x="42"
        y="42"
        width={POSTER_WIDTH - 84}
        height={POSTER_HEIGHT - 84}
        fill="none"
        stroke={spec.accent}
        strokeWidth="0.75"
        strokeDasharray="4,4"
        opacity="0.3"
      />

      {/* TOP HEADER SECTION */}
      <text
        x="400"
        y="110"
        textAnchor="middle"
        fill="#ffdb8a"
        fontSize="12"
        className="mono-credits"
      >
        ORIGIN STUDIOS PRESENTS A DIGITAL PREMIERE
      </text>
      <text
        x="400"
        y="155"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="24"
        className="cinematic-title"
      >
        {spec.theme.toUpperCase()}
      </text>

      {/* CENTER TYPOGRAPHY OVERLAID ON PORTAL */}
      <text
        x="400"
        y={titleStartY}
        textAnchor="middle"
        fill="#ffffff"
        className="cinematic-title"
        filter="url(#text-glow)"
      >
        {titleLines.map((line, index) => (
          <tspan
            key={index}
            x="400"
            dy={index === 0 ? 0 : titleLineHeight}
            fontSize={titleFontSize}
          >
            {line}
          </tspan>
        ))}
      </text>
      <text
        x="400"
        y={subtitleStartY}
        textAnchor="middle"
        fill="#ffdb8a"
        className="script-subtitle"
      >
        {subtitleLines.map((line, index) => (
          <tspan
            key={index}
            x="400"
            dy={index === 0 ? 0 : subtitleLineHeight}
            fontSize={subtitleFontSize}
          >
            {line}
          </tspan>
        ))}
      </text>

      {/* FOOTER NARRATIVE TAGLINE */}
      <text
        x="400"
        y="960"
        textAnchor="middle"
        fill="#ffdb8a"
        fontSize="12"
        className="mono-credits"
      >
        A STORY OF STRUGGLE, PERSISTENCE AND GLORIOUS TRIUMPH
      </text>

      {/* HOLLYWOOD BILLING BLOCK */}
      <g>
        <text x="400" y="1015" textAnchor="middle" className="billing-block" fill="#b3b3b3">
          ORIGIN STUDIOS PRESENTS A GENERATIVE PRODUCTION DIRECTED BY &quot;{spec.title.toUpperCase()}&quot;
        </text>
        <text x="400" y="1035" textAnchor="middle" className="billing-block" fill="#b3b3b3">
          FEATURING A SCENE OF &quot;{spec.theme.toUpperCase()}&quot; · EXECUTIVE PRODUCERS NEXT.JS &amp; TAILWIND CSS
        </text>
        <text x="400" y="1055" textAnchor="middle" className="billing-block" fill="#b3b3b3">
          ORIGINAL DIALOGUE WRITTEN BY THE DEVELOPER AGENT · NARRATION AUDIO ENGAGED BY ELEVENLABS
        </text>
        <text x="400" y="1075" textAnchor="middle" className="billing-block" fill="#b3b3b3">
          ORIGINAL CONCEPT SEEDED BY GOOGLE DEEPMIND · RELEASED UNDER THE CONSTELLATION LICENCE 2026
        </text>
      </g>
    </svg>
  );
}

async function exportPng(svg: SVGSVGElement, fileName: string): Promise<void> {
  const serialized = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([serialized], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.width = POSTER_WIDTH;
    image.height = POSTER_HEIGHT;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Poster image failed to load'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = POSTER_WIDTH * EXPORT_SCALE;
    canvas.height = POSTER_HEIGHT * EXPORT_SCALE;
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new Error('Canvas context unavailable');
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PosterRenderer({
  spec,
  fileName = 'origin-poster.png',
}: PosterRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [exportFailed, setExportFailed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const resolvedSpec = withPosterDefaults(spec);

  const handleDownload = async () => {
    if (svgRef.current === null) {
      setExportFailed(true);
      return;
    }
    setIsExporting(true);
    setExportFailed(false);
    try {
      await exportPng(svgRef.current, fileName);
    } catch {
      setExportFailed(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <PosterSvg spec={resolvedSpec} svgRef={svgRef} />
      {exportFailed ? (
        <p role="alert" className="text-caption text-destructive">
          The poster couldn&apos;t be exported. Please try again.
        </p>
      ) : (
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={handleDownload}
          disabled={isExporting}
        >
          <Download className="size-4" aria-hidden />
          {isExporting ? 'Preparing…' : 'Download poster'}
        </Button>
      )}
    </div>
  );
}
