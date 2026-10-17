"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_DATA } from "@/data/about";

// Animated counter for stats that triggers when scrolled into view
function StatCounter({
  value,
  suffix,
  active,
}: {
  value: number;
  suffix: string;
  active: boolean;
}) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const duration = 1600; // ms
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(ease * value));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayVal(value);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [active, value]);

  return (
    <span>
      {active ? displayVal : 0}
      {suffix}
    </span>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);
  const topDividerRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Subtle background transition from #0a0a0a to #0f0f0f on section entry
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { backgroundColor: "#0a0a0a" },
          {
            backgroundColor: "#0f0f0f",
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      }

      // 2. Header (ABOUT) label fade-in
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Statement word-by-word scrubbed opacity (0.15 -> 1)
      if (statementRef.current) {
        const words = statementRef.current.querySelectorAll(".about-word");
        if (words.length > 0) {
          gsap.fromTo(
            words,
            { opacity: 0.15 },
            {
              opacity: 1,
              stagger: 0.04,
              ease: "none",
              scrollTrigger: {
                trigger: statementRef.current,
                start: "top 78%",
                end: "bottom 48%",
                scrub: 0.5,
              },
            }
          );
        }
      }

      // 4. Photo frame clip-path wipe reveal on scroll enter
      if (photoFrameRef.current) {
        gsap.fromTo(
          photoFrameRef.current,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            opacity: 0.8,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: photoFrameRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 5. Desktop-only slow parallax on the photo
      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          if (photoImgRef.current && photoFrameRef.current) {
            gsap.fromTo(
              photoImgRef.current,
              { yPercent: -8 },
              {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: photoFrameRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              }
            );
          }
        },
      });

      // 6. Stats row dividers draw in & count-up trigger
      if (topDividerRef.current) {
        gsap.fromTo(
          topDividerRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: statsRowRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const vertDividers = sectionRef.current?.querySelectorAll(".stat-divider-vert");
      if (vertDividers && vertDividers.length > 0) {
        gsap.fromTo(
          vertDividers,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: statsRowRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Trigger stats counter
      if (statsRowRef.current) {
        ScrollTrigger.create({
          trigger: statsRowRef.current,
          start: "top 78%",
          onEnter: () => setStatsActive(true),
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const statementWords = ABOUT_DATA.statement.split(" ");

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen bg-[#0f0f0f] text-white py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-20 overflow-hidden border-t border-white/5 transition-colors duration-500"
    >
      {/* Background Accent Radial Glow */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/[0.025] blur-[160px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-[1720px] mx-auto w-full relative z-10">
        {/* Section Header: Label & Mono Marker */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-12 sm:pb-16 border-b border-white/10 mb-16 lg:mb-24"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/90">
              {ABOUT_DATA.sectionLabel}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {ABOUT_DATA.sectionNumber}
            </span>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            ENGINEERING ARCHITECT & FULL-STACK SPECIALIST
          </div>
        </div>

        {/* Top Split: Big Statement & Photo Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start mb-24 lg:mb-36">
          {/* Left Column: Big Statement Paragraph */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between">
            <div className="mb-4">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-6">
                {"// EXECUTIVE SUMMARY"}
              </span>

              {/* Big statement paragraph with word-by-word scrubbed opacity */}
              <p
                ref={statementRef}
                className="font-anton uppercase tracking-[-0.015em] text-3xl sm:text-4xl md:text-5xl lg:text-[3.2vw] xl:text-[3.6vw] leading-[1.08] text-white"
              >
                {statementWords.map((word, idx) => (
                  <span
                    key={`${word}-${idx}`}
                    className="about-word inline-block mr-[0.25em] mb-[0.08em] opacity-[0.15] text-white will-change-[opacity]"
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

            {/* Editorial Subtitle / Mission */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-start text-neutral-400 font-sans text-sm sm:text-base leading-relaxed">
              <p className="max-w-xl">
                Bridging distributed cloud systems, real-time message brokers,
                and high-fidelity client experiences with uncompromised engineering rigor.
              </p>
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 shrink-0">
                [ 2020 — PRESENT ]
              </div>
            </div>
          </div>

          {/* Right Column: Tall Photo Frame with Clip-Path Reveal, Parallax & Rotating Badge */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Rotating Circular Text Badge */}
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 z-30 pointer-events-none select-none">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#0a0a0a]/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                  {/* Rotating SVG text */}
                  <svg
                    viewBox="0 0 120 120"
                    className="w-full h-full animate-[spin_12s_linear_infinite]"
                  >
                    <path
                      id="aboutBadgePath"
                      d="M 60, 60 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                      fill="none"
                    />
                    <text className="text-[9px] uppercase font-mono tracking-[0.24em] fill-neutral-300 font-semibold">
                      <textPath href="#aboutBadgePath">
                        {ABOUT_DATA.photo.badgeText}
                      </textPath>
                    </text>
                  </svg>

                  {/* Glowing Status Center Dot */}
                  <div className="absolute flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  </div>
                </div>
              </div>

              {/* Photo Frame Container */}
              <div
                ref={photoFrameRef}
                className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl group"
              >
                {/* Parallax Image Wrapper */}
                <div
                  ref={photoImgRef}
                  className="relative w-full h-[120%] -top-[10%] will-change-transform"
                >
                  <Image
                    src={ABOUT_DATA.photo.src}
                    alt={ABOUT_DATA.photo.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                    priority={false}
                    className="object-cover object-center grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-[filter] duration-700 select-none pointer-events-none"
                  />
                </div>

                {/* Editorial Vignette & Corner Marks */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Frame Corner Accents */}
                <span className="absolute top-3 left-3 font-mono text-[10px] text-white/40 select-none pointer-events-none">
                  +
                </span>
                <span className="absolute top-3 right-3 font-mono text-[10px] text-white/40 select-none pointer-events-none">
                  +
                </span>
                <span className="absolute bottom-3 left-3 font-mono text-[10px] text-white/40 select-none pointer-events-none">
                  +
                </span>
                <span className="absolute bottom-3 right-3 font-mono text-[10px] text-white/40 select-none pointer-events-none">
                  +
                </span>

                {/* Photo Frame Footer Caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/90 z-10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    <span>{ABOUT_DATA.photo.caption}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {ABOUT_DATA.photo.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row with Count-Up Numerals & Drawing Dividers */}
        <div ref={statsRowRef} className="relative mb-24 lg:mb-36">
          {/* Thin Horizontal Divider (draws in from left) */}
          <div
            ref={topDividerRef}
            className="w-full h-[1px] bg-white/10 origin-left mb-12 sm:mb-16 will-change-transform"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 relative">
            {ABOUT_DATA.stats.map((stat, idx) => (
              <div
                key={stat.id}
                className={`relative flex flex-col justify-between ${
                  idx > 0 ? "lg:pl-10 xl:pl-12" : ""
                } ${idx < ABOUT_DATA.stats.length - 1 ? "lg:pr-10 xl:pr-12" : ""}`}
              >
                {/* Thin Vertical Divider (Desktop, draws in from top) */}
                {idx > 0 && (
                  <div
                    className="stat-divider-vert hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-white/10 origin-top will-change-transform"
                    aria-hidden="true"
                  />
                )}

                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 block mb-2">
                    0{idx + 1} {"// METRIC"}
                  </span>

                  {/* Huge Numerals */}
                  <div className="font-anton uppercase text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white mb-2 leading-none">
                    <StatCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      active={statsActive}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-white/90 font-medium">
                    {stat.label}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1">
                    {stat.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "How I Work" List with Hover Dim-Siblings Effect */}
        <div className="relative pt-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {"// METHODOLOGY & WORK PRINCIPLES"}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              HOVER TO INSPECT
            </span>
          </div>

          {/* Group container for hover dim-siblings effect */}
          <div className="group/list flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
            {ABOUT_DATA.principles.map((item) => (
              <div
                key={item.id}
                className="group/item relative py-8 sm:py-10 lg:py-12 px-3 sm:px-6 transition-all duration-300 group-hover/list:opacity-30 hover:!opacity-100 hover:bg-white/[0.02] cursor-pointer"
                data-cursor="hover"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Prefix & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
                    <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-400 group-hover/item:text-emerald-400 transition-colors shrink-0">
                      {item.prefix}
                    </span>

                    <h3 className="font-anton uppercase text-2xl sm:text-3xl md:text-4xl tracking-tight text-white group-hover/item:translate-x-2 transition-transform duration-300">
                      {item.title}
                    </h3>
                  </div>

                  {/* Right: Description & Arrow */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 lg:max-w-md xl:max-w-lg">
                    <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed group-hover/item:text-neutral-200 transition-colors">
                      {item.description}
                    </p>

                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover/item:border-white group-hover/item:bg-white group-hover/item:text-black transition-all duration-300 text-xs">
                      <span className="inline-block transition-transform duration-300 group-hover/item:rotate-45">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
