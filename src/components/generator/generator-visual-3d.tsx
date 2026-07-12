'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';

interface GeneratorVisual3DProps {
  activeStep: number;
  reduced?: boolean;
}

const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

// --- GLSL SHADER FOR SMOKY VOLUMETRIC SPOTLIGHT BEAM ---
const spotlightVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const spotlightFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    // Smooth radial fade out towards the cylinder margins
    float radialFade = sin(vUv.x * 3.14159);
    // Smooth fade from top (narrow) to bottom (wide)
    float verticalFade = 1.0 - vUv.y;
    
    // Soft fresnel rim to give it a misty/hazy volume look
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    
    float intensity = radialFade * verticalFade * rim;
    gl_FragColor = vec4(uColor, intensity * uOpacity);
  }
`;

// --- FLOATING ATMOSPHERIC DUST MOTES ---
function AtmosphericDustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;
  
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3.5; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.5; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.5; // Z
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Drift upwards lazily
      posArr[i * 3 + 1] += delta * 0.18;
      // Sway sideways (Brownian wind drift)
      posArr[i * 3] += Math.sin(time * 0.5 + i) * 0.0015;
      posArr[i * 3 + 2] += Math.cos(time * 0.5 + i) * 0.0015;
      
      // Wrap boundaries around the stage focus space
      if (posArr[i * 3 + 1] > 2.5) posArr[i * 3 + 1] = -2.0;
      if (posArr[i * 3] > 2.0) posArr[i * 3] = -2.0;
      if (posArr[i * 3] < -2.0) posArr[i * 3] = 2.0;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- RISING FIRE EMBERS (Step 3: The Origin/Struggle) ---
function BurningEmbers({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = -1.8 + Math.random() * 3.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (active) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.75, 0.05);
      for (let i = 0; i < count; i++) {
        // Rise faster representing burning trial sparks
        posArr[i * 3 + 1] += delta * 0.45;
        // Turbulence sway
        posArr[i * 3] += Math.sin(time * 2.0 + i) * 0.003;
        
        // Recycle
        if (posArr[i * 3 + 1] > 2.0) {
          posArr[i * 3 + 1] = -1.8;
          posArr[i * 3] = (Math.random() - 0.5) * 1.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.0, 0.08);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="hsl(16, 100%, 55%)"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- PAPARAZZI FLASHBULBS (Step 4: The Breakthrough) ---
function PaparazziFlashes({ active }: { active: boolean }) {
  const flash1Ref = useRef<THREE.PointLight>(null);
  const flash2Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!active) {
      if (flash1Ref.current) flash1Ref.current.intensity = 0;
      if (flash2Ref.current) flash2Ref.current.intensity = 0;
      return;
    }
    
    // Trigger sudden explosive flashes decay
    if (Math.random() > 0.95) {
      if (flash1Ref.current) flash1Ref.current.intensity = 6.0 + Math.random() * 8.0;
    } else {
      if (flash1Ref.current) flash1Ref.current.intensity *= 0.85;
    }

    if (Math.random() > 0.96) {
      if (flash2Ref.current) flash2Ref.current.intensity = 6.0 + Math.random() * 8.0;
    } else {
      if (flash2Ref.current) flash2Ref.current.intensity *= 0.85;
    }
  });

  return (
    <group>
      <pointLight ref={flash1Ref} position={[-2.5, 1.2, -1.5]} color="#ffffff" distance={6} intensity={0} />
      <pointLight ref={flash2Ref} position={[2.5, 0.8, -1.2]} color="#d0e8ff" distance={6} intensity={0} />
    </group>
  );
}

// --- HIGH-FIDELITY CHROME VINTAGE MICROPHONE ---
function VintageMicrophone({ activeStep }: { activeStep: number }) {
  const micHeadRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const ribs = Array.from({ length: 6 });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (micHeadRef.current) {
      micHeadRef.current.position.y = 0.65 + Math.sin(time * 2.5) * 0.015;
    }

    if (ring1Ref.current && ring2Ref.current) {
      if (activeStep === 1) {
        const scale1 = 1 + (time % 1) * 3;
        const scale2 = 1 + ((time + 0.5) % 1) * 3;
        ring1Ref.current.scale.set(scale1, scale1, scale1);
        ring2Ref.current.scale.set(scale2, scale2, scale2);
        
        const mat1 = ring1Ref.current.material as THREE.MeshBasicMaterial;
        const mat2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
        mat1.opacity = 0.5 * (1 - (time % 1));
        mat2.opacity = 0.5 * (1 - ((time + 0.5) % 1));
      } else {
        ring1Ref.current.scale.set(0, 0, 0);
        ring2Ref.current.scale.set(0, 0, 0);
      }
    }
  });

  const chromeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: activeStep === 6 ? new THREE.Color('hsl(42, 100%, 55%)') : new THREE.Color('#e0e0e0'),
    metalness: 1.0,
    roughness: 0.05, 
  }), [activeStep]);

  const jointMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.8
  }), []);

  return (
    <group position={[0, -1.9, 0]}>
      {/* Heavy Cast Iron Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.1, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>

      {/* Main Chrome Stand Pole */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 2.2, 8]} />
        <primitive object={chromeMaterial} attach="material" />
      </mesh>

      {/* Adjustment Clutch */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>

      {/* Dynamic Mic Head assembly */}
      <group ref={micHeadRef}>
        <mesh position={[0, 1.95, 0]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
          <primitive object={chromeMaterial} attach="material" />
        </mesh>
        
        <group position={[0, 2.05, 0.02]} rotation={[0.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.015, 8, 16, Math.PI]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>

        <group position={[0, 2.12, 0.02]} rotation={[0.2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.08, 0.22, 16]} />
            <meshBasicMaterial color="#080808" />
          </mesh>

          {ribs.map((_, i) => (
            <mesh key={i} position={[0, i * 0.04 - 0.1, 0]}>
              <torusGeometry args={[0.095 - Math.abs(i - 2.5) * 0.005, 0.012, 8, 20]} />
              <primitive object={chromeMaterial} attach="material" />
            </mesh>
          ))}
          
          <mesh position={[0, 0, 0.095]}>
            <boxGeometry args={[0.02, 0.22, 0.015]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>

        {/* Expanding Soundwaves */}
        <mesh ref={ring1Ref} position={[0, 2.12, 0]}>
          <torusGeometry args={[0.22, 0.01, 8, 16]} />
          <meshBasicMaterial color="hsl(16, 100%, 55%)" transparent opacity={0} />
        </mesh>
        <mesh ref={ring2Ref} position={[0, 2.12, 0]}>
          <torusGeometry args={[0.22, 0.01, 8, 16]} />
          <meshBasicMaterial color="hsl(16, 100%, 55%)" transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}

// --- FLUTTERING SCRIPT PAGES (Step 2: The Script/Origin) ---
function FloatingScript({ active }: { active: boolean }) {
  const page1Ref = useRef<THREE.Mesh>(null);
  const page2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!page1Ref.current || !page2Ref.current) return;
    const time = state.clock.elapsedTime;
    
    if (active) {
      const radius1 = 1.1 + Math.sin(time) * 0.06;
      const radius2 = 1.3 + Math.cos(time) * 0.06;
      const angle1 = time * 0.65;
      const angle2 = time * 0.65 + Math.PI;

      page1Ref.current.position.set(Math.cos(angle1) * radius1, 0.2 + Math.sin(time * 2.0) * 0.08, Math.sin(angle1) * radius1);
      page2Ref.current.position.set(Math.cos(angle2) * radius2, 0.45 + Math.cos(time * 2.0) * 0.08, Math.sin(angle2) * radius2);
      
      // Add paper flutter wind wobble on local axis rotations
      page1Ref.current.rotation.set(0.15 + Math.sin(time * 5.0) * 0.12, angle1 + Math.PI / 2, Math.cos(time * 4.0) * 0.1);
      page2Ref.current.rotation.set(-0.15 + Math.cos(time * 5.0) * 0.12, angle2 + Math.PI / 2, Math.sin(time * 4.0) * 0.1);
      
      page1Ref.current.scale.setScalar(THREE.MathUtils.lerp(page1Ref.current.scale.x, 1.0, 0.05));
      page2Ref.current.scale.setScalar(THREE.MathUtils.lerp(page2Ref.current.scale.x, 1.0, 0.05));
    } else {
      page1Ref.current.scale.setScalar(THREE.MathUtils.lerp(page1Ref.current.scale.x, 0, 0.08));
      page2Ref.current.scale.setScalar(THREE.MathUtils.lerp(page2Ref.current.scale.x, 0, 0.08));
    }
  });

  return (
    <group>
      <mesh ref={page1Ref} scale={0}>
        <planeGeometry args={[0.32, 0.42, 4, 4]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} wireframe roughness={0.4} />
      </mesh>
      <mesh ref={page2Ref} scale={0}>
        <planeGeometry args={[0.38, 0.48, 4, 4]} />
        <meshStandardMaterial color="#ffedd0" side={THREE.DoubleSide} wireframe roughness={0.4} />
      </mesh>
    </group>
  );
}

// --- CLAPPERBOARD ON STOOL (Step 0: The Audition) ---
function StageClapperboard({ active }: { active: boolean }) {
  const armRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!armRef.current) return;
    const time = state.clock.elapsedTime;
    
    if (active) {
      const cycle = time % 2.0;
      if (cycle < 0.3) {
        armRef.current.rotation.z = -0.35 + (0.35 * (cycle / 0.3));
      } else if (cycle < 0.4) {
        armRef.current.rotation.z = 0.05 * (1 - (cycle - 0.3) / 0.1);
      } else {
        armRef.current.rotation.z = 0;
      }
    } else {
      armRef.current.rotation.z = -0.35;
    }
  });

  return (
    <group position={[-1.2, -1.8, 0.4]} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.4, 12]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      
      <group position={[0, 0.45, 0]} scale={[0.55, 0.55, 0.55]}>
        <mesh>
          <boxGeometry args={[0.8, 0.5, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.22, 0.04]}>
          <boxGeometry args={[0.8, 0.06, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <group ref={armRef} position={[-0.4, 0.25, 0]}>
          <mesh position={[0.4, 0.03, 0]}>
            <boxGeometry args={[0.8, 0.08, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.4, 0.03, 0.03]}>
            <boxGeometry args={[0.8, 0.03, 0.01]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// --- SHADER SPOTLIGHT BEAM CONE ---
function SpotlightCone({ activeStep }: { activeStep: number }) {
  const spotlightRef = useRef<THREE.Mesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const colors = [
    new THREE.Color('hsl(180, 100%, 50%)'), // Step 0: Cyan
    new THREE.Color('hsl(16, 100%, 50%)'),  // Step 1: Orange
    new THREE.Color('hsl(180, 100%, 65%)'), // Step 2: Bright Cyan
    new THREE.Color('hsl(350, 78%, 50%)'),  // Step 3: Red (Trial)
    new THREE.Color('hsl(42, 100%, 55%)'),  // Step 4: Gold (Turning point)
    new THREE.Color('hsl(180, 100%, 50%)'), // Step 5: Cyan/Stars
    new THREE.Color('hsl(42, 100%, 60%)'),  // Step 6: Gold (Award/Summary)
  ];

  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('hsl(180, 100%, 50%)') },
    uOpacity: { value: 0.25 }
  }), []);

  useFrame((state) => {
    if (!shaderMatRef.current) return;
    const time = state.clock.elapsedTime;
    
    const targetColor = colors[activeStep] || colors[0];
    shaderMatRef.current.uniforms.uColor.value.lerp(targetColor, 0.05);

    // Flicker spotlight on Step 3 (Trial) to represent voltage drops
    if (activeStep === 3) {
      const flicker = Math.random() > 0.85 ? 0.08 : 0.28;
      shaderMatRef.current.uniforms.uOpacity.value = flicker + Math.sin(time * 20) * 0.05;
    } else if (activeStep === 4) {
      shaderMatRef.current.uniforms.uOpacity.value = 0.55 + Math.sin(time * 10) * 0.05;
    } else {
      shaderMatRef.current.uniforms.uOpacity.value = 0.28;
    }
  });

  return (
    <mesh ref={spotlightRef} position={[0, 1.5, 0]}>
      <cylinderGeometry args={[1.6, 0.15, 7.0, 32, 1, true]} />
      <shaderMaterial
        ref={shaderMatRef}
        vertexShader={spotlightVertexShader}
        fragmentShader={spotlightFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- FLOATING STAR PARTICLES ---
function AuditionSparks({ activeStep }: { activeStep: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    if (activeStep >= 5) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.65, 0.05);
      pointsRef.current.rotation.y += delta * 0.35;
      
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 200; i++) {
        positions[i * 3 + 1] += delta * 1.3;
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    } else {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.0, 0.05);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        color={activeStep === 6 ? "hsl(42, 100%, 65%)" : "hsl(180, 100%, 65%)"}
        size={0.045} 
        sizeAttenuation 
        transparent 
        opacity={0} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- INTERACTIVE CAMERA OPERATOR CONTROLLER (CURSORS DOLLEYS) ---
function CameraController({ activeStep, reduced }: { activeStep: number; reduced: boolean }) {
  useFrame((state) => {
    if (reduced) return;
    
    const time = state.clock.elapsedTime;
    const mx = state.pointer.x; // Normalized mouse X: -1 to 1
    const my = state.pointer.y; // Normalized mouse Y: -1 to 1

    let targetCamX = 0;
    let targetCamY = 0.5;
    let targetCamZ = 4.8;
    let lookAtY = 0.15;

    if (activeStep === 3) {
      // Step 3 (Trial): Moody profile close-up
      targetCamX = 1.0;
      targetCamY = 0.15;
      targetCamZ = 2.2;
      lookAtY = 0.18;
    } else if (activeStep === 4) {
      // Step 4 (Breakthrough): Sweeping low-angle upward dolly shot
      targetCamX = Math.sin(time * 0.8) * 0.8;
      targetCamY = -0.45;
      targetCamZ = 3.3;
      lookAtY = 0.35;
    } else if (activeStep === 6) {
      // Step 6 (Summary): High golden rotating panoramic view
      targetCamX = Math.sin(time * 0.25) * 3.5;
      targetCamY = 1.1;
      targetCamZ = Math.cos(time * 0.25) * 3.5;
      lookAtY = -0.1;
    } else {
      // Standard: Floating camera Operator glide
      const angle = time * 0.15;
      targetCamX = Math.sin(angle) * 3.3;
      targetCamY = 0.35 + Math.sin(time * 0.6) * 0.08;
      targetCamZ = Math.cos(angle) * 3.3;
      lookAtY = 0.12;
    }

    // Add real-time pointer operator offsets (makes the operator pivot visually reactive to mouse)
    const activeCamX = targetCamX + mx * 0.45;
    const activeCamY = targetCamY + my * 0.35;

    state.camera.position.lerp(new THREE.Vector3(activeCamX, activeCamY, targetCamZ), 0.035);
    
    const lookTarget = new THREE.Vector3(0, lookAtY, 0);
    const currentLook = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion).add(state.camera.position);
    currentLook.lerp(lookTarget, 0.035);
    state.camera.lookAt(currentLook);
  });

  return null;
}

export default function GeneratorVisual3D({
  activeStep,
  reduced = false,
}: GeneratorVisual3DProps) {
  return (
    <Canvas
      style={CANVAS_STYLE}
      camera={{ position: [0, 0.3, 4.2], fov: 40 }}
      gl={{ antialias: !reduced, alpha: true }}
    >
      <CameraController activeStep={activeStep} reduced={reduced} />
      
      {/* Cinematic Studio Lights */}
      <ambientLight intensity={0.15} />
      
      {/* Key & Fill lighting */}
      <directionalLight position={[5, 4, 5]} intensity={1.8} color="hsl(42, 100%, 65%)" />
      <directionalLight position={[-5, 4, -5]} intensity={1.2} color="hsl(180, 100%, 60%)" />
      
      {/* HIGH-INTENSITY RIM BACKLIGHT FOR METALLIC HALO OUTLINES */}
      <directionalLight position={[0, 2.5, -4]} intensity={3.5} color="#ffffff" />
      
      {/* Volumetric spotlight beam and particles */}
      <SpotlightCone activeStep={activeStep} />
      <AuditionSparks activeStep={activeStep} />
      <AtmosphericDustMotes />
      
      {/* Step specific interactive elements */}
      <BurningEmbers active={activeStep === 3} />
      <PaparazziFlashes active={activeStep === 4} />
      <FloatingScript active={activeStep === 2} />
      <StageClapperboard active={activeStep === 0} />
      
      {/* Chrome Vintage Microphone */}
      <VintageMicrophone activeStep={activeStep} />
      
      {/* Reflective stage floor with metal inlay details */}
      <group position={[0, -1.95, 0]}>
        <mesh>
          <cylinderGeometry args={[2.5, 2.5, 0.05, 32]} />
          <meshStandardMaterial color="#0b0b0b" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Metal Concentric Trim Rings */}
        <mesh position={[0, 0.026, 0]}>
          <torusGeometry args={[2.2, 0.008, 6, 32]} />
          <meshStandardMaterial color="hsl(42, 100%, 55%)" roughness={0.1} metalness={1.0} />
        </mesh>
        <mesh position={[0, 0.026, 0]}>
          <torusGeometry args={[1.5, 0.006, 6, 32]} />
          <meshStandardMaterial color="hsl(42, 100%, 55%)" roughness={0.1} metalness={1.0} />
        </mesh>
      </group>
      
      {/* Floor Spotlight glow reflection pool */}
      <mesh position={[0, -1.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial 
          color={activeStep === 3 ? "hsl(350, 78%, 50%)" : (activeStep === 6 ? "hsl(42, 100%, 50%)" : "hsl(180, 100%, 50%)")}
          transparent 
          opacity={0.35} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <fog attach="fog" args={['#020202', 3, 10]} />
    </Canvas>
  );
}
