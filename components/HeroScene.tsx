"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

interface HeroSceneProps {
  progressRef: React.MutableRefObject<number>;
}

type DistortMaterialType = React.ComponentRef<typeof MeshDistortMaterial>;

// Inner 3D Content
function SceneContent({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<DistortMaterialType>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particlesMaterialRef = useRef<THREE.PointsMaterial>(null);

  // Colors for states: State 0 (White) -> State 1 (Electric Blue) -> State 2 (Purple) -> State 3 (White)
  const colorWhite = useMemo(() => new THREE.Color("#ffffff"), []);
  const colorBlue = useMemo(() => new THREE.Color("#00f0ff"), []);
  const colorPurple = useMemo(() => new THREE.Color("#b026ff"), []);
  const currentColor = useMemo(() => new THREE.Color("#ffffff"), []);

  // 800 small floating particles
  const particleCount = 800;
  const particlesPositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.25) * 11; // X spread (biased right)
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8; // Y spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1; // Z spread behind camera
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

    // 1. Interpolate target color, distortion, and scale based on progress
    let targetColor: THREE.Color;
    let targetScale = 1.2;
    let targetDistort = 0.35;

    if (p < 0.33) {
      // State 0 -> State 1: White to Electric Blue
      const t = p / 0.33;
      targetColor = currentColor.copy(colorWhite).lerp(colorBlue, t);
      targetScale = THREE.MathUtils.lerp(1.2, 1.55, t);
      targetDistort = THREE.MathUtils.lerp(0.35, 0.72, t);
    } else if (p < 0.66) {
      // State 1 -> State 2: Electric Blue to Purple
      const t = (p - 0.33) / 0.33;
      targetColor = currentColor.copy(colorBlue).lerp(colorPurple, t);
      targetScale = THREE.MathUtils.lerp(1.55, 1.35, t);
      targetDistort = THREE.MathUtils.lerp(0.72, 0.52, t);
    } else {
      // State 2 -> State 3: Purple back to White
      const t = (p - 0.66) / 0.34;
      targetColor = currentColor.copy(colorPurple).lerp(colorWhite, t);
      targetScale = THREE.MathUtils.lerp(1.35, 1.45, t);
      targetDistort = THREE.MathUtils.lerp(0.52, 0.38, t);
    }

    // 2. Animate Wireframe Icosahedron & Glow
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 0.08);
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort || 0.35,
        targetDistort,
        0.08
      );
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.color.lerp(targetColor, 0.08);
    }

    if (meshRef.current) {
      const curScale = meshRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.08);
      meshRef.current.scale.set(nextScale, nextScale, nextScale);

      // Continuous rotation + scroll-driven spin
      meshRef.current.rotation.x += delta * 0.22;
      meshRef.current.rotation.y += delta * 0.28 + p * 0.02;
    }

    // 3D globe group slightly tilting toward mouse
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.x,
        -state.pointer.y * 0.35,
        0.06
      );
      globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.y,
        state.pointer.x * 0.45,
        0.06
      );
    }

    if (glowMeshRef.current && meshRef.current) {
      glowMeshRef.current.rotation.copy(meshRef.current.rotation);
      glowMeshRef.current.scale.copy(meshRef.current.scale).multiplyScalar(0.85);
    }

    if (pointLightRef.current) {
      pointLightRef.current.color.lerp(targetColor, 0.08);
    }

    // 3. Floating particles rotation and color
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.035;
      particlesRef.current.rotation.x += delta * 0.02;
    }
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.color.lerp(targetColor, 0.08);
    }

    // 4. Subtle mouse parallax on camera
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      state.pointer.x * 0.45,
      0.05
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      state.pointer.y * 0.35,
      0.05
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight
        ref={pointLightRef}
        position={[2.5, 1.2, 1]}
        intensity={4}
        color="#ffffff"
      />

      {/* Wireframe Distorted Icosahedron behind person's shoulder */}
      <group ref={globeGroupRef} position={[1.85, 0.35, -0.8]}>
        <Icosahedron ref={meshRef} args={[1.15, 3]}>
          <MeshDistortMaterial
            ref={materialRef}
            wireframe
            distort={0.35}
            speed={2.2}
            roughness={0.15}
            metalness={0.9}
            color="#ffffff"
          />
        </Icosahedron>

        {/* Subtle inner ethereal core glow */}
        <Icosahedron ref={glowMeshRef} args={[0.9, 2]}>
          <meshBasicMaterial
            ref={glowMaterialRef}
            wireframe
            transparent
            opacity={0.18}
            color="#ffffff"
          />
        </Icosahedron>
      </group>

      {/* Floating particles (~800 points) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlesPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={particlesMaterialRef}
          size={0.032}
          transparent
          opacity={0.55}
          sizeAttenuation
          color="#ffffff"
        />
      </points>
    </>
  );
}

export default function HeroScene({ progressRef }: HeroSceneProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    // Disable on mobile (< 768px) and respect prefers-reduced-motion
    const checkEligibility = () => {
      const isDesktop = window.innerWidth >= 768;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setIsEnabled(isDesktop && !reducedMotion);
    };

    checkEligibility();
    window.addEventListener("resize", checkEligibility);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", checkEligibility);

    // Track hero visibility with IntersectionObserver for frameloop optimization
    const heroEl = document.getElementById("hero");
    let observer: IntersectionObserver | null = null;
    if (heroEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold: 0.05 }
      );
      observer.observe(heroEl);
    }

    return () => {
      window.removeEventListener("resize", checkEligibility);
      mql.removeEventListener("change", checkEligibility);
      if (observer) observer.disconnect();
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[5] w-full h-full overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        dpr={[1, 1.5]}
        frameloop={isInView ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full bg-transparent"
      >
        <SceneContent progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
