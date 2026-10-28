"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, RoundedBox, Text, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { SKILLS_DATA, SkillCategory, SkillItem } from "@/data/skills";

// Orbital configuration for the 4 categories
const CATEGORY_RINGS = [
  {
    id: "frontend",
    radius: 2.3,
    tilt: new THREE.Euler(0.34, 0.12, 0.1),
    speed: 0.14,
  },
  {
    id: "backend",
    radius: 3.1,
    tilt: new THREE.Euler(-0.3, 0.22, -0.18),
    speed: -0.11,
  },
  {
    id: "cloud",
    radius: 3.9,
    tilt: new THREE.Euler(0.24, -0.3, 0.22),
    speed: 0.09,
  },
  {
    id: "tools",
    radius: 4.7,
    tilt: new THREE.Euler(-0.36, 0.16, -0.28),
    speed: -0.08,
  },
];

interface SkillPillProps {
  skill: SkillItem;
  category: SkillCategory;
  index: number;
  totalOnRing: number;
  radius: number;
  progressRef: React.MutableRefObject<number>;
  smoothProgressRef: React.MutableRefObject<number>;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (skill: SkillItem, category: SkillCategory) => void;
  onUnhover: () => void;
}

function SkillPill({
  skill,
  category,
  index,
  totalOnRing,
  radius,
  smoothProgressRef,
  isHovered,
  isDimmed,
  onHover,
  onUnhover,
}: SkillPillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const borderMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const dotMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const textRef = useRef<React.ElementRef<typeof Text>>(null);

  // Dynamic sizing based on skill name length
  const pillWidth = Math.max(0.9, skill.name.length * 0.095 + 0.48);
  const pillHeight = 0.36;

  // Calculate static position on orbit ring
  const baseAngle = (index / totalOnRing) * Math.PI * 2;
  const targetX = Math.cos(baseAngle) * radius;
  const targetZ = Math.sin(baseAngle) * radius;
  const stagger = (index / totalOnRing) * 0.35;

  useFrame(() => {
    if (!groupRef.current) return;

    const p = smoothProgressRef.current;
    const flyProgress = Math.min(Math.max((p - 0.5) / 0.4, 0), 1);
    const u = Math.min(Math.max((flyProgress - stagger) / 0.65, 0), 1);
    const eased = 1 - Math.pow(1 - u, 3); // easeOutCubic

    const currentX = targetX * eased;
    const currentZ = targetZ * eased;
    const currentY = Math.sin(u * Math.PI) * 0.45 * (index % 2 === 0 ? 1 : -1);

    groupRef.current.position.set(currentX, currentY, currentZ);

    const targetScale =
      eased * (isHovered ? 1.34 : isDimmed ? 0.82 : 1.0);
    const curScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.12);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Opacity management
    const baseAlpha = Math.min(u * 2, 1);
    const bodyAlpha = baseAlpha * (isHovered ? 0.95 : isDimmed ? 0.2 : 0.82);
    const borderAlpha =
      baseAlpha * (isHovered ? 0.95 : isDimmed ? 0.12 : 0.4);

    if (bodyMatRef.current) {
      bodyMatRef.current.opacity = bodyAlpha;
    }
    if (borderMatRef.current) {
      borderMatRef.current.opacity = borderAlpha;
    }
    if (dotMatRef.current) {
      dotMatRef.current.opacity = bodyAlpha;
    }
    if (textRef.current) {
      textRef.current.fillOpacity = isDimmed ? 0.35 : 1.0;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <Billboard follow={true}>
        {/* Glowing pill border */}
        <RoundedBox
          args={[pillWidth + 0.03, pillHeight + 0.03, 0.02]}
          radius={0.16}
          smoothness={4}
          position={[0, 0, -0.005]}
        >
          <meshBasicMaterial
            ref={borderMatRef}
            color={category.accent}
            transparent
            opacity={0}
          />
        </RoundedBox>

        {/* Glass body */}
        <RoundedBox
          args={[pillWidth, pillHeight, 0.03]}
          radius={0.15}
          smoothness={4}
        >
          <meshPhysicalMaterial
            ref={bodyMatRef}
            color="#080c12"
            transmission={0.7}
            roughness={0.18}
            metalness={0.1}
            transparent
            opacity={0}
            reflectivity={0.8}
            clearcoat={1.0}
            clearcoatRoughness={0.15}
          />
        </RoundedBox>

        {/* Category Accent Dot */}
        <mesh position={[-pillWidth / 2 + 0.18, 0, 0.022]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial
            ref={dotMatRef}
            color={category.accent}
            transparent
            opacity={0}
          />
        </mesh>

        {/* Skill Name Text */}
        <Text
          ref={textRef}
          font="/fonts/sans.ttf"
          position={[0.07, 0, 0.025]}
          fontSize={0.135}
          color={isHovered ? "#ffffff" : isDimmed ? "#64748b" : "#f1f5f9"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
        >
          {skill.name}
        </Text>

        {/* Invisible Hit Plane for Buttery Smooth Pointer Detection */}
        <mesh
          position={[0, 0, 0.04]}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(skill, category);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onUnhover();
          }}
          visible={false}
        >
          <planeGeometry args={[pillWidth + 0.18, pillHeight + 0.18]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Billboard>
    </group>
  );
}

interface SceneContentProps {
  progressRef: React.MutableRefObject<number>;
  selectedCategoryId: string | null;
  hoveredSkill: { skill: SkillItem; category: SkillCategory } | null;
  onHoverSkill: (skill: SkillItem, category: SkillCategory) => void;
  onUnhoverSkill: () => void;
}

function SceneContent({
  progressRef,
  selectedCategoryId,
  hoveredSkill,
  onHoverSkill,
  onUnhoverSkill,
}: SceneContentProps) {
  const orbGroupRef = useRef<THREE.Group>(null);
  const topHemiGroupRef = useRef<THREE.Group>(null);
  const bottomHemiGroupRef = useRef<THREE.Group>(null);
  const topHemiMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const bottomHemiMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const topWireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const bottomWireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const seamRef = useRef<THREE.Mesh>(null);
  const seamMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreCageRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  // Lerped progress for 60fps liquid response
  const smoothProgress = useRef(0);
  const isDraggingOrbit = useRef(false);

  // Store ring group refs
  const ringRotateRefs = useRef<{ [key: string]: THREE.Group | null }>({});
  const ringTrackMatRefs = useRef<{ [key: string]: THREE.MeshBasicMaterial | null }>({});

  // Shared Geometries to optimize memory and performance
  const topHemiGeo = useMemo(
    () => new THREE.SphereGeometry(1.55, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    []
  );
  const bottomHemiGeo = useMemo(
    () =>
      new THREE.SphereGeometry(
        1.55,
        36,
        18,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI / 2
      ),
    []
  );
  const seamGeo = useMemo(() => new THREE.TorusGeometry(1.56, 0.022, 16, 64), []);
  const coreGeo = useMemo(() => new THREE.SphereGeometry(0.38, 32, 32), []);
  const coreCageGeo = useMemo(() => new THREE.IcosahedronGeometry(0.55, 1), []);
  const beamGeo = useMemo(
    () => new THREE.CylinderGeometry(0.16, 0.65, 5.5, 32, 1, true),
    []
  );
  const ringGeos = useMemo(
    () =>
      CATEGORY_RINGS.map(
        (r) => new THREE.TorusGeometry(r.radius, 0.014, 12, 128)
      ),
    []
  );

  // Pre-calculate categories data with ring configuration
  const categoryMap = useMemo(() => {
    return SKILLS_DATA.categories.map((cat, idx) => {
      const ringConfig = CATEGORY_RINGS[idx] || CATEGORY_RINGS[0];
      return {
        ...cat,
        ringConfig,
        geo: ringGeos[idx] || ringGeos[0],
      };
    });
  }, [ringGeos]);

  useFrame((state, delta) => {
    // 1. Lerp scroll progress
    smoothProgress.current = THREE.MathUtils.lerp(
      smoothProgress.current,
      progressRef.current,
      0.08
    );
    const p = smoothProgress.current;
    const time = state.clock.elapsedTime;

    // 2. Base camera positioning & push-in calculation
    let targetCameraZ = 8.4;
    if (p > 0.3 && p <= 0.55) {
      const t = (p - 0.3) / 0.25;
      targetCameraZ = THREE.MathUtils.lerp(8.4, 7.2, t);
    } else if (p > 0.55) {
      targetCameraZ = 7.2;
    }

    // Mouse parallax on camera when OrbitControls is not actively dragged
    const canOrbit = p >= 0.88;
    if (!canOrbit || !isDraggingOrbit.current) {
      const mouseFactorX = state.pointer.x * 0.55;
      const mouseFactorY = state.pointer.y * 0.35;
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        mouseFactorX,
        0.05
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        mouseFactorY,
        0.05
      );
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        targetCameraZ,
        0.06
      );
      state.camera.lookAt(0, 0, 0);
    }

    // 3. Phase 0 - 0.3: Dormant Orb Rotation & Seam Glow
    if (orbGroupRef.current) {
      if (p < 0.9) {
        orbGroupRef.current.rotation.y += delta * 0.22;
        orbGroupRef.current.rotation.x = Math.sin(time * 0.6) * 0.04;
      }
    }

    if (seamMatRef.current) {
      const seamPulse = 0.65 + 0.3 * Math.sin(time * 3.5);
      if (p <= 0.3) {
        seamMatRef.current.opacity = seamPulse;
      } else if (p < 0.55) {
        const t = (p - 0.3) / 0.25;
        seamMatRef.current.opacity = (1 - t) * seamPulse;
      } else {
        seamMatRef.current.opacity = 0;
      }
    }

    // 4. Phase 0.3 - 0.55: Hemispheres separate along Y with slight tilt, Light beam bursts
    let separation = 0;
    let hemiTilt = 0;
    if (p > 0.3 && p <= 0.55) {
      const t = (p - 0.3) / 0.25;
      const easedSep = 1 - Math.pow(1 - t, 3);
      separation = easedSep * 0.85;
      hemiTilt = easedSep * 0.12;

      // Light beam burst
      const beamPeak = Math.sin(t * Math.PI);
      if (beamRef.current && beamMatRef.current) {
        beamRef.current.scale.set(
          1 + beamPeak * 0.7,
          easedSep * 1.3,
          1 + beamPeak * 0.7
        );
        beamMatRef.current.opacity = beamPeak * 0.75;
      }

      if (pointLightRef.current) {
        pointLightRef.current.intensity = 3 + beamPeak * 7;
      }
    } else if (p > 0.55) {
      separation = 0.85;
      hemiTilt = 0.12;
      if (beamMatRef.current) {
        beamMatRef.current.opacity = THREE.MathUtils.lerp(
          beamMatRef.current.opacity,
          0.05,
          0.1
        );
      }
      if (pointLightRef.current) {
        pointLightRef.current.intensity = THREE.MathUtils.lerp(
          pointLightRef.current.intensity,
          3.5,
          0.1
        );
      }
    } else {
      if (beamMatRef.current) beamMatRef.current.opacity = 0;
      if (pointLightRef.current) pointLightRef.current.intensity = 2.5;
    }

    // 5. Phase 0.9 - 1.0: Hemispheres fade/shrink to a small glowing core
    let hemiScale = 1.0;
    let hemiOpacity = 0.78;
    let coreScale = 1.0;

    if (p >= 0.9) {
      const t = Math.min((p - 0.9) / 0.1, 1);
      hemiScale = Math.max(0, 1 - t);
      hemiOpacity = (1 - t) * 0.78;
      coreScale = THREE.MathUtils.lerp(1.0, 0.45, t);
    }

    if (topHemiGroupRef.current) {
      topHemiGroupRef.current.position.y = separation;
      topHemiGroupRef.current.rotation.z = hemiTilt;
      topHemiGroupRef.current.rotation.x = hemiTilt * 0.5;
      topHemiGroupRef.current.scale.set(hemiScale, hemiScale, hemiScale);
    }

    if (bottomHemiGroupRef.current) {
      bottomHemiGroupRef.current.position.y = -separation;
      bottomHemiGroupRef.current.rotation.z = -hemiTilt;
      bottomHemiGroupRef.current.rotation.x = -hemiTilt * 0.5;
      bottomHemiGroupRef.current.scale.set(hemiScale, hemiScale, hemiScale);
    }

    if (topHemiMatRef.current) topHemiMatRef.current.opacity = hemiOpacity;
    if (bottomHemiMatRef.current) bottomHemiMatRef.current.opacity = hemiOpacity;
    if (topWireMatRef.current) topWireMatRef.current.opacity = hemiOpacity * 0.28;
    if (bottomWireMatRef.current) bottomWireMatRef.current.opacity = hemiOpacity * 0.28;

    // Core pulsing & rotation
    if (coreGroupRef.current) {
      coreGroupRef.current.scale.set(coreScale, coreScale, coreScale);
    }
    if (coreCageRef.current) {
      coreCageRef.current.rotation.y += delta * 0.8;
      coreCageRef.current.rotation.x += delta * 0.5;
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity =
        2.2 + 0.6 * Math.sin(time * 4);
    }

    // 6. Rings continuous rotation (freeze if hovered)
    const flyProgress = Math.min(Math.max((p - 0.5) / 0.4, 0), 1);
    categoryMap.forEach((cat) => {
      const rotGroup = ringRotateRefs.current[cat.id];
      const trackMat = ringTrackMatRefs.current[cat.id];

      const isCatSelected = selectedCategoryId === cat.id;
      const isAnyCatSelected = selectedCategoryId !== null;
      const isHoveredCat = hoveredSkill?.category.id === cat.id;
      const isDimmedCat = isAnyCatSelected && !isCatSelected;

      if (trackMat) {
        trackMat.opacity =
          Math.min(flyProgress * 1.5, 1) *
          (isHoveredCat || isCatSelected ? 0.8 : isDimmedCat ? 0.12 : 0.38);
      }

      if (rotGroup) {
        const isThisRingHovered = hoveredSkill?.category.id === cat.id;
        if (!isThisRingHovered && p >= 0.5) {
          rotGroup.rotation.y += delta * cat.ringConfig.speed;
        }
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-5, -4, -4]} intensity={0.5} />

      {/* Primary Orb Group */}
      <group ref={orbGroupRef}>
        {/* Soft Point Light at center */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0, 0]}
          color="#38bdf8"
          intensity={2.5}
          distance={14}
        />

        {/* Emissive Core */}
        <group ref={coreGroupRef}>
          <mesh ref={coreMeshRef} geometry={coreGeo}>
            <meshStandardMaterial
              ref={coreMatRef}
              color="#ffffff"
              emissive="#38bdf8"
              emissiveIntensity={2.5}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>

          {/* Core Wireframe Energy Cage */}
          <mesh ref={coreCageRef} geometry={coreCageGeo}>
            <meshBasicMaterial
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>

        {/* Vertical Light Beam (Phase 0.3 - 0.55) */}
        <mesh ref={beamRef} geometry={beamGeo} position={[0, 0, 0]}>
          <meshBasicMaterial
            ref={beamMatRef}
            color="#38bdf8"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Thin Glowing Seam at Equator */}
        <mesh
          ref={seamRef}
          geometry={seamGeo}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            ref={seamMatRef}
            color="#38bdf8"
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Top Hemisphere */}
        <group ref={topHemiGroupRef}>
          <mesh geometry={topHemiGeo}>
            <meshPhysicalMaterial
              ref={topHemiMatRef}
              color="#ffffff"
              transmission={0.92}
              roughness={0.08}
              metalness={0.1}
              thickness={1.1}
              ior={1.48}
              transparent
              opacity={0.78}
              reflectivity={0.85}
              clearcoat={1.0}
            />
          </mesh>

          {/* Wireframe Fresnel Accent */}
          <mesh geometry={topHemiGeo}>
            <meshBasicMaterial
              ref={topWireMatRef}
              wireframe
              color="#38bdf8"
              transparent
              opacity={0.22}
            />
          </mesh>

          {/* Rim Seam Disk */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.52, 1.56, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>

        {/* Bottom Hemisphere */}
        <group ref={bottomHemiGroupRef}>
          <mesh geometry={bottomHemiGeo}>
            <meshPhysicalMaterial
              ref={bottomHemiMatRef}
              color="#ffffff"
              transmission={0.92}
              roughness={0.08}
              metalness={0.1}
              thickness={1.1}
              ior={1.48}
              transparent
              opacity={0.78}
              reflectivity={0.85}
              clearcoat={1.0}
            />
          </mesh>

          {/* Wireframe Fresnel Accent */}
          <mesh geometry={bottomHemiGeo}>
            <meshBasicMaterial
              ref={bottomWireMatRef}
              wireframe
              color="#38bdf8"
              transparent
              opacity={0.22}
            />
          </mesh>

          {/* Rim Seam Disk */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.52, 1.56, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      </group>

      {/* Orbit Rings (one ring per category) */}
      {categoryMap.map((category) => {
        const isCatSelected = selectedCategoryId === category.id;
        const isAnyCatSelected = selectedCategoryId !== null;
        const isDimmedCat = isAnyCatSelected && !isCatSelected;

        return (
          <group
            key={category.id}
            rotation={category.ringConfig.tilt}
          >
            {/* Rotating group for ring + skills */}
            <group
              ref={(el) => {
                ringRotateRefs.current[category.id] = el;
              }}
            >
              {/* Torus Orbit Track */}
              <mesh
                geometry={category.geo}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <meshBasicMaterial
                  ref={(el) => {
                    ringTrackMatRefs.current[category.id] = el;
                  }}
                  color={category.accent}
                  transparent
                  opacity={0}
                />
              </mesh>

              {/* Skills distributed on this orbit ring */}
              {category.skills.map((skill, sIdx) => {
                const isHovered = hoveredSkill?.skill.id === skill.id;
                const isDimmed =
                  (hoveredSkill !== null && !isHovered) ||
                  isDimmedCat;

                return (
                  <SkillPill
                    key={skill.id}
                    skill={skill}
                    category={category}
                    index={sIdx}
                    totalOnRing={category.skills.length}
                    radius={category.ringConfig.radius}
                    progressRef={progressRef}
                    smoothProgressRef={smoothProgress}
                    isHovered={isHovered}
                    isDimmed={isDimmed}
                    onHover={onHoverSkill}
                    onUnhover={onUnhoverSkill}
                  />
                );
              })}
            </group>
          </group>
        );
      })}

      {/* Subtle Postprocessing Bloom */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.42}
          luminanceThreshold={0.52}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>

      {/* OrbitControls: Enabled when phase >= 0.88 for free drag inspection */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={progressRef.current >= 0.88}
        rotateSpeed={0.65}
        dampingFactor={0.08}
        onStart={() => {
          isDraggingOrbit.current = true;
        }}
        onEnd={() => {
          isDraggingOrbit.current = false;
        }}
      />
    </>
  );
}

export interface SkillsOrbSceneProps {
  progressRef: React.MutableRefObject<number>;
  selectedCategoryId: string | null;
  hoveredSkill: { skill: SkillItem; category: SkillCategory } | null;
  onHoverSkill: (skill: SkillItem, category: SkillCategory) => void;
  onUnhoverSkill: () => void;
  onMounted?: () => void;
  isInView?: boolean;
}

export default function SkillsOrbScene({
  progressRef,
  selectedCategoryId,
  hoveredSkill,
  onHoverSkill,
  onUnhoverSkill,
  onMounted,
  isInView = true,
}: SkillsOrbSceneProps) {
  useEffect(() => {
    // Notify parent component that canvas is mounted to trigger ScrollTrigger.refresh()
    if (onMounted) {
      const timer = setTimeout(() => {
        onMounted();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [onMounted]);

  return (
    <div
      className="w-full h-full relative"
      data-cursor="explore"
    >
      <Canvas
        camera={{ position: [0, 0, 8.4], fov: 44 }}
        dpr={[1, 1.5]}
        frameloop={isInView ? "always" : "demand"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full bg-transparent"
      >
        <SceneContent
          progressRef={progressRef}
          selectedCategoryId={selectedCategoryId}
          hoveredSkill={hoveredSkill}
          onHoverSkill={onHoverSkill}
          onUnhoverSkill={onUnhoverSkill}
        />
      </Canvas>
    </div>
  );
}
