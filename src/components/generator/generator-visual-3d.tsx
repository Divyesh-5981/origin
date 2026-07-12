'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
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

// --- HIGH-FIDELITY CHROME VINTAGE MICROPHONE ---
function VintageMicrophone({ activeStep }: { activeStep: number }) {
  const micHeadRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Rib count for the vintage Shure-style grille
  const ribs = Array.from({ length: 6 });

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Mic head floating vibration
    if (micHeadRef.current) {
      micHeadRef.current.position.y = 0.65 + Math.sin(time * 2.5) * 0.015;
    }

    // Expanding soundwave particle rings (Step 2 - Passion)
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
    color: activeStep === 6 ? new THREE.Color('hsl(42, 100%, 55%)') : new THREE.Color('#dcdcdc'),
    metalness: 1.0,
    roughness: 0.05, // Mirror chrome reflections
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
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
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
        {/* Swivel joint bracket */}
        <mesh position={[0, 1.95, 0]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
          <primitive object={chromeMaterial} attach="material" />
        </mesh>
        
        {/* U-Shape Mount Holder */}
        <group position={[0, 2.05, 0.02]} rotation={[0.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.015, 8, 16, Math.PI]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>

        {/* Vintage Ribbed Mic Capsule */}
        <group position={[0, 2.12, 0.02]} rotation={[0.2, 0, 0]}>
          {/* Inner dark core */}
          <mesh>
            <cylinderGeometry args={[0.09, 0.08, 0.22, 16]} />
            <meshBasicMaterial color="#080808" />
          </mesh>

          {/* Stacking horizontal chrome ribs */}
          {ribs.map((_, i) => (
            <mesh key={i} position={[0, i * 0.04 - 0.1, 0]}>
              <torusGeometry args={[0.095 - Math.abs(i - 2.5) * 0.005, 0.012, 8, 20]} />
              <primitive object={chromeMaterial} attach="material" />
            </mesh>
          ))}
          
          {/* Vertical central chrome spine */}
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

// --- FLOATING SCRIPT PAGES (Step 2) ---
function FloatingScript({ active }: { active: boolean }) {
  const page1Ref = useRef<THREE.Mesh>(null);
  const page2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!page1Ref.current || !page2Ref.current) return;
    const time = state.clock.elapsedTime;
    
    if (active) {
      const radius1 = 1.1 + Math.sin(time) * 0.08;
      const radius2 = 1.3 + Math.cos(time) * 0.08;
      const angle1 = time * 0.7;
      const angle2 = time * 0.7 + Math.PI;

      page1Ref.current.position.set(Math.cos(angle1) * radius1, 0.25 + Math.sin(time * 2.2) * 0.08, Math.sin(angle1) * radius1);
      page2Ref.current.position.set(Math.cos(angle2) * radius2, 0.45 + Math.cos(time * 2.2) * 0.08, Math.sin(angle2) * radius2);
      
      page1Ref.current.rotation.set(0.15, angle1 + Math.PI / 2, Math.sin(time) * 0.15);
      page2Ref.current.rotation.set(-0.15, angle2 + Math.PI / 2, Math.cos(time) * 0.15);
      
      page1Ref.current.scale.setScalar(1);
      page2Ref.current.scale.setScalar(1);
    } else {
      page1Ref.current.scale.setScalar(0);
      page2Ref.current.scale.setScalar(0);
    }
  });

  return (
    <group>
      <mesh ref={page1Ref}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} wireframe />
      </mesh>
      <mesh ref={page2Ref}>
        <planeGeometry args={[0.38, 0.48]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} wireframe />
      </mesh>
    </group>
  );
}

// --- CLAPPERBOARD ON STOOL (Step 0) ---
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
      {/* Stool */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.4, 12]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      
      {/* Clapperboard base */}
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
    
    // Smooth color shift on shader
    const targetColor = colors[activeStep] || colors[0];
    shaderMatRef.current.uniforms.uColor.value.lerp(targetColor, 0.05);

    // Flicker spotlight on Step 3 (Trial)
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

function CameraController({ activeStep, reduced }: { activeStep: number; reduced: boolean }) {
  useFrame((state) => {
    if (reduced) return;
    
    const time = state.clock.elapsedTime;

    let targetCamX = 0;
    let targetCamY = 0.5;
    let targetCamZ = 4.8;
    let lookAtY = 0.15;

    if (activeStep === 3) {
      // Step 3 (Trial): Moody close profile
      targetCamX = 1.0;
      targetCamY = 0.15;
      targetCamZ = 2.2;
      lookAtY = 0.18;
    } else if (activeStep === 4) {
      // Step 4 (Breakthrough): Sweeping wide upward angle
      targetCamX = Math.sin(time * 0.8) * 0.8;
      targetCamY = -0.4;
      targetCamZ = 3.3;
      lookAtY = 0.35;
    } else if (activeStep === 6) {
      // Step 6 (Summary): Overhead golden rotation
      targetCamX = Math.sin(time * 0.25) * 3.5;
      targetCamY = 1.1;
      targetCamZ = Math.cos(time * 0.25) * 3.5;
      lookAtY = -0.1;
    } else {
      // Standard: Smooth floating pan
      const angle = time * 0.15;
      targetCamX = Math.sin(angle) * 3.3;
      targetCamY = 0.35 + Math.sin(time * 0.6) * 0.08;
      targetCamZ = Math.cos(angle) * 3.3;
      lookAtY = 0.12;
    }

    state.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.035);
    
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
      
      {/* High-quality key and backlighting for chrome metallic reflections */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 4, 5]} intensity={2.0} color="hsl(42, 100%, 65%)" />
      <directionalLight position={[-5, 4, -5]} intensity={1.5} color="hsl(180, 100%, 60%)" />
      
      {/* Volumetric spotlight beam */}
      <SpotlightCone activeStep={activeStep} />
      <AuditionSparks activeStep={activeStep} />
      
      {/* Chrome Vintage Microphone */}
      <VintageMicrophone activeStep={activeStep} />
      
      {/* Audition Props */}
      <FloatingScript active={activeStep === 2} />
      <StageClapperboard active={activeStep === 0} />
      
      {/* Circular wood stage floor */}
      <mesh position={[0, -1.95, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.05, 32]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.8} />
      </mesh>
      
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
