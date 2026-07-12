'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface CosmicThreadProps {
  reduced: boolean;
}

const PARTICLE_COUNT = 350;

// Custom shaders to render points as soft circular glowing dots instead of default square blocks
const particleVertexShader = `
  uniform float uTime;
  attribute float aSpeed;
  attribute float aRandom;
  attribute float aRadius;
  varying float vRadius;

  void main() {
    vRadius = aRadius;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale point size based on depth and radius position
    gl_PointSize = (18.0 / -mvPosition.z) * (1.5 - (aRadius / 6.0));
  }
`;

const particleFragmentShader = `
  varying float vRadius;
  uniform vec3 uColorOrange;
  uniform vec3 uColorCyan;

  void main() {
    // Disc shape masking
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    // Smooth Gaussian-like falloff for glow outline
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 2.5);

    // Fade color from cyan (inner) to orange (outer)
    float mixFactor = clamp(vRadius / 5.0, 0.0, 1.0);
    vec3 color = mix(uColorCyan, uColorOrange, mixFactor);

    gl_FragColor = vec4(color, glow * 0.85);
  }
`;

function ThreadVortex({ reduced }: CosmicThreadProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const count = reduced ? 80 : PARTICLE_COUNT;

  // Generate spiral coordinates for story threads
  const [positions, randoms, speeds, initialRadii] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    const spd = new Float32Array(count);
    const rad = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 1.0 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      
      // Position
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      rand[i] = angle;
      spd[i] = 0.3 + Math.random() * 0.7;
      rad[i] = radius;
    }

    return [pos, rand, spd, rad];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorOrange: { value: new THREE.Color('hsl(16, 100%, 55%)') },
    uColorCyan: { value: new THREE.Color('hsl(180, 100%, 55%)') }
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update time uniform
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value = time;
    }

    // 1. Animate the central core glow
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4;
      coreRef.current.rotation.x = time * 0.25;
      const pulse = 1.0 + Math.sin(time * 3) * 0.08;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
    if (coreGlowRef.current) {
      coreGlowRef.current.rotation.z = -time * 0.2;
      const pulseGlow = 1.6 + Math.sin(time * 3 + Math.PI) * 0.12;
      coreGlowRef.current.scale.set(pulseGlow, pulseGlow, pulseGlow);
    }

    // 2. Animate the orbiting thread particles spiraling inward
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          // Increment angle for orbit
          randoms[i] += speeds[i] * 0.015;
          
          // Slowly decrease radius to spiral inward
          initialRadii[i] -= 0.006;
          // Reset radius if it gets absorbed by the core
          if (initialRadii[i] < 0.2) {
            initialRadii[i] = 4.5 + Math.random() * 1.0;
          }

          // Update position array
          const radius = initialRadii[i];
          const angle = randoms[i];
          
          arr[i * 3] = Math.cos(angle) * radius;
          // Float vertical wavy motion
          arr[i * 3 + 1] = Math.sin(time * speeds[i] + radius) * 0.25;
          arr[i * 3 + 2] = Math.sin(angle) * radius;
        }
        posAttr.needsUpdate = true;
      }
      pointsRef.current.rotation.y = time * 0.05;
    }

    // 3. Cinematic operator camera orbit pan
    state.camera.position.x = Math.sin(time * 0.1) * 7.5;
    state.camera.position.z = Math.cos(time * 0.1) * 7.5;
    state.camera.position.y = 2.0 + Math.sin(time * 0.15) * 1.0;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {/* Central Star Core representing the starting spark */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial color="#ff5000" wireframe opacity={0.85} transparent />
      </mesh>

      {/* Atmospheric core plasma glow halo */}
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          wireframe
          opacity={0.15}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting story thread particles using custom soft circle shader */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aRadius"
            args={[initialRadii, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderMatRef}
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

export function GeneratingVisual3D({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden bg-black">
      {/* Cinematic dark movie grid overlay behind canvas */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

      <Canvas
        camera={{ position: [0, 2, 8], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#020202']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1.5} />
        <ThreadVortex reduced={reduced} />
      </Canvas>
    </div>
  );
}
