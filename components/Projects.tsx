"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, Project } from "@/data/projects";
import { useSmoothScroll } from "./SmoothScroll";
import CaseStudyModal from "./CaseStudyModal";
import {
  InjuryConnectVisual,
  SynapseVisual,
  KronosVisual,
  VoxMetricVisual,
} from "./project-visuals";

// Visual component dispatcher based on project.visual key
function ProjectVisualItem({
  project,
  onOpenModal,
}: {
  project: Project;
  onOpenModal: (p: Project) => void;
}) {
  switch (project.visual) {
    case "injuryconnect":
      return <InjuryConnectVisual project={project} onOpenModal={onOpenModal} />;
    case "synapse":
      return <SynapseVisual project={project} onOpenModal={onOpenModal} />;
    case "kronos":
      return <KronosVisual project={project} onOpenModal={onOpenModal} />;
    case "voxmetric":
      return <VoxMetricVisual project={project} onOpenModal={onOpenModal} />;
    default:
      return <InjuryConnectVisual project={project} onOpenModal={onOpenModal} />;
  }
}

// Magnetic "OPEN CASE STUDY" button with rotating arrow
function MagneticCaseStudyButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    gsap.to(btn, { x, y, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group inline-flex items-center gap-3 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
      data-cursor="hover"
    >
      <span className="border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
        OPEN CASE STUDY
      </span>
      <span className="inline-block transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1">
        ↗
      </span>
    </button>
  );
}

export default function Projects() {
  const { lenis } = useSmoothScroll();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Desktop slide container references
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sweepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Split-letter title references: [projectIndex][charIndex]
  const letterRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  // Tech pills references: [projectIndex][tagIndex]
  const pillsRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  // Masked counter number references
  const counterNumberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Background accent glow layer references
  const bgGlowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Giant background outlined number references
  const giantNumberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const giantNumberWrapperRef = useRef<HTMLDivElement>(null);

  // Bottom progress bar
  const bottomProgressBarRef = useRef<HTMLDivElement>(null);

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);

  const activeProject = PROJECTS[activeProjectIndex] || PROJECTS[0];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    // Toggle right-side nav visibility when #work is active
    const navVisibilityTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => setIsNavVisible(self.isActive),
    });

    // Slow mouse parallax on giant background number
    const handleMouseMove = (e: MouseEvent) => {
      if (!giantNumberWrapperRef.current) return;
      const xNorm = e.clientX / window.innerWidth - 0.5;
      const yNorm = e.clientY / window.innerHeight - 0.5;
      gsap.to(giantNumberWrapperRef.current, {
        x: xNorm * -35,
        y: yNorm * -35,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const mm = gsap.matchMedia();

    // Desktop: Pinned "one project at a time" scrubbed swap timeline
    mm.add("(min-width: 1024px)", () => {
      // Set initial states: project 0 is visible, projects 1..3 hidden
      gsap.set(slideRefs.current[0], { pointerEvents: "auto", zIndex: 10 });
      gsap.set(detailsRefs.current[0], { y: 0, opacity: 1 });
      gsap.set(visualRefs.current[0], {
        scale: 1,
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        pointerEvents: "auto",
      });

      // Split-letters for slide 0: visible
      if (letterRefs.current[0]) {
        gsap.set(letterRefs.current[0], { yPercent: 0, opacity: 1 });
      }

      // Tech pills for slide 0: visible
      if (pillsRefs.current[0]) {
        gsap.set(pillsRefs.current[0], { y: 0, opacity: 1 });
      }

      // Initialize masked counter: 01 active, rest hidden
      if (counterNumberRefs.current[0]) {
        gsap.set(counterNumberRefs.current[0], { autoAlpha: 1, yPercent: 0 });
      }

      // Initialize background glows
      if (bgGlowRefs.current[0]) {
        gsap.set(bgGlowRefs.current[0], { opacity: 0.22 });
      }

      // Initialize giant outlined number: 01 active
      if (giantNumberRefs.current[0]) {
        gsap.set(giantNumberRefs.current[0], { autoAlpha: 1, yPercent: 0 });
      }

      for (let k = 1; k < PROJECTS.length; k++) {
        gsap.set(slideRefs.current[k], { pointerEvents: "none", zIndex: 5 });
        gsap.set(detailsRefs.current[k], { y: 40, opacity: 0 });
        gsap.set(visualRefs.current[k], {
          scale: 1.15,
          opacity: 0,
          clipPath: "inset(100% 0% 0% 0%)",
          pointerEvents: "none",
        });

        if (letterRefs.current[k]) {
          gsap.set(letterRefs.current[k], { yPercent: 115, opacity: 0 });
        }
        if (pillsRefs.current[k]) {
          gsap.set(pillsRefs.current[k], { y: 30, opacity: 0 });
        }
        if (counterNumberRefs.current[k]) {
          gsap.set(counterNumberRefs.current[k], { autoAlpha: 0, yPercent: 100 });
        }
        if (bgGlowRefs.current[k]) {
          gsap.set(bgGlowRefs.current[k], { opacity: 0 });
        }
        if (giantNumberRefs.current[k]) {
          gsap.set(giantNumberRefs.current[k], { autoAlpha: 0, yPercent: 60 });
        }
      }

      // Master scrubbed timeline: pin section, end +=100% per project
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${(PROJECTS.length - 1) * 100}%`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Update bottom full-width progress line
            if (bottomProgressBarRef.current) {
              gsap.set(bottomProgressBarRef.current, { scaleX: p });
            }

            const idx = Math.min(
              PROJECTS.length - 1,
              Math.floor(p * PROJECTS.length + 0.15)
            );
            setActiveProjectIndex(idx);

            // Enforce strictly one counter visible; kill stale tweens
            PROJECTS.forEach((_, k) => {
              const el = counterNumberRefs.current[k];
              if (!el) return;
              if (k === idx) {
                gsap.to(el, {
                  autoAlpha: 1,
                  yPercent: 0,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: true,
                });
              } else if (k < idx) {
                gsap.to(el, {
                  autoAlpha: 0,
                  yPercent: -100,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: true,
                });
              } else {
                gsap.to(el, {
                  autoAlpha: 0,
                  yPercent: 100,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: true,
                });
              }
            });

            // Sync giant background number
            PROJECTS.forEach((_, k) => {
              const gEl = giantNumberRefs.current[k];
              if (!gEl) return;
              if (k === idx) {
                gsap.to(gEl, { autoAlpha: 1, yPercent: 0, duration: 0.4, overwrite: true });
              } else if (k < idx) {
                gsap.to(gEl, { autoAlpha: 0, yPercent: -50, duration: 0.4, overwrite: true });
              } else {
                gsap.to(gEl, { autoAlpha: 0, yPercent: 50, duration: 0.4, overwrite: true });
              }
            });
          },
        },
      });

      scrollTriggerRef.current = tl.scrollTrigger || null;

      // Initial dwell time on slide 0
      tl.to({}, { duration: 0.5 });

      // Build sequential swaps: slide i -> slide i + 1
      for (let i = 0; i < PROJECTS.length - 1; i++) {
        const nextIdx = i + 1;
        const stepLabel = `swap-${i}-to-${nextIdx}`;

        tl.addLabel(stepLabel);

        // 1. Cross-fade background radial glow
        if (bgGlowRefs.current[i]) {
          tl.to(bgGlowRefs.current[i], { opacity: 0, duration: 0.7, ease: "power2.inOut" }, stepLabel);
        }
        if (bgGlowRefs.current[nextIdx]) {
          tl.to(bgGlowRefs.current[nextIdx], { opacity: 0.22, duration: 0.7, ease: "power2.inOut" }, stepLabel);
        }

        // 2. Counter swap: outgoing fully hidden (autoAlpha 0 + yPercent -100)
        if (counterNumberRefs.current[i]) {
          tl.to(
            counterNumberRefs.current[i],
            {
              autoAlpha: 0,
              yPercent: -100,
              duration: 0.5,
              ease: "power2.inOut",
              overwrite: true,
            },
            stepLabel
          );
        }

        // Counter swap: incoming slides up (autoAlpha 1 + yPercent 0)
        if (counterNumberRefs.current[nextIdx]) {
          tl.fromTo(
            counterNumberRefs.current[nextIdx],
            { autoAlpha: 0, yPercent: 100 },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.5,
              ease: "power2.inOut",
              overwrite: true,
            },
            `${stepLabel}+=0.1`
          );
        }

        // 3. Outgoing Title: split-letters exit up
        if (letterRefs.current[i]) {
          tl.to(
            letterRefs.current[i],
            {
              yPercent: -115,
              opacity: 0,
              stagger: 0.015,
              duration: 0.45,
              ease: "power2.in",
            },
            stepLabel
          );
        }

        // Outgoing details & pills
        tl.to(
          detailsRefs.current[i],
          {
            y: -35,
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
          },
          stepLabel
        );

        // Outgoing visual scales down & fades
        tl.to(
          visualRefs.current[i],
          {
            scale: 0.9,
            opacity: 0,
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.65,
            ease: "power2.inOut",
          },
          stepLabel
        );

        // Toggle interactive layers
        tl.set(slideRefs.current[i], { pointerEvents: "none", zIndex: 1 }, `${stepLabel}+=0.6`);
        tl.set(slideRefs.current[nextIdx], { pointerEvents: "auto", zIndex: 10 }, stepLabel);

        // 4. Accent Color Clip-Path Sweep Bar across incoming visual
        if (sweepRefs.current[nextIdx]) {
          tl.fromTo(
            sweepRefs.current[nextIdx],
            { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 0.35,
              ease: "power3.inOut",
            },
            stepLabel
          );

          // Reveal incoming visual under the sweep
          tl.set(
            visualRefs.current[nextIdx],
            {
              scale: 1.0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              pointerEvents: "auto",
            },
            `${stepLabel}+=0.35`
          );

          // Sweep bar wipes off to the right
          tl.to(
            sweepRefs.current[nextIdx],
            {
              clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
              duration: 0.35,
              ease: "power3.inOut",
            },
            `${stepLabel}+=0.35`
          );
        } else {
          tl.to(
            visualRefs.current[nextIdx],
            {
              scale: 1.0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              pointerEvents: "auto",
              duration: 0.7,
              ease: "power2.inOut",
            },
            stepLabel
          );
        }

        // 5. Incoming Title: split-letter reveal (stagger 0.03)
        if (letterRefs.current[nextIdx]) {
          tl.fromTo(
            letterRefs.current[nextIdx],
            { yPercent: 115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.03,
              ease: "power3.out",
            },
            `${stepLabel}+=0.15`
          );
        }

        // Incoming details
        tl.to(
          detailsRefs.current[nextIdx],
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power2.inOut",
          },
          `${stepLabel}+=0.15`
        );

        // 6. Incoming Tech Pills: slide in one by one (stagger 0.06)
        if (pillsRefs.current[nextIdx]) {
          tl.fromTo(
            pillsRefs.current[nextIdx],
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.06,
              ease: "power2.out",
            },
            `${stepLabel}+=0.25`
          );
        }

        // Hold duration so project is clearly enjoyed before next swap
        tl.to({}, { duration: 0.75 });
      }

      return () => {
        tl.kill();
      };
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      navVisibilityTrigger.kill();
      mm.revert();
    };
  }, []);

  // Smooth scroll to project via Lenis when clicking indicator dots
  const handleScrollToProject = (idx: number) => {
    if (!lenis) return;
    if (window.innerWidth >= 1024 && scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const targetRatio = idx / (PROJECTS.length - 1);
      const targetScroll = st.start + targetRatio * (st.end - st.start);
      lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      const el = document.getElementById(`mobile-project-${idx}`);
      if (el) {
        lenis.scrollTo(el, { offset: -60, duration: 1.0 });
      }
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="work"
        className="relative w-full min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden select-none"
      >
        {/* =========================================================================
            BACKGROUND LAYERS: Cross-fading Accent Glow + Faint Outlined Parallax Number
            ========================================================================= */}
        {/* Per-project accent radial glows that cross-fade */}
        {PROJECTS.map((proj, idx) => (
          <div
            key={proj.index}
            ref={(el) => {
              bgGlowRefs.current[idx] = el;
            }}
            className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[160px] pointer-events-none -z-10 will-change-transform transition-colors duration-700"
            style={{
              backgroundColor: proj.accent,
              opacity: idx === 0 ? 0.22 : 0,
            }}
          />
        ))}

        {/* Faint Huge Outlined Project Number with Slow Mouse/Scroll Parallax */}
        <div
          ref={giantNumberWrapperRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -z-10 overflow-hidden w-full flex items-center justify-center opacity-[0.06] will-change-transform"
        >
          <div className="relative h-[clamp(18rem,34vw,36rem)] w-[clamp(24rem,44vw,48rem)] flex items-center justify-center">
            {PROJECTS.map((proj, idx) => (
              <span
                key={proj.index}
                ref={(el) => {
                  giantNumberRefs.current[idx] = el;
                }}
                className="absolute inset-0 flex items-center justify-center font-anton text-[clamp(18rem,34vw,36rem)] leading-none will-change-transform"
                style={{
                  WebkitTextStroke: "2.5px rgba(255, 255, 255, 0.8)",
                  color: "transparent",
                }}
              >
                {proj.index}
              </span>
            ))}
          </div>
        </div>

        {/* Ambient Grid Watermark Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 opacity-5">
          <div className="w-[1px] h-full bg-white/30" />
          <div className="w-[1px] h-full bg-white/30 hidden md:block" />
          <div className="w-[1px] h-full bg-white/30 hidden lg:block" />
          <div className="w-[1px] h-full bg-white/30" />
        </div>

        {/* =========================================================================
            DESKTOP PINNED VIEW: Vertically centered (h-screen, items-center, pt-24 pb-24)
            ========================================================================= */}
        <div className="hidden lg:flex relative w-full h-screen items-center pt-24 pb-24">
          {/* Shared Top Counter (Masked with one absolutely-positioned element per number) */}
          <div className="absolute top-24 left-8 md:left-12 lg:left-16 z-30 flex items-center gap-3 font-mono text-xs md:text-sm tracking-[0.25em] text-neutral-400 pointer-events-none">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={{ backgroundColor: activeProject.accent }}
            />
            {/* Overflow-hidden mask for single active number */}
            <div className="relative h-5 w-7 overflow-hidden">
              {PROJECTS.map((proj, pIdx) => (
                <span
                  key={proj.index}
                  ref={(el) => {
                    counterNumberRefs.current[pIdx] = el;
                  }}
                  className="absolute inset-0 flex items-center font-bold text-white will-change-transform"
                >
                  {proj.index}
                </span>
              ))}
            </div>
            <span>/ 04 {"//"} SELECTED WORK</span>
          </div>

          {/* Project Slides */}
          {PROJECTS.map((project, idx) => (
            <div
              key={project.index}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-between px-8 md:px-12 lg:px-16 pt-24 pb-24 max-w-[1560px] mx-auto pointer-events-none"
            >
              {/* Left Column: Info, Split-Letter Title, Summary, Tags, Magnetic Button */}
              <div className="w-full lg:w-5/12 xl:w-1/2 flex flex-col justify-center pr-6 lg:pr-12 z-20">
                {/* Split-Letter Title Reveal */}
                <h2 className="font-anton uppercase tracking-[-0.02em] text-[clamp(3.5rem,6.5vw,7.2rem)] leading-[0.88] text-white my-1 flex flex-wrap">
                  {project.title.split("").map((char, cIdx) => (
                    <span key={cIdx} className="inline-block overflow-hidden py-1">
                      <span
                        ref={(el) => {
                          if (!letterRefs.current[idx]) letterRefs.current[idx] = [];
                          letterRefs.current[idx][cIdx] = el;
                        }}
                        className="inline-block will-change-transform"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    </span>
                  ))}
                </h2>

                {/* Left Details (Summary, Staggered Pills, Magnetic Button) */}
                <div
                  ref={(el) => {
                    detailsRefs.current[idx] = el;
                  }}
                  className="flex flex-col"
                >
                  {/* 2-3 Line Plain-English Summary */}
                  <p className="text-neutral-300 font-sans text-base sm:text-lg leading-relaxed max-w-xl mt-4 mb-6">
                    {project.summary}
                  </p>

                  {/* Tech Pills (Slide in one by one) */}
                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tag}
                        ref={(el) => {
                          if (!pillsRefs.current[idx]) pillsRefs.current[idx] = [];
                          pillsRefs.current[idx][tIdx] = el;
                        }}
                        className="px-3.5 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-colors duration-500 border will-change-transform"
                        style={{
                          backgroundColor: `${project.accent}14`,
                          borderColor: `${project.accent}45`,
                          color: project.accent,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Magnetic Case Study Button with Rotating Arrow */}
                  <div>
                    <MagneticCaseStudyButton
                      onClick={() => setSelectedProject(project)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Container with Quick Accent Color Wipe */}
              <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center lg:justify-end mr-8 xl:mr-20 z-20 pointer-events-auto relative">
                {/* Accent Color Sweep Bar across incoming visual on transition */}
                <div
                  ref={(el) => {
                    sweepRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 z-30 pointer-events-none rounded-2xl will-change-transform"
                  style={{
                    backgroundColor: project.accent,
                    clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
                  }}
                />

                {/* Visual Component */}
                <div
                  ref={(el) => {
                    visualRefs.current[idx] = el;
                  }}
                  className="w-full flex justify-end will-change-transform"
                >
                  <ProjectVisualItem
                    project={project}
                    onOpenModal={setSelectedProject}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            RIGHT-SIDE VERTICAL PROJECT NAV: Far right edge (fixed, right: 2rem)
            Labels hidden on < 1280px (dots only)
            ========================================================================= */}
        <div
          className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-40 flex-col items-end pointer-events-auto transition-opacity duration-300 ${
            isNavVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ right: "2rem" }}
        >
          <div className="relative flex flex-col gap-6 items-end">
            {/* Continuous Vertical Guide Line */}
            <div className="absolute right-[5px] top-2 bottom-2 w-[1px] bg-white/15 pointer-events-none" />

            {PROJECTS.map((proj, idx) => {
              const isActive = activeProjectIndex === idx;
              return (
                <button
                  key={proj.index}
                  onClick={() => handleScrollToProject(idx)}
                  className="group flex items-center gap-4 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  data-cursor="hover"
                >
                  {/* Project Name Label: Hidden on screens < 1280px (dots only) */}
                  <span
                    className={`hidden xl:inline-block font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                      isActive
                        ? "opacity-100 font-semibold"
                        : "opacity-35 group-hover:opacity-80 text-neutral-400"
                    }`}
                    style={{
                      color: isActive ? proj.accent : undefined,
                    }}
                  >
                    {proj.index} {proj.title}
                  </span>

                  {/* Dot Indicator */}
                  <div className="relative w-3 h-3 flex items-center justify-center">
                    <span
                      className={`rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-3 h-3"
                          : "w-1.5 h-1.5 bg-neutral-600 group-hover:bg-white"
                      }`}
                      style={{
                        backgroundColor: isActive ? proj.accent : undefined,
                        boxShadow: isActive ? `0 0 14px ${proj.accent}` : undefined,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ELEMENTS: Full-Width Progress Line & "SCROLL ↓" Hint
            ========================================================================= */}
        {/* Full-width thin progress line filling with active accent color */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-40 overflow-hidden pointer-events-none">
          <div
            ref={bottomProgressBarRef}
            className="h-full w-full origin-left will-change-transform transition-colors duration-500"
            style={{
              transform: "scaleX(0)",
              backgroundColor: activeProject.accent,
            }}
          />
        </div>

        {/* "SCROLL ↓" hint on the first project only */}
        <div
          className={`hidden lg:flex absolute bottom-6 left-8 md:left-12 lg:left-16 z-30 items-center gap-2.5 font-mono text-xs tracking-[0.25em] uppercase text-neutral-400 transition-all duration-500 pointer-events-none ${
            activeProjectIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <span>SCROLL</span>
          <span className="animate-bounce">↓</span>
        </div>

        {/* =========================================================================
            MOBILE VIEW: Normal Vertical Stack (No Pin)
            ========================================================================= */}
        <div className="flex flex-col lg:hidden w-full divide-y divide-white/10 px-6 py-12">
          {PROJECTS.map((proj, idx) => (
            <div
              key={proj.index}
              id={`mobile-project-${idx}`}
              className="py-14 flex flex-col gap-8"
            >
              {/* Info Column */}
              <div className="flex flex-col">
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400 mb-2 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: proj.accent }}
                  />
                  <span>{proj.index} / 04</span>
                </div>

                <h2 className="font-anton uppercase tracking-[-0.02em] text-4xl sm:text-5xl text-white mb-3">
                  {proj.title}
                </h2>

                <p className="text-neutral-300 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  {proj.summary}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${proj.accent}14`,
                        borderColor: `${proj.accent}45`,
                        color: proj.accent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Case Study Trigger Button */}
                <button
                  onClick={() => setSelectedProject(proj)}
                  className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-white cursor-pointer bg-transparent border-none p-0 w-fit"
                  data-cursor="hover"
                >
                  <span className="border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                    OPEN CASE STUDY
                  </span>
                  <span className="inline-block transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </button>
              </div>

              {/* Animated Visual */}
              <div className="w-full flex justify-center">
                <ProjectVisualItem
                  project={proj}
                  onOpenModal={setSelectedProject}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shared-Element Fullscreen Case Study Modal */}
      <CaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(p) => setSelectedProject(p)}
      />
    </>
  );
}
