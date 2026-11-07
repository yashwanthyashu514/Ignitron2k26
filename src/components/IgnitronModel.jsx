import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Resize, Float } from '@react-three/drei';
import * as THREE from 'three';

// Preload the 3D model
useGLTF.preload('/models/MeshEntity.glb');

/**
 * Floating futuristic energy particles orbiting the 3D model
 */
function EnergyParticles({ isMobile = false }) {
  const particlesRef = useRef();
  const count = isMobile ? 45 : 65;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyanColor = new THREE.Color('#00D9FF');
    const emeraldColor = new THREE.Color('#00E676');
    const whiteColor = new THREE.Color('#F8FAFC');

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.15 + Math.random() * 0.45;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const color = i % 3 === 0 ? cyanColor : i % 3 === 1 ? emeraldColor : whiteColor;
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.elapsedTime;
      particlesRef.current.rotation.y = t * 0.15;
      particlesRef.current.rotation.x = Math.sin(t * 0.08) * 0.18;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.055 : 0.065}
        vertexColors
        transparent
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Holographic anti-gravity levitation pedestal
 * Refined thin concentric energy rings - never cuts off or slices the avatar
 */
function CyberPedestal({ isMobile = false }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.28;
      ring1Ref.current.material.opacity = 0.35 + Math.sin(t * 1.8) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.38;
      ring2Ref.current.material.opacity = 0.45 + Math.cos(t * 2.2) * 0.15;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.16;
      ring3Ref.current.material.opacity = 0.25 + Math.sin(t * 1.2) * 0.1;
    }
  });

  const posY = isMobile ? -1.38 : -1.25;

  return (
    <group position={[0, posY, 0]}>
      {/* Inner cyan pulse ring - thin & crisp */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.60, 0.63, 64]} />
        <meshBasicMaterial
          color="#00D9FF"
          transparent
          opacity={0.42}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Mid emerald energy ring - thin & radiant */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.88, 0.92, 64]} />
        <meshBasicMaterial
          color="#00E676"
          transparent
          opacity={0.52}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer ambient beacon ring - graceful boundary */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.15, 64]} />
        <meshBasicMaterial
          color="#00D9FF"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Main 3D Model:
 * - Perfectly centered and sized to clean medium dimensions (scale 2.55, scaled to 3.15 on mobile)
 * - Smooth lerped rotation based on cursor
 * - Silky floating motion
 * - Hover & proximity response
 */
export default function IgnitronModel({
  mouseX,
  mouseY,
  isHovered,
  dragRotRef,
  velocityRef,
  isDraggingRef,
  isMobile = false,
}) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/MeshEntity.glb');

  // Clone materials once and index emissive materials for fast per-frame updates
  const { clonedScene, emissiveMaterials } = useMemo(() => {
    const cloned = scene.clone(true);
    const emissiveMats = [];

    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material.clone();
        mat.roughness = THREE.MathUtils.clamp(mat.roughness ?? 0.4, 0.2, 0.45);
        mat.metalness = THREE.MathUtils.clamp(mat.metalness ?? 0.6, 0.65, 0.95);
        
        if (!mat.emissive) mat.emissive = new THREE.Color();
        mat.emissive.set('#001e14');
        mat.emissiveIntensity = 0.45;
        
        child.material = mat;
        child.castShadow = true;
        emissiveMats.push(mat);
      }
    });

    return { clonedScene: cloned, emissiveMaterials: emissiveMats };
  }, [scene]);

  // Target and current values for smooth lerping
  const targetTiltY = useRef(0);
  const targetTiltX = useRef(0);
  const currentTiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentScale = useRef(1);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Drag & Inertia Physics (rotates 360 degrees on mobile touch & desktop drag)
    if (dragRotRef?.current && velocityRef?.current) {
      if (!isDraggingRef?.current) {
        // Apply friction to velocity or maintain graceful ambient spin
        if (Math.abs(velocityRef.current.y) > 0.0001) {
          dragRotRef.current.y += velocityRef.current.y;
          velocityRef.current.y *= 0.93; // Smooth damping
        } else {
          // Graceful continuous ambient auto-spin when idle
          dragRotRef.current.y += 0.006;
        }

        if (Math.abs(velocityRef.current.x) > 0.0001) {
          dragRotRef.current.x = Math.max(-0.32, Math.min(0.32, dragRotRef.current.x + velocityRef.current.x));
          velocityRef.current.x *= 0.93;
        } else {
          // Slowly ease vertical pitch back towards neutral
          dragRotRef.current.x += (0 - dragRotRef.current.x) * 0.025;
        }
      }
    }

    // 2. Cursor/touch position tilt (gentle to keep all parts fully within view)
    targetTiltY.current = (mouseX ?? 0) * 0.28;
    targetTiltX.current = -(mouseY ?? 0) * 0.16;

    const lerpSpeed = 0.06;
    currentTiltY.current += (targetTiltY.current - currentTiltY.current) * lerpSpeed;
    currentTiltX.current += (targetTiltX.current - currentTiltX.current) * lerpSpeed;

    // 3. Hover scale boost
    const baseTargetScale = isHovered ? 1.04 : 1.0;
    currentScale.current += (baseTargetScale - currentScale.current) * 0.06;

    if (groupRef.current) {
      const dragY = dragRotRef?.current?.y ?? (t * 0.09);
      const dragX = dragRotRef?.current?.x ?? 0;

      // Full 360-degree rotation + tilt + subtle breathing wave
      groupRef.current.rotation.y = dragY + currentTiltY.current;
      groupRef.current.rotation.x = dragX + currentTiltX.current + Math.sin(t * 0.4) * 0.03;

      // Mouse distance subtle scale
      const mouseDist = Math.sqrt((mouseX ?? 0) ** 2 + (mouseY ?? 0) ** 2);
      const proximityScale = 1 + mouseDist * 0.02;
      groupRef.current.scale.setScalar(currentScale.current * proximityScale);

      // Fast cached emissive pulse without tree traversal
      const hoverBoost = isHovered ? 0.45 : 0;
      const intensity = 0.4 + Math.sin(t * 2) * 0.15 + hoverBoost;
      for (let i = 0; i < emissiveMaterials.length; i++) {
        emissiveMaterials[i].emissiveIntensity = intensity;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Silky smooth floating animation with safe margins (never clips head or feet) */}
      <Float
        speed={1.6}
        rotationIntensity={0.15}
        floatIntensity={0.25}
        floatingRange={[-0.03, 0.03]}
      >
        {/* Center and scale to bold prominent size with clean headroom & footroom */}
        <Center>
          <Resize scale={isMobile ? 3.0 : 2.6}>
            <primitive object={clonedScene} />
          </Resize>
        </Center>
      </Float>

      {/* Orbiting particles and refined holographic pedestal */}
      <EnergyParticles isMobile={isMobile} />
      <CyberPedestal isMobile={isMobile} />
    </group>
  );
}
