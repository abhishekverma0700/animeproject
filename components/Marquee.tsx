"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSmoothScroll } from "./SmoothScroll";

const MARQUEE_ITEMS = [
  "NEXT.JS",
  "NESTJS",
  "POSTGRES",
  "AWS",
  "REDIS",
  "TYPESCRIPT",
  "DOCKER",
  "TAILWIND",
];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let currentX = 0;
    const baseSpeed = 0.06;

    const tickerCallback = () => {
      // Connect to Lenis smooth scroll velocity
      const velocity = Math.abs(lenisRef.current?.velocity || 0);
      const velocityBoost = Math.min(velocity * 0.03, 0.75);
      const speed = baseSpeed + velocityBoost;

      currentX -= speed;
      if (currentX <= -50) {
        currentX = 0;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentX}%, 0, 0)`;
      }
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  const marqueeString = MARQUEE_ITEMS.join(" • ") + " • ";

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden py-1.5 border-t border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm select-none pointer-events-none"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform w-max font-anton tracking-[0.2em] text-xs sm:text-sm uppercase"
        style={{
          WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)",
          color: "transparent",
        }}
      >
        <span className="px-4">{marqueeString.repeat(4)}</span>
        <span className="px-4">{marqueeString.repeat(4)}</span>
      </div>
    </div>
  );
}
