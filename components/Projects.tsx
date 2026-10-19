"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INITIAL_PROJECTS, LiveProject } from "@/data/projects";
import { useSmoothScroll } from "./SmoothScroll";
import CaseStudyModal from "./CaseStudyModal";
import GlassMockBrowser from "./GlassMockBrowser";

function formatDeployedTime(dateStr?: string): string {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "recently";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffHours < 1) {
    return `${Math.max(1, diffMin)}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffWeeks < 5) {
    return `${diffWeeks}w ago`;
  }
  return `${diffMonths}mo ago`;
}

export default function Projects() {
  const { lenis } = useSmoothScroll();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Dynamic projects state: initializes with INITIAL_PROJECTS for instant hydration,
  // then updates with real-time live deployment telemetry from /api/projects.
  const [projects, setProjects] = useState<LiveProject[]>(INITIAL_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);

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
  const [selectedProject, setSelectedProject] = useState<LiveProject | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);

  const activeProject = projects[activeProjectIndex] || projects[0];

  // Fetch real-time live project data from server-only API endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchLiveProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          if (
            isMounted &&
            Array.isArray(data.projects) &&
            data.projects.length > 0
          ) {
            setProjects(data.projects);
            // Refresh ScrollTrigger calculations after live data updates
            setTimeout(() => {
              ScrollTrigger.refresh();
            }, 150);
          }
        }
      } catch (err) {
        console.warn(
          "[Projects] Live telemetry fetch failed, falling back to local dataset:",
          err
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLiveProjects();

    return () => {
      isMounted = false;
    };
  }, []);

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
      // Set initial states: project 0 is visible, projects 1..n hidden
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

      for (let k = 1; k < projects.length; k++) {
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
          end: () => `+=${(projects.length - 1) * 100}%`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Update bottom full-width progress line
            if (bottomProgressBarRef.current) {
              gsap.set(bottomProgressBarRef.current, { scaleX: p });
            }

            const idx = Math.min(
              projects.length - 1,
              Math.floor(p * projects.length + 0.15)
            );
            setActiveProjectIndex(idx);

            // Enforce strictly one counter visible; kill stale tweens
            projects.forEach((_, k) => {
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
            projects.forEach((_, k) => {
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
      for (let i = 0; i < projects.length - 1; i++) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // Smooth scroll to project via Lenis when clicking indicator dots
  const handleScrollToProject = (idx: number) => {
    if (!lenis) return;
    if (window.innerWidth >= 1024 && scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const targetRatio = idx / (projects.length - 1);
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
        {projects.map((proj, idx) => (
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
            {projects.map((proj, idx) => (
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

        {/* Top-Right Live Sync Status Pill */}
        {isLoading && (
          <div className="absolute top-24 right-8 md:right-12 lg:right-16 z-30 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-widest uppercase text-neutral-400 glass px-3.5 py-1.5 rounded-full border border-white/10 bg-black/40">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: activeProject.accent }}
            />
            <span>SYNCING TELEMETRY...</span>
          </div>
        )}

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
              {projects.map((proj, pIdx) => (
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
            <span>/ 03 {"//"} SELECTED WORK</span>
          </div>

          {/* Project Slides */}
          {projects.map((project, idx) => (
            <div
              key={project.index}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-between px-8 md:px-12 lg:px-16 pt-24 pb-24 max-w-[1560px] mx-auto pointer-events-none"
            >
              {/* Left Column: Info, Status Badge, Title, Summary, Tags, Action Buttons */}
              <div className="w-full lg:w-5/12 xl:w-1/2 flex flex-col justify-center pr-6 lg:pr-12 z-20">
                {/* Live Status Badge */}
                <div className="flex items-center gap-2.5 mb-3 font-mono text-xs uppercase tracking-[0.22em] text-neutral-300">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: project.accent }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: project.accent }}
                    />
                  </span>
                  <span className="font-semibold text-white">
                    ● {project.status || "LIVE"}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-400">
                    deployed {formatDeployedTime(project.deployedAt)}
                  </span>
                </div>

                {/* Split-Letter Title Reveal */}
                <h2 className="font-anton uppercase tracking-[-0.02em] text-[clamp(3.5rem,6.2vw,6.8rem)] leading-[0.88] text-white my-1 flex flex-wrap">
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

                {/* Left Details (Summary, Staggered Pills, Action Buttons) */}
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
                    {(project.techTags || project.tags || []).map((tag, tIdx) => (
                      <span
                        key={tag}
                        ref={(el) => {
                          if (!pillsRefs.current[idx]) pillsRefs.current[idx] = [];
                          pillsRefs.current[idx][tIdx] = el;
                        }}
                        className="glass !rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-500 will-change-transform"
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

                  {/* Action Buttons: "VISIT LIVE ↗" and "VIEW CODE ↗" */}
                  <div className="flex flex-wrap items-center gap-3.5">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-[0.2em] font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                        style={{
                          backgroundColor: `${project.accent}20`,
                          borderColor: `${project.accent}55`,
                          boxShadow: `0 0 20px ${project.accent}25`,
                        }}
                        data-cursor="hover"
                      >
                        <span>VISIT LIVE</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </a>
                    )}

                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass group inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-[0.2em] text-neutral-300 hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-white/15 hover:border-white/40 cursor-pointer"
                        data-cursor="hover"
                      >
                        <svg
                          className="w-3.5 h-3.5 fill-current text-white/80 group-hover:text-white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span>VIEW CODE</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-2 ml-1"
                      data-cursor="hover"
                    >
                      <span className="border-b border-white/20 pb-0.5 group-hover:border-white transition-colors">
                        CASE STUDY
                      </span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        ↗
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Container with Quick Accent Color Wipe */}
              <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center lg:justify-end mr-8 xl:mr-16 z-20 pointer-events-auto relative">
                {/* Accent Color Sweep Bar across incoming visual on transition */}
                <div
                  ref={(el) => {
                    sweepRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 z-30 pointer-events-none rounded-[22px] will-change-transform"
                  style={{
                    backgroundColor: project.accent,
                    clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
                  }}
                />

                {/* Glass Mock Browser Visual Component */}
                <div
                  ref={(el) => {
                    visualRefs.current[idx] = el;
                  }}
                  className="w-full flex justify-end will-change-transform"
                >
                  <GlassMockBrowser
                    project={project}
                    isActive={activeProjectIndex === idx}
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

            {projects.map((proj, idx) => {
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
          {projects.map((proj, idx) => (
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
                  <span>{proj.index} / 03</span>
                  <span className="text-neutral-500">·</span>
                  <span className="font-semibold text-white">
                    ● {proj.status || "LIVE"}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-400">
                    {formatDeployedTime(proj.deployedAt)}
                  </span>
                </div>

                <h2 className="font-anton uppercase tracking-[-0.02em] text-4xl sm:text-5xl text-white mb-3">
                  {proj.title}
                </h2>

                <p className="text-neutral-300 font-sans text-sm sm:text-base leading-relaxed mb-6">
                  {proj.summary}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(proj.techTags || proj.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="glass !rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
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

                {/* Action Buttons: "VISIT LIVE ↗" and "VIEW CODE ↗" */}
                <div className="flex flex-wrap items-center gap-3">
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass group relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-[0.2em] font-semibold text-white"
                      style={{
                        backgroundColor: `${proj.accent}20`,
                        borderColor: `${proj.accent}55`,
                      }}
                    >
                      <span>VISIT LIVE</span>
                      <span>↗</span>
                    </a>
                  )}

                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass group inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-mono text-xs uppercase tracking-[0.2em] text-neutral-300 hover:text-white border border-white/15"
                    >
                      <span>VIEW CODE</span>
                      <span>↗</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none p-2"
                  >
                    CASE STUDY ↗
                  </button>
                </div>
              </div>

              {/* Animated Mock Browser Visual */}
              <div className="w-full flex justify-center">
                <GlassMockBrowser
                  project={proj}
                  isActive={true}
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
