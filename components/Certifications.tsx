"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CERTIFICATIONS } from "@/data/certifications";

// EMV Smart Chip SVG Glyph
function SmartChipGlyph() {
  return (
    <svg
      width="30"
      height="22"
      viewBox="0 0 30 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-80"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="29"
        height="21"
        rx="3.5"
        fill="#181818"
        stroke="#4a4a4a"
        strokeWidth="1"
      />
      <rect
        x="7.5"
        y="5"
        width="15"
        height="12"
        rx="1.5"
        stroke="#666666"
        strokeWidth="0.8"
      />
      <line x1="7.5" y1="11" x2="22.5" y2="11" stroke="#666666" strokeWidth="0.8" />
      <line x1="15" y1="0.5" x2="15" y2="5" stroke="#666666" strokeWidth="0.8" />
      <line x1="15" y1="17" x2="15" y2="21.5" stroke="#666666" strokeWidth="0.8" />
      <line x1="0.5" y1="11" x2="7.5" y2="11" stroke="#666666" strokeWidth="0.8" />
      <line x1="22.5" y1="11" x2="29.5" y2="11" stroke="#666666" strokeWidth="0.8" />
    </svg>
  );
}

// Geometric QR Code matrix pattern placeholder SVG
function QrMatrixGlyph() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-75"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="37"
        height="37"
        rx="4"
        fill="#0b0b0b"
        stroke="rgba(255,255,255,0.18)"
      />
      {/* Top-Left Finder */}
      <rect x="4" y="4" width="10" height="10" fill="none" stroke="white" strokeWidth="1.5" />
      <rect x="6.5" y="6.5" width="5" height="5" fill="white" />
      {/* Top-Right Finder */}
      <rect x="24" y="4" width="10" height="10" fill="none" stroke="white" strokeWidth="1.5" />
      <rect x="26.5" y="6.5" width="5" height="5" fill="white" />
      {/* Bottom-Left Finder */}
      <rect x="4" y="24" width="10" height="10" fill="none" stroke="white" strokeWidth="1.5" />
      <rect x="6.5" y="26.5" width="5" height="5" fill="white" />
      {/* Data Modules */}
      <rect x="17" y="5" width="3" height="3" fill="white" opacity="0.9" />
      <rect x="17" y="11" width="3" height="3" fill="white" opacity="0.6" />
      <rect x="17" y="17" width="3" height="3" fill="white" opacity="0.9" />
      <rect x="24" y="17" width="3" height="3" fill="white" opacity="0.75" />
      <rect x="30" y="22" width="3" height="3" fill="white" opacity="0.85" />
      <rect x="17" y="29" width="3" height="3" fill="white" opacity="0.7" />
      <rect x="23" y="29" width="3" height="3" fill="white" opacity="0.85" />
    </svg>
  );
}

// Initial stacked deck offsets at start of scrub
const STACK_OFFSETS = [
  { x: -14, y: -9, rot: -7, scale: 0.95 },
  { x: 10, y: 5, rot: 5, scale: 0.96 },
  { x: -7, y: -4, rot: -4, scale: 0.97 },
  { x: 12, y: 7, rot: 6, scale: 0.98 },
  { x: -8, y: -2, rot: -5, scale: 0.99 },
  { x: 0, y: 0, rot: 2, scale: 1.0 },
];

export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingContainerRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLHeadingElement>(null);
  const headingLine2Ref = useRef<HTMLHeadingElement>(null);
  const headerLabelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // References for desktop card motion wrappers (GSAP controlled)
  const cardMotionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Interactive states
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Holographic mouse coordinates & angles (per hovered card)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [foilAngle, setFoilAngle] = useState(135);
  const [tiltAngles, setTiltAngles] = useState({ rotateX: 0, rotateY: 0 });

  // Mobile active carousel card tracker
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);

  // Active accent color for dynamic soft ambient background glow
  const activeAccent = useMemo(() => {
    if (hoveredIdx !== null && CERTIFICATIONS[hoveredIdx]) {
      return CERTIFICATIONS[hoveredIdx].accent;
    }
    return null;
  }, [hoveredIdx]);

  // Toggle card flip
  const handleToggleFlip = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Desktop Mouse Move Handler for 3D Tilt, moving glare & rainbow foil
  const handleCardMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, idx: number, isCardFlipped: boolean) => {
      if (!isDesktop) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const py = Math.max(0, Math.min(100, (y / rect.height) * 100));
      const normX = x / rect.width - 0.5;
      const normY = y / rect.height - 0.5;

      setGlarePos({ x: px, y: py });
      setFoilAngle(Math.round(normX * 80 + normY * 80 + 135));

      // Milder tilt when flipped so details remain easy to read
      const maxTilt = isCardFlipped ? 8 : 18;
      setTiltAngles({
        rotateX: -normY * maxTilt,
        rotateY: normX * maxTilt,
      });
    },
    [isDesktop]
  );

  const handleCardMouseEnter = useCallback((idx: number) => {
    if (!isDesktop) return;
    setHoveredIdx(idx);
  }, [isDesktop]);

  const handleCardMouseLeave = useCallback(() => {
    if (!isDesktop) return;
    setHoveredIdx(null);
    setTiltAngles({ rotateX: 0, rotateY: 0 });
    setGlarePos({ x: 50, y: 50 });
  }, [isDesktop]);

  // Mobile carousel scroll tracker
  const handleMobileScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth * 0.82;
    const newIdx = Math.min(
      CERTIFICATIONS.length - 1,
      Math.max(0, Math.round(scrollLeft / (cardWidth + 16)))
    );
    setMobileActiveIdx(newIdx);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(desktopMedia.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    desktopMedia.addEventListener("change", handleMediaChange);

    const ctx = gsap.context(() => {
      // 1. Header mono label entrance
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

      // 2. Giant heading mask slide-up reveal
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

      // 3. Desktop Pinned Scroll Scene: Deck Fan-Out into Arc, then Settle in Clean Row
      if (desktopMedia.matches && !prefersReducedMotion && sectionRef.current) {
        const computeStepX = () => {
          const w = window.innerWidth;
          if (w >= 1600) return 240;
          if (w >= 1400) return 215;
          if (w >= 1200) return 190;
          return 165;
        };

        const stepX = computeStepX();
        const numCards = CERTIFICATIONS.length;
        const centerIndex = (numCards - 1) / 2; // 2.5 for 6 cards

        // Initial Pose: Stacked as a deck at center with small rotational jitter
        cardMotionRefs.current.forEach((ref, i) => {
          if (!ref) return;
          const initial = STACK_OFFSETS[i] || { x: 0, y: 0, rot: 0, scale: 1 };
          gsap.set(ref, {
            x: initial.x,
            y: initial.y,
            rotation: initial.rot,
            scale: initial.scale,
            zIndex: i + 1,
            transformOrigin: "50% 80%",
          });
        });

        // Scrubbed GSAP Timeline pinned to section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1.1,
            start: "top top",
            end: "+=2200",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              setIsAnimating(self.isActive);
            },
          },
        });

        // Choreography:
        // Cards fan out one by one into an arc (rotation, x, y, scale), then settle in a clean row
        CERTIFICATIONS.forEach((_, i) => {
          const ref = cardMotionRefs.current[i];
          if (!ref) return;

          const dist = i - centerIndex; // -2.5, -1.5, -0.5, 0.5, 1.5, 2.5
          const finalX = dist * stepX;
          const finalY = 0;
          const finalRot = 0;
          const finalScale = 1;

          // Arc geometry: curvature down on the sides and rotational fan
          const arcX = dist * stepX * 1.05;
          const arcY = Math.abs(dist) * 16;
          const arcRot = dist * 5.2; // -13deg to +13deg
          const arcScale = 1.02;

          // Fan-out timing sequenced one by one
          const fanStart = 0.2 + i * 0.45;
          const fanDuration = 2.4;
          const settleStart = 4.2 + i * 0.4;
          const settleDuration = 2.5;

          // Fan out into arc
          tl.to(
            ref,
            {
              x: arcX,
              y: arcY,
              rotation: arcRot,
              scale: arcScale,
              duration: fanDuration,
              ease: "power2.out",
            },
            fanStart
          );

          // Settle into clean horizontal row
          tl.to(
            ref,
            {
              x: finalX,
              y: finalY,
              rotation: finalRot,
              scale: finalScale,
              duration: settleDuration,
              ease: "power3.inOut",
            },
            settleStart
          );
        });

        // Let the settled clean row hold so the user can interact freely
        tl.to({}, { duration: 1.6 });
      }
    }, sectionRef);

    return () => {
      desktopMedia.removeEventListener("change", handleMediaChange);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certifications"
      className="relative w-full min-h-screen bg-[#0a0a0a] text-white py-20 lg:py-16 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/5 flex flex-col justify-between"
    >
      {/* 1. Background Technical Faint Grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Ambient Background Glow in Hovered Card's Accent Color */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700 ease-out"
        style={{
          background: activeAccent
            ? `radial-gradient(circle 750px at 50% 55%, ${activeAccent}25 0%, transparent 70%)`
            : "radial-gradient(circle 750px at 50% 55%, rgba(255,255,255,0.02) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="max-w-[1720px] mx-auto w-full relative z-10 flex flex-col justify-between h-full flex-1">
        {/* Top Header Label */}
        <div
          ref={headerLabelRef}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full animate-pulse transition-colors duration-500"
              style={{ backgroundColor: activeAccent || "#38bdf8" }}
            />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/90">
              (CERTIFICATIONS)
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              (06)
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            <span>CONTINUOUS ACCREDITATION</span>
            <span className="hidden md:inline text-white/20">{"//"}</span>
            <span className="hidden md:inline">W3C VERIFIABLE METRICS</span>
          </div>
        </div>

        {/* Giant Heading with Mask Slide-Up Reveal */}
        <div ref={headingContainerRef} className="mb-8 lg:mb-12">
          <div className="overflow-hidden">
            <h2
              ref={headingLine1Ref}
              className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white select-none leading-[0.95]"
            >
              PROOF /
            </h2>
          </div>
          <div className="overflow-hidden">
            <h2
              ref={headingLine2Ref}
              className="font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-transparent select-none leading-[0.95] text-stroke-editorial"
            >
              OF WORK
            </h2>
          </div>
        </div>

        {/* DESKTOP PINNED STAGE (min-width: 1024px) */}
        <div
          ref={stageRef}
          className="hidden lg:flex relative w-full h-[470px] xl:h-[500px] items-center justify-center my-auto"
        >
          {CERTIFICATIONS.map((card, idx) => {
            const isFlipped = Boolean(flippedCards[card.id]);
            const isHovered = hoveredIdx === idx;
            const isAnyHovered = hoveredIdx !== null;

            // Sibling Push & Dim logic:
            // Sibling cards dim and push slightly away from the hovered card
            let siblingTransform = "";
            let siblingOpacity = 1;

            if (isAnyHovered) {
              if (isHovered) {
                siblingOpacity = 1;
                siblingTransform = "scale(1.04)";
              } else {
                siblingOpacity = 0.32;
                const pushX = idx < hoveredIdx ? -16 : 16;
                siblingTransform = `translateX(${pushX}px) scale(0.96)`;
              }
            }

            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardMotionRefs.current[idx] = el;
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none"
                style={{
                  width: "235px",
                  height: "385px",
                  zIndex: isHovered ? 50 : 10 + idx,
                  willChange: isAnimating || isHovered ? "transform, opacity" : "auto",
                }}
                data-cursor="flip"
                onClick={(e) => handleToggleFlip(card.id, e)}
                onMouseEnter={() => handleCardMouseEnter(idx)}
                onMouseLeave={handleCardMouseLeave}
                onMouseMove={(e) => handleCardMouseMove(e, idx, isFlipped)}
              >
                {/* Sibling Push & Dim Transition Wrapper */}
                <div
                  className="w-full h-full transition-all duration-300 ease-out"
                  style={{
                    opacity: siblingOpacity,
                    transform: siblingTransform,
                  }}
                >
                  {/* 3D Tilt Wrapper */}
                  <div
                    className="w-full h-full [perspective:1200px]"
                    style={{
                      transform: isHovered
                        ? `perspective(1200px) rotateX(${tiltAngles.rotateX}deg) rotateY(${tiltAngles.rotateY}deg) translateZ(24px)`
                        : "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
                      transition: isHovered
                        ? "none"
                        : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* 3D Flip Inner Container */}
                    <div
                      className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.4,0.0,0.2,1)]"
                      style={{
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      {/* CARD FRONT FACE */}
                      <div
                        className="glass absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 [backface-visibility:hidden]"
                        style={{
                          borderColor: isHovered ? `${card.accent}88` : "rgba(255, 255, 255, 0.12)",
                          boxShadow: isHovered
                            ? `0 24px 50px -12px ${card.accent}40, 0 0 35px ${card.accent}20, inset 0 1px 1px rgba(255,255,255,0.3)`
                            : "0 12px 30px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* Moving Specular Glare */}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                          style={{
                            opacity: isHovered && !isFlipped ? 0.75 : 0,
                            background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`,
                            mixBlendMode: "overlay",
                          }}
                          aria-hidden="true"
                        />

                        {/* Holographic Rainbow Foil Gradient (color-dodge) */}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                          style={{
                            opacity: isHovered && !isFlipped ? 0.5 : 0,
                            background: `conic-gradient(from ${foilAngle}deg at ${glarePos.x}% ${glarePos.y}%, #ff0055 0%, #ff8800 14%, #ffdd00 28%, #00ffaa 42%, #00ccff 57%, #aa00ff 71%, #ff00aa 85%, #ff0055 100%)`,
                            mixBlendMode: "color-dodge",
                          }}
                          aria-hidden="true"
                        />

                        {/* Top Bar: Issuer in mono + Smart Chip Glyph */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold truncate max-w-[130px]">
                            {card.issuer}
                          </span>
                          <SmartChipGlyph />
                        </div>

                        {/* Center: Big Anton Certificate Title */}
                        <div className="my-auto py-2">
                          <h3 className="font-anton uppercase text-2xl xl:text-[26px] tracking-tight text-white leading-[1.05] line-clamp-3">
                            {card.title}
                          </h3>
                          <div
                            className="w-7 h-[2px] mt-2.5 rounded-full"
                            style={{ backgroundColor: card.accent }}
                          />
                        </div>

                        {/* Bottom Info: Year, Credential ID, QR Placeholder */}
                        <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            <span>ISSUED // {card.year}</span>
                            <span className="truncate max-w-[100px] text-neutral-500 text-[9px]">
                              {card.credentialId}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <QrMatrixGlyph />
                            <div className="flex flex-col items-end text-right font-mono">
                              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-neutral-300">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: card.accent }}
                                />
                                <span>VERIFIED</span>
                              </div>
                              <span className="text-[8px] tracking-[0.2em] text-neutral-600 mt-0.5">
                                CLICK TO FLIP ↺
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK FACE (rotateY 180) */}
                      <div
                        className="glass absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        style={{
                          borderColor: `${card.accent}66`,
                          boxShadow: `0 20px 45px -10px ${card.accent}30, inset 0 1px 1px rgba(255,255,255,0.2)`,
                        }}
                      >
                        {/* Top Header */}
                        <div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold truncate max-w-[140px]">
                              {card.issuer}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 hover:text-white transition-colors">
                              ↺ FLIP
                            </span>
                          </div>

                          <h4 className="font-anton uppercase text-lg tracking-tight text-white leading-tight line-clamp-2">
                            {card.title}
                          </h4>
                        </div>

                        {/* Middle: Details & Skills */}
                        <div className="my-auto py-1 flex flex-col gap-2.5 overflow-hidden">
                          <div>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 block mb-1">
                              WHAT IT COVERS //
                            </span>
                            <p className="font-sans text-[11px] text-neutral-300 leading-relaxed line-clamp-3">
                              {card.details}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 block mb-1.5">
                              SKILLS LEARNED //
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {card.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 border border-white/10 text-neutral-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Credential ID + Verify Link */}
                        <div className="pt-2.5 border-t border-white/10 flex flex-col gap-2">
                          <div className="font-mono text-[8px] uppercase tracking-wider text-neutral-500 truncate">
                            ID: {card.credentialId}
                          </div>

                          <a
                            href={card.verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="group/link flex items-center justify-between w-full px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all duration-300 border"
                            style={{
                              borderColor: `${card.accent}66`,
                              backgroundColor: `${card.accent}18`,
                            }}
                            data-cursor="hover"
                          >
                            <span className="font-bold text-white group-hover/link:underline">
                              VERIFY CREDENTIAL
                            </span>
                            <span
                              className="inline-block transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 font-bold"
                              style={{ color: card.accent }}
                            >
                              ↗
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE CAROUSEL (max-width: 1023px): No pin, horizontal swipe carousel with snap, tap to flip, no tilt */}
        <div className="lg:hidden w-full my-6">
          <div
            className="flex overflow-x-auto gap-5 snap-x snap-mandatory px-2 py-4 scrollbar-none will-change-scroll"
            onScroll={handleMobileScroll}
          >
            {CERTIFICATIONS.map((card) => {
              const isFlipped = Boolean(flippedCards[card.id]);

              return (
                <div
                  key={card.id}
                  className="snap-center shrink-0 w-[84vw] max-w-[320px] aspect-[1/1.55] cursor-pointer select-none"
                  data-cursor="flip"
                  onClick={() => handleToggleFlip(card.id)}
                >
                  {/* 3D Flip Container (no tilt on mobile) */}
                  <div
                    className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.4,0.0,0.2,1)]"
                    style={{
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className="glass absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] shadow-2xl"
                      style={{
                        borderColor: `${card.accent}55`,
                        boxShadow: `0 16px 40px -10px ${card.accent}25, inset 0 1px 0 rgba(255,255,255,0.1)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold truncate max-w-[170px]">
                          {card.issuer}
                        </span>
                        <SmartChipGlyph />
                      </div>

                      <div className="my-auto py-3">
                        <h3 className="font-anton uppercase text-3xl tracking-tight text-white leading-[1.05]">
                          {card.title}
                        </h3>
                        <div
                          className="w-8 h-[2px] mt-3 rounded-full"
                          style={{ backgroundColor: card.accent }}
                        />
                      </div>

                      <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400">
                          <span>ISSUED // {card.year}</span>
                          <span className="truncate max-w-[130px] text-neutral-500 text-[10px]">
                            {card.credentialId}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <QrMatrixGlyph />
                          <div className="flex flex-col items-end text-right font-mono">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-300">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: card.accent }}
                              />
                              <span>VERIFIED</span>
                            </div>
                            <span className="text-[9px] tracking-[0.2em] text-neutral-500 mt-1">
                              TAP TO FLIP ↺
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className="glass absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl"
                      style={{
                        borderColor: `${card.accent}66`,
                        boxShadow: `0 16px 40px -10px ${card.accent}30, inset 0 1px 1px rgba(255,255,255,0.2)`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold truncate max-w-[180px]">
                            {card.issuer}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                            ↺ TAP TO FLIP
                          </span>
                        </div>

                        <h4 className="font-anton uppercase text-xl tracking-tight text-white leading-tight">
                          {card.title}
                        </h4>
                      </div>

                      <div className="my-auto py-2 flex flex-col gap-3">
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                            WHAT IT COVERS //
                          </span>
                          <p className="font-sans text-xs text-neutral-300 leading-relaxed line-clamp-3">
                            {card.details}
                          </p>
                        </div>

                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 block mb-1.5">
                            SKILLS LEARNED //
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {card.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-neutral-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                        <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 truncate">
                          ID: {card.credentialId}
                        </div>

                        <a
                          href={card.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border transition-all duration-300"
                          style={{
                            borderColor: `${card.accent}66`,
                            backgroundColor: `${card.accent}18`,
                          }}
                        >
                          <span className="font-bold text-white">
                            VERIFY CREDENTIAL
                          </span>
                          <span className="font-bold" style={{ color: card.accent }}>
                            ↗
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Pagination Indicator */}
          <div className="flex items-center justify-between px-2 pt-4 border-t border-white/10 text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
            <span>
              CARD 0{mobileActiveIdx + 1} / 06
            </span>
            <span className="text-[10px] text-neutral-500">
              SWIPE HORIZONTALLY →
            </span>
          </div>
        </div>

        {/* Bottom Editorial Meta Bar (Desktop) */}
        <div className="hidden lg:flex items-center justify-between pt-6 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DECK STATUS: SCROLL TO FAN OUT & CLEAN ROW</span>
          </div>

          <div className="text-white/60">
            <span>HOVER FOR 3D TILT // CLICK TO FLIP DETAILS</span>
          </div>

          <div>
            <span style={{ color: activeAccent || "#ffffff" }}>
              ACTIVE ACCENT // {activeAccent ? "SYNCED" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
