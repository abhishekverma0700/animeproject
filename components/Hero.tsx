"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "./Preloader";
import Marquee from "./Marquee";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
});

/**
 * Text Scramble Effect for Cyberpunk / Editorial Decryption
 */
function scrambleText(
  element: HTMLElement | null,
  targetText: string,
  duration = 450
) {
  if (!element) return;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    element.textContent = targetText;
    return;
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!/_•$#&";
  const startTime = performance.now();
  const length = targetText.length;

  function updateFrame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const revealedCount = Math.floor(progress * length);

    let result = "";
    for (let i = 0; i < length; i++) {
      if (targetText[i] === " " || targetText[i] === "/") {
        result += targetText[i];
      } else if (i < revealedCount) {
        result += targetText[i];
      } else {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    if (element) {
      element.textContent = result;
    }

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else if (element) {
      element.textContent = targetText;
    }
  }

  requestAnimationFrame(updateFrame);
}

/**
 * Hero States Data Array
 * Easily customize text, roles, and bottom statements for each slide state.
 */
export interface HeroSlideData {
  id: string;
  index: string;
  headline: [string, string];
  roles: [string, string, string];
  bottomText: string;
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: "fullstack",
    index: "01",
    headline: ["FULL-STACK", "/ DEVELOPER"],
    roles: [
      "/ NEXT.JS DEVELOPER",
      "/ NESTJS ENGINEER",
      "/ PROJECT MANAGER",
    ],
    bottomText: "IDEA → PRODUCT",
  },
  {
    id: "ai",
    index: "02",
    headline: ["AI", "/ ENGINEER"],
    roles: [
      "/ LLM & AGENT WORKFLOWS",
      "/ RAG & VECTOR SEARCH",
      "/ PYTHON & PYTORCH",
    ],
    bottomText: "PROMPT → AGENT",
  },
  {
    id: "saas",
    index: "03",
    headline: ["SAAS", "/ BUILDER"],
    roles: [
      "/ DISTRIBUTED ARCHITECTURE",
      "/ CLOUD & DEVOPS INFRA",
      "/ 0 TO 1 PRODUCT LAUNCH",
    ],
    bottomText: "CODE → SCALE",
  },
  {
    id: "talk",
    index: "04",
    headline: ["LET'S", "/ TALK"],
    roles: [
      "/ AVAILABLE FOR WORK",
      "/ CONSULTING & ADVISORY",
      "/ REMOTE / WORLDWIDE",
    ],
    bottomText: "START → CONNECT",
  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const photoWrapperRef = useRef<HTMLDivElement>(null);
  const photoImageRef = useRef<HTMLDivElement>(null);

  // References for scrubbed states
  const line1Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const line2Refs = useRef<(HTMLSpanElement | null)[]>([]);
  const roleRowRefs = useRef<(HTMLSpanElement | null)[][]>([[], [], [], []]);
  const bottomRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Indicators & 3D Progress
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const lastStepRef = useRef<number>(1);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial positions for states: State 0 is at 0%, States 1..3 are hidden at 115%
      HERO_SLIDES.forEach((_, idx) => {
        const isInitial = idx === 0;
        const initialY = isInitial ? "0%" : "115%";

        if (line1Refs.current[idx]) {
          gsap.set(line1Refs.current[idx], { y: initialY });
        }
        if (line2Refs.current[idx]) {
          gsap.set(line2Refs.current[idx], { y: initialY });
        }
        if (bottomRefs.current[idx]) {
          gsap.set(bottomRefs.current[idx], { y: initialY });
        }

        const roles = roleRowRefs.current[idx] || [];
        roles.forEach((roleEl) => {
          if (roleEl) {
            gsap.set(roleEl, { y: initialY });
          }
        });
      });

      // 2. Initial on-load entrance animation (paused until preloader curtain slides up)
      const introTl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });
      introTlRef.current = introTl;

      introTl
        .fromTo(
          photoImageRef.current,
          { opacity: 0, scale: 1.12 },
          { opacity: 1, scale: 1, duration: 1.4 },
          0.1
        )
        .fromTo(
          [line1Refs.current[0], line2Refs.current[0]],
          { y: "115%" },
          { y: "0%", duration: 1.1, stagger: 0.1 },
          0.2
        )
        .fromTo(
          roleRowRefs.current[0] || [],
          { y: "115%" },
          { y: "0%", duration: 0.8, stagger: 0.06 },
          0.4
        )
        .fromTo(
          bottomRefs.current[0],
          { y: "115%" },
          { y: "0%", duration: 1.2, ease: "power4.out" },
          0.3
        );

      // 3. ScrollTrigger scrubbed timeline with 4 states
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            progressRef.current = progress;

            // Fill vertical progress line
            if (progressBarRef.current) {
              gsap.set(progressBarRef.current, {
                scaleY: Math.max(0.1, progress),
              });
            }

            // Update counter 01/04 -> 04/04
            let currentStep = 1;
            if (progress > 0.78) currentStep = 4;
            else if (progress > 0.48) currentStep = 3;
            else if (progress > 0.18) currentStep = 2;

            if (counterRef.current) {
              counterRef.current.textContent = `0${currentStep}`;
            }

            // Text Scramble Effect on headline when state changes
            if (currentStep !== lastStepRef.current) {
              const previous = lastStepRef.current;
              lastStepRef.current = currentStep;

              if (previous !== 0) {
                const targetSlide = HERO_SLIDES[currentStep - 1];
                if (targetSlide) {
                  scrambleText(
                    line1Refs.current[currentStep - 1],
                    targetSlide.headline[0]
                  );
                  scrambleText(
                    line2Refs.current[currentStep - 1],
                    targetSlide.headline[1]
                  );
                }
              }
            }

            // Fade out "SCROLL" hint after first scroll
            if (scrollHintRef.current) {
              if (progress > 0.02) {
                gsap.to(scrollHintRef.current, {
                  opacity: 0,
                  y: -8,
                  duration: 0.35,
                  overwrite: "auto",
                });
              } else {
                gsap.to(scrollHintRef.current, {
                  opacity: 1,
                  y: 0,
                  duration: 0.35,
                  overwrite: "auto",
                });
              }
            }
          },
        },
      });

      // Build 3 transitions between the 4 states with hold intervals
      for (let i = 0; i < HERO_SLIDES.length - 1; i++) {
        const fromIdx = i;
        const toIdx = i + 1;
        const label = `transition_${fromIdx}_to_${toIdx}`;

        // Hold current state
        scrubTl.to({}, { duration: 0.8 });

        const outgoing = [
          line1Refs.current[fromIdx],
          line2Refs.current[fromIdx],
          roleRowRefs.current[fromIdx]?.[0],
          roleRowRefs.current[fromIdx]?.[1],
          roleRowRefs.current[fromIdx]?.[2],
          bottomRefs.current[fromIdx],
        ].filter(Boolean);

        const incoming = [
          line1Refs.current[toIdx],
          line2Refs.current[toIdx],
          roleRowRefs.current[toIdx]?.[0],
          roleRowRefs.current[toIdx]?.[1],
          roleRowRefs.current[toIdx]?.[2],
          bottomRefs.current[toIdx],
        ].filter(Boolean);

        // Slide outgoing up and out inside masks (stagger 0.05)
        scrubTl.to(
          outgoing,
          {
            y: "-115%",
            stagger: 0.05,
            duration: 0.7,
            ease: "power2.inOut",
          },
          label
        );

        // Slide incoming up from below inside masks (stagger 0.05)
        scrubTl.to(
          incoming,
          {
            y: "0%",
            stagger: 0.05,
            duration: 0.7,
            ease: "power2.inOut",
          },
          label
        );
      }

      // Final hold for state 4
      scrubTl.to({}, { duration: 0.8 });

      // Smooth unpin transition into next section (fade & scale hero content)
      scrubTl.to(
        [heroContentRef.current, photoWrapperRef.current],
        {
          opacity: 0.25,
          scale: 0.95,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "+=0.1"
      );

      // Refresh ScrollTrigger after DOM setup
      ScrollTrigger.refresh();
    }, containerRef);

    // Subtle parallax and cursor spotlight on photo on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;

      if (photoWrapperRef.current) {
        gsap.to(photoWrapperRef.current, {
          x: x * 15,
          y: y * 12,
          rotateY: x * 2,
          rotateX: -y * 2,
          duration: 0.9,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Update spotlight position relative to photo wrapper
        const rect = photoWrapperRef.current.getBoundingClientRect();
        const spotX = e.clientX - rect.left;
        const spotY = e.clientY - rect.top;
        photoWrapperRef.current.style.setProperty("--spot-x", `${spotX}px`);
        photoWrapperRef.current.style.setProperty("--spot-y", `${spotY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Callback when preloader finishes
  const handlePreloadComplete = useCallback(() => {
    introTlRef.current?.play();
  }, []);

  return (
    <>
      {/* 0 -> 100 Editorial Preloader Curtain */}
      <Preloader onComplete={handlePreloadComplete} />

      <section
        ref={containerRef}
        id="hero"
        className="relative w-full h-screen min-h-[640px] max-h-[1440px] bg-[#0a0a0a] text-white overflow-hidden flex flex-col justify-between pt-24 pb-8 px-6 md:px-12 lg:px-16 select-none"
      >
        {/* 3D WebGL Layer (Behind photo, above background) */}
        <HeroScene progressRef={progressRef} />

        {/* Subtle Background Accent Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 opacity-10">
          <div className="w-[1px] h-full bg-white/20" />
          <div className="w-[1px] h-full bg-white/20 hidden md:block" />
          <div className="w-[1px] h-full bg-white/20 hidden lg:block" />
          <div className="w-[1px] h-full bg-white/20" />
        </div>

        {/* Main Content Area: Left Stacked States Typography */}
        <div
          ref={heroContentRef}
          className="relative z-20 flex-1 flex flex-col justify-center max-w-[1920px] w-full mx-auto"
        >
          <div className="max-w-[70vw] lg:max-w-[55vw] xl:max-w-[50vw]">
            {/* Headline Line 1 & Line 2 */}
            <h1 className="font-anton uppercase tracking-[-0.02em] text-[clamp(3.6rem,8.2vw,9.8rem)] leading-[0.88] text-white">
              {/* Line 1 (Overflow Mask) */}
              <div className="grid grid-cols-1 grid-rows-1 overflow-hidden py-1">
                {HERO_SLIDES.map((slide, idx) => (
                  <span
                    key={slide.id + "-l1"}
                    ref={(el) => {
                      if (el) line1Refs.current[idx] = el;
                    }}
                    className="col-start-1 row-start-1 block will-change-transform"
                  >
                    {slide.headline[0]}
                  </span>
                ))}
              </div>

              {/* Line 2 (Overflow Mask) */}
              <div className="grid grid-cols-1 grid-rows-1 overflow-hidden py-1">
                {HERO_SLIDES.map((slide, idx) => (
                  <span
                    key={slide.id + "-l2"}
                    ref={(el) => {
                      if (el) line2Refs.current[idx] = el;
                    }}
                    className="col-start-1 row-start-1 block will-change-transform text-white/95"
                  >
                    {slide.headline[1]}
                  </span>
                ))}
              </div>
            </h1>

            {/* 3 Small Mono Role Lines Below Headline */}
            <div className="mt-8 md:mt-10 lg:mt-12 flex flex-col gap-2 font-mono text-xs sm:text-sm tracking-[0.22em] uppercase text-neutral-400">
              {[0, 1, 2].map((roleRowIdx) => (
                <div
                  key={"role-row-" + roleRowIdx}
                  className="grid grid-cols-1 grid-rows-1 overflow-hidden py-0.5"
                >
                  {HERO_SLIDES.map((slide, stateIdx) => (
                    <span
                      key={slide.id + "-r-" + roleRowIdx}
                      ref={(el) => {
                        if (el) {
                          if (!roleRowRefs.current[stateIdx]) {
                            roleRowRefs.current[stateIdx] = [];
                          }
                          roleRowRefs.current[stateIdx][roleRowIdx] = el;
                        }
                      }}
                      className="col-start-1 row-start-1 block will-change-transform text-white/70 hover:text-white transition-colors"
                    >
                      {slide.roles[roleRowIdx]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Thin Progress Indicator + Scroll Hint */}
          <div className="flex items-center gap-4 mt-8 md:mt-10 pointer-events-none">
            {/* Vertical progress line */}
            <div className="flex items-center gap-3">
              <div className="w-[1px] h-10 md:h-12 bg-white/20 relative overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="w-full h-full bg-white origin-top will-change-transform"
                  style={{ transform: "scaleY(0.1)" }}
                />
              </div>

              {/* Counter 01 / 04 */}
              <div className="font-mono text-xs tracking-[0.25em] text-neutral-400">
                <span ref={counterRef} className="text-white font-semibold">
                  01
                </span>
                <span className="text-neutral-600"> / 04</span>
              </div>
            </div>

            {/* "SCROLL" Hint that fades out after first scroll */}
            <div
              ref={scrollHintRef}
              className="ml-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase text-neutral-400"
            >
              <span>SCROLL</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Anchored Fixed Photo with Spotlight & CSS Mask */}
        <div
          ref={photoWrapperRef}
          style={{ perspective: 1000, isolation: "auto" }}
          className="absolute right-0 bottom-0 z-10 w-[85vw] sm:w-[65vw] md:w-[48vw] lg:w-[42vw] xl:w-[38vw] max-w-[760px] h-[65vh] sm:h-[72vh] md:h-[84vh] lg:h-[90vh] pointer-events-none select-none bg-transparent"
          data-cursor="photo"
        >
          <div
            ref={photoImageRef}
            style={{ isolation: "auto" }}
            className="relative w-full h-full will-change-transform bg-transparent"
          >
            <div
              className="relative w-full h-full hero-image-mask bg-transparent"
              style={{ isolation: "auto" }}
            >
              <Image
                src="/me.png"
                alt="Abhishek - Full-Stack Developer & Software Architect"
                fill
                priority
                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 48vw, 40vw"
                className="object-cover object-top grayscale contrast-[1.1] mix-blend-lighten"
                style={{ mixBlendMode: "lighten" }}
              />

              {/* Cursor-Following Radial Spotlight over the photo */}
              <div
                className="absolute inset-0 pointer-events-none hero-image-mask"
                style={{
                  background:
                    "radial-gradient(circle 380px at var(--spot-x, 60%) var(--spot-y, 50%), rgba(255, 255, 255, 0.12), transparent 75%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Giant Overlapping Text (Masked Scrubbed States) */}
        <div className="relative z-20 w-full max-w-[1920px] mx-auto pointer-events-none select-none pb-6">
          <div className="grid grid-cols-1 grid-rows-1 overflow-hidden pt-2">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id + "-bottom"}
                ref={(el) => {
                  if (el) bottomRefs.current[idx] = el;
                }}
                className="col-start-1 row-start-1 font-anton uppercase tracking-[-0.03em] text-[clamp(3.8rem,13.2vw,14.8rem)] leading-[0.8] text-white mix-blend-difference will-change-transform"
              >
                {slide.bottomText}
              </div>
            ))}
          </div>
        </div>

        {/* Infinite Outlined Marquee Strip at the Very Bottom */}
        <Marquee />
      </section>
    </>
  );
}
