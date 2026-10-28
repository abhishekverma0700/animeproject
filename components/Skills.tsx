"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS_DATA, SkillCategory, SkillItem } from "@/data/skills";

// Dynamic import with SSR false for 3D Canvas
const SkillsOrbScene = dynamic(() => import("./SkillsOrbScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/80">
          INITIALIZING 3D ORB...
        </span>
      </div>
    </div>
  ),
});

// Helper to test WebGL support safely
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger drives progressRef (0 -> 1)
  const progressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // State for interactivity
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{
    skill: SkillItem;
    category: SkillCategory;
  } | null>(null);

  // Fallback trigger: < 768px, no WebGL, or prefers-reduced-motion
  const [isFallback, setIsFallback] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // Mobile tapped skill state (for fallback view)
  const [mobileTappedSkillId, setMobileTappedSkillId] = useState<string | null>(null);

  // Canvas mounted callback to refresh ScrollTrigger
  const handleCanvasMounted = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  const handleHoverSkill = useCallback((skill: SkillItem, category: SkillCategory) => {
    setHoveredSkill({ skill, category });
  }, []);

  const handleUnhoverSkill = useCallback(() => {
    setHoveredSkill(null);
  }, []);

  // 1. Detect screen size, reduced motion, and WebGL support
  useEffect(() => {
    setIsMounted(true);

    const checkEligibility = () => {
      const isMobile = window.innerWidth < 768;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const webGLAvailable = checkWebGLSupport();

      setIsFallback(isMobile || reducedMotion || !webGLAvailable);
    };

    checkEligibility();
    window.addEventListener("resize", checkEligibility);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", checkEligibility);

    return () => {
      window.removeEventListener("resize", checkEligibility);
      mql.removeEventListener("change", checkEligibility);
    };
  }, []);

  // 2. Set up ScrollTrigger pinning and marquee animation
  useEffect(() => {
    if (!isMounted) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Pinning only active when NOT in fallback mode (desktop, WebGL enabled)
      if (!isFallback && sectionRef.current && pinContainerRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=300%",
          onUpdate: (self) => {
            progressRef.current = self.progress;
            setScrollProgress(self.progress);
          },
          onToggle: (self) => {
            setIsInView(self.isActive);
          },
        });
      }

      // Marquee continuous infinite translation with scroll velocity reaction
      if (marqueeTrackRef.current && !prefersReducedMotion) {
        let xPos = 0;
        const baseSpeed = 0.85;
        let currentVelocityBonus = 0;

        const updateMarquee = () => {
          currentVelocityBonus = gsap.utils.interpolate(
            currentVelocityBonus,
            0,
            0.04
          );

          const totalSpeed = baseSpeed + currentVelocityBonus;
          xPos -= totalSpeed;

          const trackWidth = marqueeTrackRef.current?.scrollWidth || 0;
          const halfWidth = trackWidth / 2;

          if (halfWidth > 0 && Math.abs(xPos) >= halfWidth) {
            xPos = 0;
          }

          if (marqueeTrackRef.current) {
            marqueeTrackRef.current.style.transform = `translate3d(${xPos}px, 0, 0)`;
          }
        };

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const vel = Math.abs(self.getVelocity());
            currentVelocityBonus = Math.min(vel * 0.004, 8);
          },
        });

        gsap.ticker.add(updateMarquee);

        return () => {
          gsap.ticker.remove(updateMarquee);
        };
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [isMounted, isFallback]);

  // Phase computation for header status label
  const currentPhaseLabel =
    scrollProgress < 0.3
      ? "PHASE 01 // DORMANT ORB"
      : scrollProgress < 0.55
      ? "PHASE 02 // CORE IGNITION"
      : scrollProgress < 0.9
      ? "PHASE 03 // ORBITAL EXPANSION"
      : "PHASE 04 // 3D INTERACTIVE ARSENAL";

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full bg-[#0a0a0a] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[950px] h-[600px] bg-sky-500/[0.018] blur-[180px] rounded-full -z-10"
        aria-hidden="true"
      />

      {/* =========================================================================
          DESKTOP 3D MODE (PINNED VIEWPORT)
          ========================================================================= */}
      {!isFallback && (
        <div
          ref={pinContainerRef}
          className="relative w-full h-screen flex flex-col justify-between overflow-hidden"
        >
          {/* Top Section Header */}
          <div className="relative z-20 pt-8 sm:pt-10 px-6 md:px-12 lg:px-20 max-w-[1720px] mx-auto w-full pointer-events-none">
            {/* Header Mono Label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4 sm:mb-6 pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/90">
                  {SKILLS_DATA.sectionLabel}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                  {SKILLS_DATA.sectionNumber}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-sky-400/90 font-semibold">
                  {currentPhaseLabel}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400 hidden lg:inline-block">
                  PRODUCTION-TESTED ARCHITECTURES & TOOLCHAINS
                </span>
              </div>
            </div>

            {/* Headline and Progress Bar Row */}
            <div className="flex items-end justify-between gap-8 pointer-events-auto">
              <div>
                <h2 className="font-anton uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial">
                  {SKILLS_DATA.headingLine1} {SKILLS_DATA.headingLine2}
                </h2>
              </div>

              {/* Progress Bar Track */}
              <div className="hidden md:flex flex-col items-end gap-1.5 pb-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  <span>ORB EXPANSION</span>
                  <span className="text-sky-400 font-bold">
                    {Math.round(scrollProgress * 100)}%
                  </span>
                </div>
                <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-purple-400 transition-all duration-75"
                    style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center 3D Skill Orb Canvas */}
          <div
            className="absolute inset-0 z-10 w-full h-full"
            data-cursor="explore"
          >
            <SkillsOrbScene
              progressRef={progressRef}
              selectedCategoryId={selectedCategoryId}
              hoveredSkill={hoveredSkill}
              onHoverSkill={handleHoverSkill}
              onUnhoverSkill={handleUnhoverSkill}
              onMounted={handleCanvasMounted}
              isInView={isInView}
            />
          </div>

          {/* Left Category Legend Overlay */}
          <div className="absolute left-6 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
            <div className="glass !rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 max-w-[220px] shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                <span>ORBIT RINGS</span>
                {selectedCategoryId && (
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="text-sky-400 hover:text-white transition-colors"
                  >
                    RESET
                  </button>
                )}
              </div>

              {SKILLS_DATA.categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId((prev) =>
                        prev === cat.id ? null : cat.id
                      );
                    }}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-white/15 shadow-md"
                        : "hover:bg-white/5 opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      borderLeft: isSelected
                        ? `3px solid ${cat.accent}`
                        : "3px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: cat.accent,
                          boxShadow: isSelected
                            ? `0 0 10px ${cat.accent}`
                            : undefined,
                        }}
                      />
                      <span className="font-mono text-xs uppercase tracking-wider font-semibold text-white">
                        {cat.title}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-neutral-400">
                      {cat.skills.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Floating Hover Inspection Tooltip */}
          <div className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:block">
            {hoveredSkill ? (
              <div className="glass !rounded-2xl p-6 max-w-sm shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5 mb-3 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: hoveredSkill.category.accent,
                      boxShadow: `0 0 10px ${hoveredSkill.category.accent}`,
                    }}
                  />
                  <span
                    className="font-bold"
                    style={{ color: hoveredSkill.category.accent }}
                  >
                    {hoveredSkill.category.title}
                  </span>
                  <span className="text-white/30">{"//"}</span>
                  <span className="text-neutral-400">INSPECTION</span>
                </div>

                <h3 className="font-anton uppercase text-3xl tracking-tight text-white mb-2">
                  {hoveredSkill.skill.name}
                </h3>

                <p className="font-mono text-xs text-neutral-300 leading-relaxed">
                  {hoveredSkill.skill.note}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  <span>STATUS</span>
                  <span className="text-emerald-400 font-semibold">
                    ACTIVE IN PRODUCTION
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass !rounded-2xl p-5 max-w-xs opacity-60 transition-opacity">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  INTERACTIVE 3D
                </div>
                <p className="font-mono text-xs text-neutral-300">
                  {scrollProgress < 0.5
                    ? "Scroll to trigger core ignition and orbital expansion."
                    : scrollProgress < 0.9
                    ? "Hover any orbiting skill label to inspect toolchain details."
                    : "Hemispheres collapsed into nucleus. Click & drag to rotate 3D system."}
                </p>
              </div>
            )}
          </div>

          {/* Drag to Rotate Badge Prompt (Phase >= 0.88) */}
          {scrollProgress >= 0.88 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-300">
              <div className="glass px-5 py-2.5 !rounded-full flex items-center gap-3 border border-sky-400/40 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-white font-semibold">
                  DRAG MOUSE TO ROTATE 3D ARSENAL
                </span>
              </div>
            </div>
          )}

          {/* Bottom Marquee Strip */}
          <div className="relative z-20 w-full border-t border-white/10 py-5 sm:py-6 overflow-hidden bg-black/50 backdrop-blur-md select-none">
            <div
              ref={marqueeTrackRef}
              className="flex items-center gap-10 whitespace-nowrap will-change-transform"
            >
              <div className="flex items-center gap-10 shrink-0">
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`m1-${idx}`}
                    className="font-anton uppercase text-3xl sm:text-4xl md:text-5xl tracking-tight text-transparent select-none text-stroke-marquee hover:text-white transition-all duration-300 cursor-default"
                  >
                    {name}
                    <span className="ml-10 text-white/20 select-none font-mono text-xl">
                      /
                    </span>
                  </span>
                ))}
              </div>

              <div
                className="flex items-center gap-10 shrink-0"
                aria-hidden="true"
              >
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`m2-${idx}`}
                    className="font-anton uppercase text-3xl sm:text-4xl md:text-5xl tracking-tight text-transparent select-none text-stroke-marquee hover:text-white transition-all duration-300 cursor-default"
                  >
                    {name}
                    <span className="ml-10 text-white/20 select-none font-mono text-xl">
                      /
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FALLBACK VIEW: (width < 768, WebGL unavailable, or prefers-reduced-motion)
          Simple glass chips grouped by category, without pinning or 3D canvas
          ========================================================================= */}
      {isFallback && (
        <div className="py-20 px-6 sm:px-10">
          <div className="max-w-[1720px] mx-auto w-full mb-16">
            {/* Header Mono Label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-10">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/90">
                  {SKILLS_DATA.sectionLabel}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                  {SKILLS_DATA.sectionNumber}
                </span>
              </div>

              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                PRODUCTION-TESTED ARCHITECTURES & TOOLCHAINS
              </div>
            </div>

            {/* Giant Outlined Heading */}
            <div className="mb-14">
              <h2 className="font-anton uppercase text-5xl sm:text-6xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial mb-1">
                {SKILLS_DATA.headingLine1}
              </h2>
              <h2 className="font-anton uppercase text-5xl sm:text-6xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial">
                {SKILLS_DATA.headingLine2}
              </h2>
            </div>

            {/* Simple Glass Chips Grouped by Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {SKILLS_DATA.categories.map((category) => (
                <div
                  key={category.id}
                  className="glass !rounded-2xl p-6 sm:p-8 flex flex-col justify-start relative overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-neutral-400 mb-4">
                    <span
                      className="font-semibold"
                      style={{ color: category.accent }}
                    >
                      {category.number} {"//"}
                    </span>
                    <span className="text-white font-bold">
                      {category.title}
                    </span>
                  </div>

                  <div
                    className="w-full h-[1px] mb-6"
                    style={{ backgroundColor: `${category.accent}44` }}
                  />

                  {/* Skills Glass Chips */}
                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill) => {
                      const isTapped = mobileTappedSkillId === skill.id;

                      return (
                        <div key={skill.id} className="flex flex-col">
                          <button
                            onClick={() => {
                              setMobileTappedSkillId((prev) =>
                                prev === skill.id ? null : skill.id
                              );
                            }}
                            className={`glass px-4 py-2 !rounded-full flex items-center gap-2.5 transition-all text-left ${
                              isTapped
                                ? "border-sky-400 bg-white/10"
                                : "hover:border-white/30"
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: category.accent }}
                            />
                            <span className="font-anton uppercase text-lg tracking-wide text-white">
                              {skill.name}
                            </span>
                          </button>

                          {/* Expanded Note for Tapped Chip */}
                          {isTapped && (
                            <div className="mt-2 pl-3 py-1 font-mono text-[11px] text-neutral-300 border-l-2 border-sky-400 animate-in fade-in duration-200">
                              {skill.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Strip in Fallback */}
          <div className="w-full border-t border-b border-white/10 py-6 overflow-hidden bg-black/40 backdrop-blur-sm select-none">
            <div
              ref={marqueeTrackRef}
              className="flex items-center gap-10 whitespace-nowrap will-change-transform"
            >
              <div className="flex items-center gap-10 shrink-0">
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`fm1-${idx}`}
                    className="font-anton uppercase text-3xl sm:text-4xl tracking-tight text-transparent select-none text-stroke-marquee"
                  >
                    {name}
                    <span className="ml-10 text-white/20 select-none font-mono text-xl">
                      /
                    </span>
                  </span>
                ))}
              </div>
              <div
                className="flex items-center gap-10 shrink-0"
                aria-hidden="true"
              >
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`fm2-${idx}`}
                    className="font-anton uppercase text-3xl sm:text-4xl tracking-tight text-transparent select-none text-stroke-marquee"
                  >
                    {name}
                    <span className="ml-10 text-white/20 select-none font-mono text-xl">
                      /
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
