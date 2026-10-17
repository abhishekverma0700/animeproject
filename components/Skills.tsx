"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS_DATA, SkillCategory, SkillItem } from "@/data/skills";

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingContainerRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLHeadingElement>(null);
  const headingLine2Ref = useRef<HTMLHeadingElement>(null);
  const headerLabelRef = useRef<HTMLDivElement>(null);
  const groupsContainerRef = useRef<HTMLDivElement>(null);

  // Marquee refs
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  // Floating cursor tag ref
  const floatingTagRef = useRef<HTMLDivElement>(null);

  // State for hovered skill on desktop
  const [hoveredSkill, setHoveredSkill] = useState<{
    skill: SkillItem;
    category: SkillCategory;
  } | null>(null);

  // State for active/hovered group for accent glow
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Mobile tapped skill state
  const [tappedSkillId, setTappedSkillId] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    const ctx = gsap.context(() => {
      // 1. Header mono label fade in
      if (headerLabelRef.current) {
        gsap.fromTo(
          headerLabelRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerLabelRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 2. Giant outlined heading mask slide-up reveal
      if (headingLine1Ref.current && headingLine2Ref.current) {
        gsap.fromTo(
          [headingLine1Ref.current, headingLine2Ref.current],
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.0,
            stagger: 0.12,
            ease: "power4.out",
            scrollTrigger: {
              trigger: headingContainerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Stagger-reveal groups and rows group by group
      const groupElements =
        groupsContainerRef.current?.querySelectorAll(".skill-group");
      if (groupElements) {
        groupElements.forEach((groupEl) => {
          const line = groupEl.querySelector(".group-line");
          const rows = groupEl.querySelectorAll(".skill-row");

          // Draw in line
          if (line) {
            gsap.fromTo(
              line,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.9,
                ease: "power3.inOut",
                scrollTrigger: {
                  trigger: groupEl,
                  start: "top 82%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }

          // Stagger rows
          if (rows.length > 0) {
            gsap.fromTo(
              rows,
              { y: 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.65,
                stagger: 0.05,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: groupEl,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        });
      }

      // 4. Marquee continuous infinite translation with scroll velocity reaction
      if (marqueeTrackRef.current && !prefersReducedMotion) {
        let xPos = 0;
        const baseSpeed = 0.85;
        let currentVelocityBonus = 0;

        const updateMarquee = () => {
          // Decay velocity bonus back to 0
          currentVelocityBonus = gsap.utils.interpolate(
            currentVelocityBonus,
            0,
            0.04
          );

          const totalSpeed = baseSpeed + currentVelocityBonus;
          xPos -= totalSpeed;

          // Track has 2 identical duplicated sets; when halfway scrolled, loop smoothly
          const trackWidth = marqueeTrackRef.current?.scrollWidth || 0;
          const halfWidth = trackWidth / 2;

          if (halfWidth > 0 && Math.abs(xPos) >= halfWidth) {
            xPos = 0;
          }

          if (marqueeTrackRef.current) {
            marqueeTrackRef.current.style.transform = `translate3d(${xPos}px, 0, 0)`;
          }
        };

        // ScrollTrigger to observe velocity
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const vel = Math.abs(self.getVelocity());
            // Boost speed proportionally to scroll velocity
            currentVelocityBonus = Math.min(vel * 0.004, 8);
          },
        });

        gsap.ticker.add(updateMarquee);

        return () => {
          gsap.ticker.remove(updateMarquee);
        };
      }
    }, sectionRef);

    // 5. Mouse tracker for floating cursor tag (desktop only)
    let moveListener: ((e: MouseEvent) => void) | null = null;
    if (isDesktop && floatingTagRef.current && !prefersReducedMotion) {
      const tag = floatingTagRef.current;
      const xTo = gsap.quickTo(tag, "x", { duration: 0.22, ease: "power3.out" });
      const yTo = gsap.quickTo(tag, "y", { duration: 0.22, ease: "power3.out" });

      moveListener = (e: MouseEvent) => {
        xTo(e.clientX + 16);
        yTo(e.clientY + 16);
      };

      window.addEventListener("mousemove", moveListener);
    }

    return () => {
      ctx.revert();
      if (moveListener) {
        window.removeEventListener("mousemove", moveListener);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full min-h-screen bg-[#0a0a0a] text-white py-24 md:py-32 lg:py-40 px-6 md:px-12 lg:px-20 overflow-hidden border-t border-white/5"
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-sky-500/[0.015] blur-[180px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-[1720px] mx-auto w-full relative z-10">
        {/* Top Header Label */}
        <div
          ref={headerLabelRef}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 border-b border-white/10 mb-12 sm:mb-16"
        >
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

        {/* Giant Outlined Heading with Mask Slide-Up Reveal */}
        <div ref={headingContainerRef} className="mb-20 sm:mb-28 lg:mb-32">
          <div className="overflow-hidden">
            <h2
              ref={headingLine1Ref}
              className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial"
            >
              {SKILLS_DATA.headingLine1}
            </h2>
          </div>
          <div className="overflow-hidden">
            <h2
              ref={headingLine2Ref}
              className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial"
            >
              {SKILLS_DATA.headingLine2}
            </h2>
          </div>
        </div>

        {/* Four Groups Grid */}
        <div
          ref={groupsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-10 xl:gap-12 mb-28 lg:mb-40"
        >
          {SKILLS_DATA.categories.map((category) => {
            const isGroupActive =
              activeGroupId === category.id ||
              hoveredSkill?.category.id === category.id;

            return (
              <div
                key={category.id}
                className="skill-group relative group/col flex flex-col justify-start"
                onMouseEnter={() => setActiveGroupId(category.id)}
                onMouseLeave={() => setActiveGroupId(null)}
              >
                {/* Subtle Accent Glow behind active/hovered group */}
                <div
                  className={`pointer-events-none absolute -inset-8 rounded-3xl transition-opacity duration-700 blur-3xl -z-10 ${
                    isGroupActive ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    background: `radial-gradient(circle, ${category.accent}20 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />

                {/* Group Header */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
                    <span
                      className="font-semibold transition-colors duration-300"
                      style={{ color: category.accent }}
                    >
                      {category.number} {"//"}
                    </span>
                    <span className="text-white/80 tracking-[0.25em]">
                      {category.title}
                    </span>
                  </div>

                  {/* Thin line that draws in on scroll enter */}
                  <div
                    className="group-line w-full h-[1px] origin-left will-change-transform"
                    style={{ backgroundColor: `${category.accent}66` }}
                  />
                </div>

                {/* Skills Rows */}
                <div className="flex flex-col divide-y divide-white/5 border-b border-white/5">
                  {category.skills.map((skill) => {
                    const isHovered = hoveredSkill?.skill.id === skill.id;
                    const isAnyHovered = hoveredSkill !== null;
                    const isTapped = tappedSkillId === skill.id;

                    return (
                      <div
                        key={skill.id}
                        className={`skill-row group/row relative py-4 sm:py-5 px-1 sm:px-2 transition-all duration-300 cursor-pointer select-none ${
                          isHovered
                            ? "opacity-100 translate-x-3 sm:translate-x-4"
                            : isAnyHovered
                            ? "opacity-25"
                            : "opacity-85 hover:opacity-100"
                        }`}
                        onMouseEnter={() => {
                          setHoveredSkill({ skill, category });
                          setActiveGroupId(category.id);
                        }}
                        onMouseLeave={() => {
                          setHoveredSkill(null);
                        }}
                        onClick={() => {
                          // Tap highlights row on mobile
                          setTappedSkillId((prev) =>
                            prev === skill.id ? null : skill.id
                          );
                        }}
                        data-cursor="hover"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-anton uppercase text-2xl sm:text-3xl lg:text-3xl xl:text-4xl tracking-tight transition-colors duration-300"
                            style={{
                              color: isHovered || isTapped ? category.accent : undefined,
                            }}
                          >
                            {skill.name}
                          </span>

                          {/* Arrow indicator that slides in on hover */}
                          <span
                            className={`font-mono text-sm sm:text-base transition-all duration-300 transform ${
                              isHovered || isTapped
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2"
                            }`}
                            style={{ color: category.accent }}
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </div>

                        {/* Mobile: Tap highlights row and expands note inline */}
                        {isTapped && (
                          <div
                            className="mt-2 pl-3 py-1 border-l-2 font-mono text-[11px] uppercase tracking-wider text-neutral-300 md:hidden animate-fadeIn"
                            style={{ borderColor: category.accent }}
                          >
                            <span className="text-white/60">
                              {category.title} {"//"}
                            </span>
                            <span>{skill.note}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marquee Strip at the Bottom */}
      <div className="w-full relative border-t border-b border-white/10 py-6 sm:py-8 overflow-hidden bg-black/40 backdrop-blur-sm select-none">
        <div
          ref={marqueeTrackRef}
          className="flex items-center gap-10 whitespace-nowrap will-change-transform"
        >
          {/* First set of marquee skill names */}
          <div className="flex items-center gap-10 shrink-0">
            {SKILLS_DATA.marqueeSkills.map((name, idx) => (
              <span
                key={`m1-${idx}`}
                className="font-anton uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight text-transparent select-none text-stroke-marquee hover:text-white transition-all duration-300 cursor-default"
              >
                {name}
                <span className="ml-10 text-white/20 select-none font-mono text-2xl">
                  /
                </span>
              </span>
            ))}
          </div>

          {/* Duplicated second set for seamless infinite loop */}
          <div className="flex items-center gap-10 shrink-0" aria-hidden="true">
            {SKILLS_DATA.marqueeSkills.map((name, idx) => (
              <span
                key={`m2-${idx}`}
                className="font-anton uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight text-transparent select-none text-stroke-marquee hover:text-white transition-all duration-300 cursor-default"
              >
                {name}
                <span className="ml-10 text-white/20 select-none font-mono text-2xl">
                  /
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cursor Tag (Desktop Only) */}
      <div
        ref={floatingTagRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 hidden lg:block ${
          hoveredSkill ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform, opacity" }}
        aria-hidden="true"
      >
        {hoveredSkill && (
          <div className="bg-[#121212]/95 border border-white/20 text-white font-mono text-[11px] px-3.5 py-2 rounded shadow-2xl backdrop-blur-md flex items-center gap-2.5 max-w-xs">
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: hoveredSkill.category.accent,
                boxShadow: `0 0 8px ${hoveredSkill.category.accent}`,
              }}
            />
            <span
              className="uppercase tracking-widest font-semibold shrink-0"
              style={{ color: hoveredSkill.category.accent }}
            >
              {hoveredSkill.category.title}
            </span>
            <span className="text-white/40">{"//"}</span>
            <span className="text-neutral-300 truncate">
              {hoveredSkill.skill.note}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
