'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  title: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    id: 'spark',
    label: '01. The Setup',
    title: 'Answer The Call',
    description: 'Share a few brief details about your passion to set the stage.',
  },
  {
    id: 'ignite',
    label: '02. The Script',
    title: 'AI Synthesis',
    description: 'Our engine weaves your answers into a cohesive, legendary narrative script.',
  },
  {
    id: 'weave',
    label: '03. The Production',
    title: 'Visual & Audio',
    description: 'Your story takes shape as a cinematic poster and dramatic voice narration.',
  },
  {
    id: 'share',
    label: '04. The Premiere',
    title: 'Share The Legend',
    description: 'Launch your interactive origin story to the world.',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * ConstellationCanvas — an advanced auto-playing particle system that morphs into custom icons.
 */
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const primaryColor = '#FF4500'; // Ignition Orange
    const secondaryColor = '#00F0FF'; // Electric Cyan

    // Define icons as normalized coordinate sets (relative coordinates between -1 and 1)
    const icons = {
      // Pen/Form Icon
      pen: [
        { x: -0.4, y: 0.4 }, { x: -0.3, y: 0.3 }, { x: 0.2, y: -0.2 }, { x: 0.3, y: -0.3 },
        { x: 0.4, y: -0.2 }, { x: 0.2, y: -0.4 }, { x: -0.2, y: 0.2 }, { x: -0.4, y: 0.4 },
        { x: -0.3, y: 0.5 }, { x: -0.5, y: 0.3 }, { x: -0.4, y: 0.4 },
        { x: 0.1, y: -0.1 }, { x: 0.3, y: -0.1 }, { x: 0.1, y: -0.3 }
      ],
      // AI / Brain Node Icon
      ai: [
        { x: 0, y: 0 },
        { x: -0.4, y: -0.4 }, { x: 0.4, y: -0.4 }, { x: -0.4, y: 0.4 }, { x: 0.4, y: 0.4 },
        { x: 0, y: -0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0 }, { x: 0.5, y: 0 },
        { x: -0.2, y: -0.2 }, { x: 0.2, y: -0.2 }, { x: -0.2, y: 0.2 }, { x: 0.2, y: 0.2 }
      ],
      // Film Reel Icon
      film: [
        // Outer ring
        ...Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return { x: Math.cos(a) * 0.5, y: Math.sin(a) * 0.5 };
        }),
        // Inner slots
        { x: -0.2, y: -0.2 }, { x: 0.2, y: -0.2 }, { x: -0.2, y: 0.2 }, { x: 0.2, y: 0.2 },
        { x: 0, y: 0 }
      ],
      // Broadcast Wave / Release Icon
      broadcast: [
        { x: 0, y: 0.3 },
        // Waves
        { x: -0.2, y: 0.1 }, { x: 0, y: 0.05 }, { x: 0.2, y: 0.1 },
        { x: -0.4, y: -0.1 }, { x: -0.2, y: -0.25 }, { x: 0, y: -0.3 }, { x: 0.2, y: -0.25 }, { x: 0.4, y: -0.1 }
      ]
    };

    const iconKeys = Object.keys(icons) as Array<keyof typeof icons>;
    const PARTICLE_LIMIT = 60;
    
    // Create particles
    const particles = Array.from({ length: PARTICLE_LIMIT }).map(() => ({
      x: Math.random() * 400,
      y: Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      targetX: 0,
      targetY: 0
    }));

    let frame = 0;
    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Shifting colors / glow setup
      const time = frame * 0.01;
      const currentIconIndex = Math.floor(time / 4) % iconKeys.length;
      const nextIconIndex = (currentIconIndex + 1) % iconKeys.length;
      
      // Morph progress between current and next icon
      const rawProgress = (time % 4) / 4;
      const morphProgress = rawProgress < 0.8 
        ? 0 
        : (rawProgress - 0.8) / 0.2; // Quick transition at the end

      const currentKey = iconKeys[currentIconIndex];
      const nextKey = iconKeys[nextIconIndex];
      
      const currentPoints = icons[currentKey];
      const nextPoints = icons[nextKey];

      const centerX = width / 2;
      const centerY = height / 2;
      const iconScale = Math.min(width, height) * 0.35;

      // Draw constellation grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        // Assign target points from the current icon
        const currentTarget = currentPoints[idx % currentPoints.length];
        const nextTarget = nextPoints[idx % nextPoints.length];

        // Interpolated targets
        const tx = currentTarget.x * (1 - morphProgress) + nextTarget.x * morphProgress;
        const ty = currentTarget.y * (1 - morphProgress) + nextTarget.y * morphProgress;

        p.targetX = centerX + tx * iconScale;
        p.targetY = centerY + ty * iconScale;

        if (prefersReduced) {
          p.x = p.targetX;
          p.y = p.targetY;
        } else {
          // Physics/spring force towards target
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          
          p.vx += dx * 0.015;
          p.vy += dy * 0.015;
          
          // Friction
          p.vx *= 0.88;
          p.vy *= 0.88;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw particle
        ctx.fillStyle = idx % 2 === 0 ? primaryColor : secondaryColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Connect close particles with constellation lines
        for (let j = idx + 1; j < particles.length; j++) {
          const other = particles[j];
          const distDx = p.x - other.x;
          const distDy = p.y - other.y;
          const dist = Math.sqrt(distDx * distDx + distDy * distDy);
          
          if (dist < 45) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 45)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Display phase tag
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 9px var(--font-body)';
      ctx.textAlign = 'center';
      const label = `PIPELINE STAGE: 0${currentIconIndex + 1} - ${currentKey.toUpperCase()}`;
      ctx.fillText(label, centerX, height - 15);

      frame++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" aria-hidden />;
}

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="relative mx-auto w-full max-w-6xl px-4 py-32 sm:px-6"
    >
      <div className="mb-20 flex flex-col items-center text-center">
        <motion.div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles className="size-3.5 text-electric-cyan" />
          <span>The Production Pipeline</span>
        </motion.div>
        <motion.h2
          id="how-it-works-heading"
          className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          How a Legend is Forged
        </motion.h2>
      </div>

      {/* Auto-playing canvas constellation flow animation */}
      <div className="relative mb-16 h-80 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-glow-cyan backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-electric-cyan/5 to-transparent" />
        <ConstellationCanvas />
      </div>

      {/* Stage cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage, index) => (
          <motion.div
            key={stage.id}
            className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20"
            variants={cardVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.15 }}
          >
            <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-electric-cyan">
              {stage.label}
            </div>
            <h3 className="mb-2 text-xl font-medium text-foreground">
              {stage.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {stage.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
