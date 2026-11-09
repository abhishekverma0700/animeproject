"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Icosahedron, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { usePerformance } from "./PerformanceContext";

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

  // Clean light theme: Neutral dark wireframe with single #FF4D00 accent
  const colorDark = useMemo(() => new THREE.Color("#1a1a1a"), []);
  const colorAccent = useMemo(() => new THREE.Color("#FF4D00"), []);
  const colorGrey = useMemo(() => new THREE.Color("#6B6B6B"), []);
  const currentColor = useMemo(() => new THREE.Color("#1a1a1a"), []);

  // Capped particle count: 250 floating particles in soft grey
  const particleCount = 250;
  const particlesPositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.25) * 11;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

    // 1. Interpolate target color, distortion, and scale based on progress
    let targetColor: THREE.Color;
    let targetScale = 1.2;
    let targetDistort = 0.35;

    if (p < 0.5) {
      const t = p / 0.5;
      targetColor = currentColor.copy(colorDark).lerp(colorAccent, t);
      targetScale = THREE.MathUtils.lerp(1.2, 1.5, t);
      targetDistort = THREE.MathUtils.lerp(0.35, 0.65, t);
    } else {
      const t = (p - 0.5) / 0.5;
      targetColor = currentColor.copy(colorAccent).lerp(colorGrey, t);
      targetScale = THREE.MathUtils.lerp(1.5, 1.35, t);
      targetDistort = THREE.MathUtils.lerp(0.65, 0.38, t);
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

      meshRef.current.rotation.x += delta * 0.22;
      meshRef.current.rotation.y += delta * 0.28 + p * 0.02;
    }

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
      <ambientLight intensity={0.65} />
      <pointLight
        ref={pointLightRef}
        position={[2.5, 1.2, 1]}
        intensity={3}
        color="#FF4D00"
      />

      <group ref={globeGroupRef} position={[1.85, 0.35, -0.8]}>
        <Icosahedron ref={meshRef} args={[1.15, 3]}>
          <MeshDistortMaterial
            ref={materialRef}
            wireframe
            distort={0.35}
            speed={2.2}
            roughness={0.2}
            metalness={0.8}
            color="#1a1a1a"
          />
        </Icosahedron>

        <Icosahedron ref={glowMeshRef} args={[0.9, 2]}>
          <meshBasicMaterial
            ref={glowMaterialRef}
            wireframe
            transparent
            opacity={0.15}
            color="#FF4D00"
          />
        </Icosahedron>
      </group>

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
          opacity={0.45}
          sizeAttenuation
          color="#8C8A82"
        />
      </points>
    </>
  );
}

export default function HeroScene({ progressRef }: HeroSceneProps) {
  const { activeCanvas, requestActiveCanvas, releaseActiveCanvas, isLiteMode } = usePerformance();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isFarAway, setIsFarAway] = useState(false);
  const [dpr, setDpr] = useState<number>(1.25);

  useEffect(() => {
    const checkEligibility = () => {
      const isDesktop = window.innerWidth >= 768;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setIsEnabled(isDesktop && !reducedMotion && !isLiteMode);
    };

    checkEligibility();
    window.addEventListener("resize", checkEligibility);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", checkEligibility);

    const heroEl = document.getElementById("hero");
    let observer: IntersectionObserver | null = null;
    if (heroEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const inView = entry.isIntersecting;
          setIsInView(inView);
          if (inView) {
            requestActiveCanvas("hero");
          } else {
            releaseActiveCanvas("hero");
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(heroEl);
    }

    // Scroll listener to unmount canvas when scrolled far away (> 1.5x viewport height)
    const handleScroll = () => {
      const scrolledPast = window.scrollY > window.innerHeight * 1.5;
      setIsFarAway(scrolledPast);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", checkEligibility);
      window.removeEventListener("scroll", handleScroll);
      mql.removeEventListener("change", checkEligibility);
      if (observer) observer.disconnect();
      releaseActiveCanvas("hero");
    };
  }, [requestActiveCanvas, releaseActiveCanvas, isLiteMode]);

  // Only render when enabled, not in lite mode, and not scrolled far away
  if (!isEnabled || isFarAway) return null;

  const shouldRender = isInView && activeCanvas === "hero";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[5] w-full h-full overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        dpr={dpr}
        frameloop={shouldRender ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full bg-transparent"
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.25)}
        />
        <SceneContent progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
