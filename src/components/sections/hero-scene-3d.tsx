"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { Mesh } from "three";

interface HeroScene3DProps {
  reduced?: boolean;
}

const CANVAS_STYLE: CSSProperties = { position: "absolute", inset: 0 };

const SPARKLE_COUNT = 70;
const REDUCED_ICOSAHEDRON_DETAIL = 4;
const FULL_ICOSAHEDRON_DETAIL = 16;

function OriginOrb({ reduced }: { reduced: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current === null) {
      return;
    }
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x += delta * 0.05;
  });

  return (
    <Float
      speed={reduced ? 0 : 1.4}
      rotationIntensity={reduced ? 0 : 0.6}
      floatIntensity={reduced ? 0 : 0.9}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry
          args={[
            1.5,
            reduced ? REDUCED_ICOSAHEDRON_DETAIL : FULL_ICOSAHEDRON_DETAIL,
          ]}
        />
        <MeshDistortMaterial
          color="#f59e0b"
          emissive="#7c3aed"
          emissiveIntensity={0.45}
          roughness={0.2}
          metalness={0.65}
          distort={reduced ? 0.2 : 0.45}
          speed={reduced ? 0 : 1.6}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene3D({ reduced = false }: HeroScene3DProps) {
  return (
    <Canvas
      style={CANVAS_STYLE}
      dpr={reduced ? 1 : [1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: !reduced, alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <pointLight
        position={[4, 4, 4]}
        intensity={2.6}
        decay={0}
        color="#a855f7"
      />
      <pointLight
        position={[-4, -2, 2]}
        intensity={2.2}
        decay={0}
        color="#f59e0b"
      />
      <OriginOrb reduced={reduced} />
      {reduced ? null : (
        <Sparkles
          count={SPARKLE_COUNT}
          scale={9}
          size={2.4}
          speed={0.4}
          color="#fcd34d"
        />
      )}
    </Canvas>
  );
}
