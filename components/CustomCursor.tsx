"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Guard against touch devices and reduced-motion
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    setIsMounted(true);

    const cursor = cursorRef.current;
    if (!cursor) return;

    // GSAP quickTo for 120fps buttery smooth lerp follow
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);

      // Check if hovering project with data-cursor="view" or card with data-cursor="flip"
      const target = e.target as HTMLElement | null;
      if (target) {
        // Dynamic cursor-following gradient borders for .glass elements
        const glassTarget = target.closest(".glass") as HTMLElement | null;
        if (glassTarget) {
          const rect = glassTarget.getBoundingClientRect();
          glassTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          glassTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }

        const viewTarget = target.closest('[data-cursor="view"]');
        if (viewTarget) {
          setCursorText("VIEW");
          setIsHovered(true);
          return;
        }

        const interactiveChild = target.closest('a, button, [role="button"], input, textarea, select');
        const flipTarget = target.closest('[data-cursor="flip"]');

        if (flipTarget && !interactiveChild) {
          setCursorText("FLIP");
          setIsHovered(true);
          return;
        }

        const emailTarget = target.closest('[data-cursor="email"]');
        if (emailTarget && !interactiveChild) {
          setCursorText("EMAIL");
          setIsHovered(true);
          return;
        }

        const exploreTarget = target.closest('[data-cursor="explore"]');
        if (exploreTarget && !interactiveChild) {
          setCursorText("EXPLORE");
          setIsHovered(true);
          return;
        }

        const interactive = target.closest(
          'a, button, [role="button"], input, textarea, select, [data-cursor="hover"], [data-cursor="photo"], .cursor-pointer'
        );
        setCursorText(null);
        setIsHovered(!!interactive);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!isMounted) return null;

  const hasBadgeText = Boolean(cursorText);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 -ml-2 -mt-2 pointer-events-none z-[9999] mix-blend-difference will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        className="rounded-full bg-white transition-all duration-300 ease-out flex items-center justify-center overflow-hidden"
        style={{
          width: hasBadgeText ? "72px" : isHovered ? "52px" : "10px",
          height: hasBadgeText ? "72px" : isHovered ? "52px" : "10px",
          transform: hasBadgeText
            ? "translate(-31px, -31px)"
            : isHovered
            ? "translate(-21px, -21px)"
            : "translate(0px, 0px)",
          opacity: 1,
        }}
      >
        {cursorText && (
          <span className="font-mono text-[10px] font-bold tracking-widest text-black uppercase select-none animate-in fade-in duration-200">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
