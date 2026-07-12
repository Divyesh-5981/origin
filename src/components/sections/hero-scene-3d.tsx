'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';

interface HeroScene3DProps {
  reduced?: boolean;
  scrollProgress?: MotionValue<number>;
}

const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };
const PARTICLE_COUNT = 1500;

// GLSL shaders for the custom GPU particle galaxy
const particleVertexShader = `
  uniform float uTime;
  uniform float uScroll;
  attribute float aSpeed;
  attribute float aRandom;
  attribute float aHelix;
  attribute float aRadius;
  varying vec3 vColor;
  varying float vDistance;

  void main() {
    float compression = max(0.15, 1.0 - uScroll * 0.95);
    float currentRadius = aRadius * compression;
    
    // Vortex spiral angle on GPU
    float angle = aRandom + (uTime * aSpeed * 0.25) + aHelix;
    
    vec3 pos = position;
    pos.x = cos(angle) * currentRadius;
    pos.z = sin(angle) * currentRadius;
    
    // Slow wave height displacement
    pos.y = position.y + sin(uTime * 1.5 + aRadius) * 0.4;
    
    // Apply scroll translation
    pos.y += uScroll * 3.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // GPU size attenuation with scroll compression scaling
    gl_PointSize = (14.0 / -mvPosition.z) * (1.0 + (1.0 - compression) * 0.6) * (1.5 - (currentRadius / 6.0));
    
    vDistance = currentRadius;
  }
`;

const particleFragmentShader = `
  varying float vDistance;
  uniform vec3 uColorOrange;
  uniform vec3 uColorCyan;

  void main() {
    // Generate high-end soft circular particle texture (Gaussian distribution approximation)
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.5); // Tight focus center, wide falloff glow
    
    // Interpolate color dynamically based on distance from anomaly core
    float colorMix = clamp(vDistance / 5.5, 0.0, 1.0);
    vec3 finalColor = mix(uColorCyan, uColorOrange, colorMix);
    
    gl_FragColor = vec4(finalColor, strength * 0.85);
  }
`;

// Displacement shaders for space anomaly core
const coreVertexShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normal;
    vPosition = position;
    
    // Displacement noise simulation to mimic a burning plasma star
    vec3 displaced = position + normal * (sin(position.x * 6.0 + uTime * 4.0) * cos(position.y * 6.0 + uTime * 4.0) * 0.06);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const coreFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 uColorOrange;
  uniform vec3 uColorCyan;

  void main() {
    // Shifting hot spots
    float pulse = sin(vPosition.x * 3.0 + vPosition.y * 3.0 + uTime * 2.5) * 0.5 + 0.5;
    vec3 glowColor = mix(uColorOrange, uColorCyan, pulse * 0.7);
    
    // Fresnel edge lighting rim
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
    
    gl_FragColor = vec4(glowColor + vec3(intensity * 0.6), 0.75);
  }
`;

function CosmicVortex({ scrollProgress, reduced }: { scrollProgress?: MotionValue<number>, reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const particleMatRef = useRef<THREE.ShaderMaterial>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);

  const count = reduced ? 200 : PARTICLE_COUNT;

  // Initialize randomized attributes for the GPU-bound particles
  const [positions, speeds, randoms, helixBranches, radii] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const rand = new Float32Array(count);
    const helix = new Float32Array(count);
    const rad = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Set initial positions
      pos[i * 3] = 0;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = 0;

      spd[i] = 0.5 + Math.random() * 1.5;
      rand[i] = Math.random() * Math.PI * 2;
      helix[i] = Math.random() > 0.5 ? 0 : Math.PI; // Double-helix configuration
      rad[i] = 1.2 + Math.random() * 4.8;
    }

    return [pos, spd, rand, helix, rad];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uColorOrange: { value: new THREE.Color('hsl(16, 100%, 55%)') },
    uColorCyan: { value: new THREE.Color('hsl(180, 100%, 55%)') }
  }), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const sp = scrollProgress?.get() ?? 0;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05 + sp * 0.3;
      groupRef.current.position.y = sp * 3.5;
    }

    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.12;
      const compress = Math.max(0.1, 1 - sp * 0.85);
      coreRef.current.scale.setScalar(pulse * compress);
    }

    // Direct uniform updates for optimal GPU rendering pipeline
    if (particleMatRef.current) {
      particleMatRef.current.uniforms.uTime.value = time;
      particleMatRef.current.uniforms.uScroll.value = sp;
    }

    if (coreMatRef.current) {
      coreMatRef.current.uniforms.uTime.value = time;
      coreMatRef.current.uniforms.uScroll.value = sp;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Morphing displacement plasma core */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.7, 3]} />
        <shaderMaterial
          ref={coreMatRef}
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* GPU Swirling Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
          <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
          <bufferAttribute attach="attributes-aHelix" args={[helixBranches, 1]} />
          <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMatRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function CinematicCamera({ reduced, scrollProgress }: { reduced: boolean, scrollProgress?: MotionValue<number> }) {
  useFrame((state) => {
    if (reduced) return;
    
    const time = state.clock.elapsedTime;
    const sp = scrollProgress?.get() ?? 0;

    // Sweeping camera circular orbit math
    const radius = 9.5 - sp * 2.5; // Cinematic zoom in on scroll (dolly effect)
    const cameraX = Math.sin(time * 0.05) * radius;
    const cameraZ = Math.cos(time * 0.05) * radius;
    const cameraY = Math.sin(time * 0.03) * 1.5 + 0.8;
    
    // Subtle mouse parallax influence
    const px = state.pointer.x * 1.2;
    const py = state.pointer.y * 1.2;
    
    state.camera.position.lerp(
      new THREE.Vector3(cameraX + px, cameraY + py, cameraZ),
      0.025
    );
    state.camera.lookAt(0, sp * 1.5, 0);
  });
  return null;
}

export default function HeroScene3D({
  reduced = false,
  scrollProgress,
}: HeroScene3DProps) {
  return (
    <Canvas
      style={CANVAS_STYLE}
      dpr={reduced ? 1 : [1, 2]}
      camera={{ position: [0, 1, 9.5], fov: 45 }}
      gl={{ antialias: !reduced, alpha: true }}
    >
      <CinematicCamera reduced={reduced} scrollProgress={scrollProgress} />
      <ambientLight intensity={0.2} />
      
      <CosmicVortex scrollProgress={scrollProgress} reduced={reduced} />
      <fog attach="fog" args={['#020202', 7, 17]} />
    </Canvas>
  );
}
