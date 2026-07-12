'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';

interface HeroScene3DProps {
  reduced?: boolean;
}

const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const FULL_PARTICLE_COUNT = 4000;
const REDUCED_PARTICLE_COUNT = 800;
const THREAD_COUNT = 6;
const THREAD_SEGMENTS = 40;
const CURSOR_INFLUENCE_RADIUS = 2.5;
const CURSOR_FORCE = 3;
const RETURN_FORCE = 2;

/**
 * Generate particle positions in a flame/teardrop shape.
 * The flame narrows at the bottom and widens at the top, like a spark rising.
 */
function generateFlamePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Parametric flame: y goes from -1.5 (bottom) to 2 (top)
    const t = Math.random();
    const y = -1.5 + t * 3.5;
    // Radius narrows at bottom, widens in middle, tapers at top
    const heightFactor = Math.sin(t * Math.PI);
    const radius = 0.3 + heightFactor * 1.2 * Math.sqrt(Math.random());
    const angle = Math.random() * Math.PI * 2;
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = y;
    positions[i3 + 2] = Math.sin(angle) * radius * 0.6; // flatten z
  }
  return positions;
}

/**
 * Generate golden "story threads" — bezier curves weaving through the flame.
 */
function generateThreadPoints(): THREE.Vector3[][] {
  const threads: THREE.Vector3[][] = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    const points: THREE.Vector3[] = [];
    const phase = (i / THREAD_COUNT) * Math.PI * 2;
    for (let j = 0; j <= THREAD_SEGMENTS; j++) {
      const t = j / THREAD_SEGMENTS;
      const y = -1.5 + t * 3.5;
      const swirl = Math.sin(t * Math.PI * 3 + phase) * (0.5 + t * 0.5);
      const radius = 0.6 + swirl * 0.4;
      const angle = phase + t * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius * 0.6,
        ),
      );
    }
    threads.push(points);
  }
  return threads;
}

function PassionParticles({ reduced }: { reduced: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const count = reduced ? REDUCED_PARTICLE_COUNT : FULL_PARTICLE_COUNT;

  const { positions, originalPositions, colors } = useMemo(() => {
    const positions = generateFlamePositions(count);
    const originalPositions = new Float32Array(positions);
    const colors = new Float32Array(count * 3);

    const sparkColor = new THREE.Color('hsl(45, 100%, 68%)');
    const emberColor = new THREE.Color('hsl(16, 92%, 56%)');
    const accentColor = new THREE.Color('hsl(265, 74%, 66%)');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = (originalPositions[i3 + 1] + 1.5) / 3.5; // 0 at bottom, 1 at top
      // Bottom = ember (deep orange), middle = spark (bright gold), top = accent (violet)
      const tempColor = new THREE.Color();
      if (t < 0.4) {
        tempColor.lerpColors(emberColor, sparkColor, t / 0.4);
      } else {
        tempColor.lerpColors(sparkColor, accentColor, (t - 0.4) / 0.6);
      }
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;
    }

    return { positions, originalPositions, colors };
  }, [count]);

  // Cursor tracking
  const cursorRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (pointsRef.current === null) return;

    // Update cursor position from pointer
    if (!reduced) {
      const pointer = state.pointer;
      cursorRef.current.set(
        pointer.x * viewport.width * 0.5,
        pointer.y * viewport.height * 0.5,
        0,
      );
    }

    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const positionsArr = positionAttr.array as Float32Array;

    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      // Gentle floating motion
      const floatY = Math.sin(time * 0.5 + i * 0.01) * 0.05;
      const floatX = Math.cos(time * 0.3 + i * 0.02) * 0.03;

      let tx = ox + floatX;
      let ty = oy + floatY;
      const tz = oz;

      // Cursor force field — particles disperse near cursor
      if (!reduced) {
        const dx = tx - cursorRef.current.x;
        const dy = ty - cursorRef.current.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < CURSOR_INFLUENCE_RADIUS * CURSOR_INFLUENCE_RADIUS) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / CURSOR_INFLUENCE_RADIUS) * CURSOR_FORCE;
          const angle = Math.atan2(dy, dx);
          tx += Math.cos(angle) * force * 0.3;
          ty += Math.sin(angle) * force * 0.3;
        }
      }

      // Spring back toward original position
      const currentX = positionsArr[i3];
      const currentY = positionsArr[i3 + 1];
      const currentZ = positionsArr[i3 + 2];

      positionsArr[i3] = currentX + (tx - currentX) * RETURN_FORCE * delta;
      positionsArr[i3 + 1] = currentY + (ty - currentY) * RETURN_FORCE * delta;
      positionsArr[i3 + 2] = currentZ + (tz - currentZ) * RETURN_FORCE * delta;
    }

    positionAttr.needsUpdate = true;

    // Slow rotation of the whole system
    pointsRef.current.rotation.y += delta * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={reduced ? 0.04 : 0.025}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function StoryThreads() {
  const groupRef = useRef<THREE.Group>(null);
  const threads = useMemo(() => generateThreadPoints(), []);

  const lineGeometries = useMemo(
    () =>
      threads.map((points) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
      }),
    [threads],
  );

  useFrame((_, delta) => {
    if (groupRef.current === null) return;
    groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {lineGeometries.map((geometry, i) => (
        <primitive
          key={i}
          object={
            new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({
                color: new THREE.Color('hsl(38, 95%, 60%)'),
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending,
              }),
            )
          }
        />
      ))}
    </group>
  );
}

export default function HeroScene3D({ reduced = false }: HeroScene3DProps) {
  return (
    <Canvas
      style={CANVAS_STYLE}
      dpr={reduced ? 1 : [1, 2]}
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      gl={{ antialias: !reduced, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight
        position={[0, 2, 3]}
        intensity={2}
        decay={0}
        color="hsl(45, 100%, 68%)"
      />
      <pointLight
        position={[0, -2, -2]}
        intensity={1.5}
        decay={0}
        color="hsl(265, 74%, 66%)"
      />
      <Float
        speed={reduced ? 0 : 0.8}
        rotationIntensity={0}
        floatIntensity={reduced ? 0 : 0.3}
      >
        <PassionParticles reduced={reduced} />
      </Float>
      {reduced ? null : <StoryThreads />}
      {reduced ? null : (
        <Sparkles
          count={50}
          scale={8}
          size={2}
          speed={0.3}
          color="hsl(45, 100%, 72%)"
        />
      )}
    </Canvas>
  );
}
