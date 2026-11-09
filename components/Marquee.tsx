"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const MARQUEE_ITEMS = [
  "NEXT.JS DEVELOPER",
  "NESTJS ENGINEER",
  "PROJECT MANAGER",
  "AI & LLM WORKFLOWS",
  "SYSTEM ARCHITECTURE",
  "FULL-STACK ENGINEERING",
  "TYPESCRIPT",
  "DISTRIBUTED SYSTEMS",
];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let xPos = 0;
    const speed = 0.55;

    const tickerCallback = () => {
      xPos -= speed;
      const trackWidth = track.scrollWidth / 2;
      if (Math.abs(xPos) >= trackWidth) {
        xPos = 0;
      }
      if (track) {
        track.style.transform = `translate3d(${xPos}px, 0, 0)`;
      }
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  const marqueeString = MARQUEE_ITEMS.join("  •  ") + "  •  ";

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden py-2 border-t border-[rgba(17,17,17,0.10)] bg-[#F5F3EE]/95 select-none pointer-events-none"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform w-max font-anton tracking-[0.2em] text-xs sm:text-sm uppercase text-stroke-marquee text-transparent select-none"
      >
        <span className="px-4">{marqueeString.repeat(4)}</span>
        <span className="px-4">{marqueeString.repeat(4)}</span>
      </div>
    </div>
  );
}
