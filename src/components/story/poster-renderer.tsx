'use client';

import { useRef, useState } from 'react';
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

function layoutAnchor(layout: PosterSpec['layout']): {
  x: number;
  anchor: 'start' | 'middle';
} {
  if (layout === 'LeftAligned') {
    return { x: 72, anchor: 'start' };
  }
  if (layout === 'Split') {
    return { x: POSTER_WIDTH / 2, anchor: 'middle' };
  }
  return { x: POSTER_WIDTH / 2, anchor: 'middle' };
}

function PosterSvg({
  spec,
  svgRef,
}: {
  spec: PosterSpec;
  svgRef: React.Ref<SVGSVGElement>;
}) {
  const { x, anchor } = layoutAnchor(spec.layout);

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
        <linearGradient id="poster-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={spec.primaryColor} />
          <stop offset="100%" stopColor={spec.secondaryColor} />
        </linearGradient>
        {/* Cinematic vignette */}
        <radialGradient id="poster-vignette" cx="0.5" cy="0.5" r="0.7">
          <stop offset="60%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.4" />
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
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"
          />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>
        {/* Glow filter for title */}
        <filter id="title-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill={spec.background}
      />
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill="url(#poster-bg)"
        opacity="0.85"
      />
      {/* Film grain overlay */}
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        filter="url(#poster-grain)"
        opacity="0.5"
      />
      {/* Decorative border frame */}
      <rect
        x="24"
        y="24"
        width={POSTER_WIDTH - 48}
        height={POSTER_HEIGHT - 48}
        fill="none"
        stroke={spec.accent}
        strokeWidth="1"
        opacity="0.3"
      />
      {/* "Presents" eyebrow */}
      <text
        x={x}
        y={80}
        textAnchor={anchor}
        fill={spec.accent}
        fontSize="16"
        letterSpacing="6"
        fontFamily="sans-serif"
        opacity="0.7"
      >
        ORIGIN PRESENTS
      </text>
      {/* Theme */}
      <text
        x={x}
        y={120}
        textAnchor={anchor}
        fill={spec.accent}
        fontSize="24"
        letterSpacing="8"
        fontFamily="sans-serif"
      >
        {spec.theme.toUpperCase()}
      </text>
      {/* Title with glow */}
      <text
        x={x}
        y={POSTER_HEIGHT / 2}
        textAnchor={anchor}
        fill={spec.accent}
        fontSize="76"
        fontWeight="700"
        fontFamily="sans-serif"
        filter="url(#title-glow)"
      >
        {spec.title}
      </text>
      <text
        x={x}
        y={POSTER_HEIGHT / 2 + 70}
        textAnchor={anchor}
        fill={spec.accent}
        fontSize="34"
        fontFamily="sans-serif"
      >
        {spec.subtitle}
      </text>
      <text
        x={x}
        y={POSTER_HEIGHT - 80}
        textAnchor={anchor}
        fill={spec.accent}
        fontSize="24"
        fontFamily="sans-serif"
        opacity="0.85"
      >
        {spec.decorations.join(' · ')}
      </text>
      {/* Vignette overlay */}
      <rect
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        fill="url(#poster-vignette)"
      />
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
