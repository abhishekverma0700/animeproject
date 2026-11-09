"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  debouncedRefresh: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  debouncedRefresh: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

// Global debounced ScrollTrigger refresh to prevent layout thrashing
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
export function debouncedScrollTriggerRefresh(delay = 120) {
  if (typeof window === "undefined") return;
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, delay);
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Exactly one Lenis instance
    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.1 : 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.25,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Bind ScrollTrigger with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Sync GSAP ticker with Lenis requestAnimationFrame
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        debouncedRefresh: debouncedScrollTriggerRefresh,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
