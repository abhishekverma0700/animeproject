"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

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

    const cursor = cursorRef.current;
    const badge = badgeRef.current;
    const textEl = textRef.current;
    if (!cursor || !badge) return;

    // GSAP quickTo for buttery smooth 120fps follow
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });

    let isVisible = false;
    let currentMode: "normal" | "hover" | "badge" = "normal";
    let currentText = "";

    const setCursorState = (mode: "normal" | "hover" | "badge", text: string | null = null) => {
      if (mode === currentMode && text === currentText) return;
      currentMode = mode;
      currentText = text || "";

      if (mode === "badge" && text) {
        badge.style.width = "72px";
        badge.style.height = "72px";
        badge.style.transform = "translate(-31px, -31px)";
        badge.style.backgroundColor = "#FFFFFF";
        badge.style.border = "1px solid rgba(17, 17, 17, 0.12)";
        badge.style.boxShadow = "0 8px 24px rgba(17, 17, 17, 0.10)";
        if (textEl) {
          textEl.textContent = text;
          textEl.style.display = "inline";
          textEl.style.color = "#111111";
        }
      } else if (mode === "hover") {
        badge.style.width = "40px";
        badge.style.height = "40px";
        badge.style.transform = "translate(-15px, -15px)";
        badge.style.backgroundColor = "transparent";
        badge.style.border = "1.5px solid rgba(17, 17, 17, 0.35)";
        badge.style.boxShadow = "none";
        if (textEl) {
          textEl.textContent = "";
          textEl.style.display = "none";
        }
      } else {
        badge.style.width = "10px";
        badge.style.height = "10px";
        badge.style.transform = "translate(0px, 0px)";
        badge.style.backgroundColor = "#111111";
        badge.style.border = "none";
        badge.style.boxShadow = "none";
        if (textEl) {
          textEl.textContent = "";
          textEl.style.display = "none";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = "1";
      }

      xTo(e.clientX);
      yTo(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const viewTarget = target.closest('[data-cursor="view"]');
      if (viewTarget) {
        setCursorState("badge", "VIEW");
        return;
      }

      const interactiveChild = target.closest(
        'a, button, [role="button"], input, textarea, select'
      );

      const flipTarget = target.closest('[data-cursor="flip"]');
      if (flipTarget && !interactiveChild) {
        setCursorState("badge", "FLIP");
        return;
      }

      const emailTarget = target.closest('[data-cursor="email"]');
      if (emailTarget && !interactiveChild) {
        setCursorState("badge", "EMAIL");
        return;
      }

      const exploreTarget = target.closest('[data-cursor="explore"]');
      if (exploreTarget && !interactiveChild) {
        setCursorState("badge", "EXPLORE");
        return;
      }

      const interactive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"], [data-cursor="photo"], .cursor-pointer'
      );

      if (interactive) {
        setCursorState("hover");
      } else {
        setCursorState("normal");
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      cursor.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      cursor.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 -ml-2 -mt-2 pointer-events-none z-[9999] opacity-0 transition-opacity duration-200"
    >
      <div
        ref={badgeRef}
        className="rounded-full bg-[#111111] flex items-center justify-center overflow-hidden transition-[width,height,transform] duration-200 ease-out"
        style={{
          width: "10px",
          height: "10px",
          transform: "translate(0px, 0px)",
        }}
      >
        <span
          ref={textRef}
          style={{ display: "none" }}
          className="font-mono text-[10px] font-bold tracking-widest text-[#111111] uppercase select-none"
        />
      </div>
    </div>
  );
}
