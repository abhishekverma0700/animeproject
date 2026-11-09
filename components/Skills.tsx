"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS_DATA, SkillCategory, SkillItem } from "@/data/skills";
import { usePerformance } from "./PerformanceContext";
import { debouncedScrollTriggerRefresh } from "./SmoothScroll";

// Dynamic import with SSR false for 3D Canvas
const SkillsOrbScene = dynamic(() => import("./SkillsOrbScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111]">
          INITIALIZING 3D ORB...
        </span>
      </div>
    </div>
  ),
});

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
  const { isLiteMode, requestActiveCanvas, releaseActiveCanvas } = usePerformance();
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  // Direct DOM refs to avoid setState in scroll onUpdate
  const percentTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);
  const tipTextRef = useRef<HTMLParagraphElement>(null);
  const dragPromptRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);

  // State for category filter and hover
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{
    skill: SkillItem;
    category: SkillCategory;
  } | null>(null);

  const [isFallback, setIsFallback] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Mobile tapped skill state
  const [mobileTappedSkillId, setMobileTappedSkillId] = useState<string | null>(null);

  const handleCanvasMounted = useCallback(() => {
    debouncedScrollTriggerRefresh();
  }, []);

  const handleHoverSkill = useCallback((skill: SkillItem, category: SkillCategory) => {
    setHoveredSkill({ skill, category });
  }, []);

  const handleUnhoverSkill = useCallback(() => {
    setHoveredSkill(null);
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const checkEligibility = () => {
      const isMobile = window.innerWidth < 768;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const webGLAvailable = checkWebGLSupport();

      setIsFallback(isMobile || reducedMotion || !webGLAvailable || isLiteMode);
    };

    checkEligibility();
    window.addEventListener("resize", checkEligibility);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", checkEligibility);

    return () => {
      window.removeEventListener("resize", checkEligibility);
      mql.removeEventListener("change", checkEligibility);
    };
  }, [isLiteMode]);

  useEffect(() => {
    if (!isMounted) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (!isFallback && sectionRef.current && pinContainerRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=300%",
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current = p;

            // Update DOM directly without React re-renders on scroll
            const pct = Math.round(p * 100);
            if (percentTextRef.current) {
              percentTextRef.current.textContent = `${pct}%`;
            }
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${pct}%`;
            }
            if (phaseLabelRef.current) {
              phaseLabelRef.current.textContent =
                p < 0.3
                  ? "PHASE 01 // DORMANT ORB"
                  : p < 0.55
                  ? "PHASE 02 // CORE IGNITION"
                  : p < 0.9
                  ? "PHASE 03 // ORBITAL EXPANSION"
                  : "PHASE 04 // 3D INTERACTIVE ARSENAL";
            }
            if (tipTextRef.current) {
              tipTextRef.current.textContent =
                p < 0.5
                  ? "Scroll to trigger core ignition and orbital expansion."
                  : p < 0.9
                  ? "Hover any orbiting skill label to inspect toolchain details."
                  : "Hemispheres collapsed into nucleus. Click & drag to rotate 3D system.";
            }
            if (dragPromptRef.current) {
              dragPromptRef.current.style.opacity = p >= 0.88 ? "1" : "0";
              dragPromptRef.current.style.pointerEvents = p >= 0.88 ? "auto" : "none";
            }
          },
          onToggle: (self) => {
            const active = self.isActive;
            setIsInView(active);
            if (active) {
              requestActiveCanvas("skills");
            } else {
              releaseActiveCanvas("skills");
            }
          },
        });
      }

      // Marquee continuous infinite translation
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
            currentVelocityBonus = Math.min(vel * 0.003, 6);
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
      releaseActiveCanvas("skills");
    };
  }, [isMounted, isFallback, requestActiveCanvas, releaseActiveCanvas]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full bg-[#F5F3EE] text-[#111111] overflow-hidden"
    >
      {!isFallback ? (
        <div
          ref={pinContainerRef}
          className="relative w-full h-screen min-h-[640px] max-h-[1440px] flex flex-col justify-between overflow-hidden"
        >
          {/* Header Bar */}
          <div className="relative z-20 w-full max-w-[1920px] mx-auto pt-24 px-6 md:px-12 lg:px-16 pointer-events-none">
            <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.10)] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse" />
                <span
                  ref={phaseLabelRef}
                  className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold"
                >
                  PHASE 01 // DORMANT ORB
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">
                <span>{"CAPABILITIES //"}</span>
                <span className="text-[#111111] font-semibold">
                  PRODUCTION-TESTED ARCHITECTURES & TOOLCHAINS
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-8 pointer-events-auto">
              <div>
                <h2 className="font-anton uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial">
                  {SKILLS_DATA.headingLine1} {SKILLS_DATA.headingLine2}
                </h2>
              </div>

              <div className="hidden md:flex flex-col items-end gap-1.5 pb-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#6B6B6B]">
                  <span>ORB EXPANSION</span>
                  <span ref={percentTextRef} className="text-[#C43A00] font-bold">
                    0%
                  </span>
                </div>
                <div className="w-48 h-[2px] bg-[rgba(17,17,17,0.12)] rounded-full overflow-hidden">
                  <div
                    ref={progressBarRef}
                    className="h-full bg-[#FF4D00] transition-all duration-75"
                    style={{ width: "0%" }}
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
            {isInView && (
              <SkillsOrbScene
                progressRef={progressRef}
                selectedCategoryId={selectedCategoryId}
                hoveredSkill={hoveredSkill}
                onHoverSkill={handleHoverSkill}
                onUnhoverSkill={handleUnhoverSkill}
                onMounted={handleCanvasMounted}
                isInView={isInView}
              />
            )}
          </div>

          {/* Floating Category Filter Chips (Top Left below heading) */}
          <div className="absolute top-44 sm:top-48 left-6 md:left-12 lg:left-16 z-20 pointer-events-auto flex flex-wrap gap-2 max-w-sm">
            {SKILLS_DATA.categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategoryId(isSelected ? null : cat.id)
                  }
                  className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 border flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#111111] text-white border-[#111111] shadow-md"
                      : "bg-white hover:bg-neutral-50 text-[#6B6B6B] hover:text-[#111111] border-[rgba(17,17,17,0.12)]"
                  }`}
                  data-cursor="hover"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]"
                  />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Left: Live Detail Card */}
          <div className="relative z-20 px-6 md:px-12 lg:px-16 pb-8 pointer-events-none">
            {hoveredSkill ? (
              <div className="glass !rounded-2xl p-5 max-w-sm border border-[rgba(17,17,17,0.12)] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-widest text-[#C43A00]">
                  <span
                    className="w-2 h-2 rounded-full bg-[#FF4D00]"
                  />
                  <span>{hoveredSkill.category.title}</span>
                  <span className="text-[rgba(17,17,17,0.25)]">{"//"}</span>
                  <span className="text-[#6B6B6B]">INSPECTION</span>
                </div>
                <h4 className="font-anton text-2xl text-[#111111] tracking-wide uppercase">
                  {hoveredSkill.skill.name}
                </h4>
                <p className="mt-1 font-mono text-xs text-[#6B6B6B]">
                  {hoveredSkill.skill.note}
                </p>
                <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]" />
                  <span className="text-[#111111] font-semibold">
                    ACTIVE IN PRODUCTION
                  </span>
                </div>
              </div>
            ) : (
              <div className="glass !rounded-2xl p-5 max-w-xs border border-[rgba(17,17,17,0.10)]">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-1">
                  INTERACTIVE 3D
                </div>
                <p ref={tipTextRef} className="font-mono text-xs text-[#111111]">
                  Scroll to trigger core ignition and orbital expansion.
                </p>
              </div>
            )}
          </div>

          {/* Drag to Rotate Badge Prompt (Phase >= 0.88) */}
          <div
            ref={dragPromptRef}
            style={{ opacity: 0, pointerEvents: "none" }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300"
          >
            <div className="glass px-5 py-2.5 !rounded-full flex items-center gap-3 border border-[rgba(17,17,17,0.12)] shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-ping" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#111111] font-semibold">
                DRAG MOUSE TO ROTATE 3D ARSENAL
              </span>
            </div>
          </div>

          {/* Bottom Marquee Strip - Solid non-backdrop background for high scrolling FPS */}
          <div className="relative z-20 w-full border-t border-[rgba(17,17,17,0.10)] py-5 sm:py-6 overflow-hidden bg-[#F5F3EE]/95 select-none">
            <div
              ref={marqueeTrackRef}
              className="flex items-center gap-10 whitespace-nowrap"
            >
              <div className="flex items-center gap-10 shrink-0">
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`m1-${idx}`}
                    className="font-anton text-3xl sm:text-4xl uppercase tracking-wider text-stroke-marquee select-none cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-10 shrink-0" aria-hidden="true">
                {SKILLS_DATA.marqueeSkills.map((name, idx) => (
                  <span
                    key={`m2-${idx}`}
                    className="font-anton text-3xl sm:text-4xl uppercase tracking-wider text-stroke-marquee select-none cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Fallback Clean Grid View */
        <div className="py-20 px-6 sm:px-10 max-w-7xl mx-auto">
          <div className="border-b border-[rgba(17,17,17,0.10)] pb-6 mb-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
                TECHNICAL ARSENAL
              </span>
            </div>
            <h2 className="font-anton uppercase text-4xl sm:text-6xl text-[#111111] tracking-tight">
              {SKILLS_DATA.headingLine1} {SKILLS_DATA.headingLine2}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SKILLS_DATA.categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-[rgba(17,17,17,0.10)] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="w-3 h-3 rounded-full bg-[#FF4D00]"
                    />
                    <h3 className="font-anton text-2xl uppercase tracking-wide text-[#111111]">
                      {category.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill) => {
                      const isTapped = mobileTappedSkillId === skill.id;
                      return (
                        <button
                          key={skill.id}
                          onClick={() =>
                            setMobileTappedSkillId(isTapped ? null : skill.id)
                          }
                          className="px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all duration-200 flex items-center gap-2 bg-white/70 border-[rgba(17,17,17,0.12)] text-[#111111] hover:border-[#FF4D00]"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]"
                          />
                          <span>{skill.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {mobileTappedSkillId &&
                  category.skills.some((s) => s.id === mobileTappedSkillId) && (
                    <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.10)] font-mono text-xs text-[#C43A00]">
                      <span>{"ACTIVE PRODUCTION // "}</span>
                      <span className="text-[#111111]">
                        {
                          category.skills.find(
                            (s) => s.id === mobileTappedSkillId
                          )?.name
                        }
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
