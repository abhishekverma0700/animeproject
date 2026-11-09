"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface PerformanceContextType {
  isLowEnd: boolean;
  isLiteMode: boolean;
  activeCanvas: "hero" | "skills" | null;
  requestActiveCanvas: (id: "hero" | "skills") => boolean;
  releaseActiveCanvas: (id: "hero" | "skills") => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowEnd: false,
  isLiteMode: false,
  activeCanvas: null,
  requestActiveCanvas: () => true,
  releaseActiveCanvas: () => {},
});

export const usePerformance = () => useContext(PerformanceContext);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [activeCanvas, setActiveCanvasState] = useState<"hero" | "skills" | null>("hero");

  const activeCanvasRef = useRef<"hero" | "skills" | null>("hero");

  // Detection of hardware constraints & sustained FPS
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const concurrency = nav.hardwareConcurrency || 8;
    const memory = nav.deviceMemory || 8;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hardwareLow = concurrency <= 4 || memory <= 4;
    if (hardwareLow || prefersReducedMotion) {
      setIsLowEnd(true);
      setIsLiteMode(true);
      document.documentElement.classList.add("lite-mode");
      return;
    }

    // Monitor sustained FPS over first 5 seconds
    const frameTimes: number[] = [];
    let lastTime = performance.now();
    let animId: number;
    const sampleStart = performance.now();

    const monitorFps = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      if (delta > 0) {
        frameTimes.push(1000 / delta);
      }

      // Sample for 4 seconds
      if (now - sampleStart < 4000) {
        animId = requestAnimationFrame(monitorFps);
      } else {
        if (frameTimes.length > 30) {
          const avgFps = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          if (avgFps < 40) {
            setIsLowEnd(true);
            setIsLiteMode(true);
            document.documentElement.classList.add("lite-mode");
          }
        }
      }
    };

    animId = requestAnimationFrame(monitorFps);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const requestActiveCanvas = useCallback((id: "hero" | "skills") => {
    // Only one canvas may be active at any given time
    if (activeCanvasRef.current === id) return true;
    activeCanvasRef.current = id;
    setActiveCanvasState(id);
    return true;
  }, []);

  const releaseActiveCanvas = useCallback((id: "hero" | "skills") => {
    if (activeCanvasRef.current === id) {
      activeCanvasRef.current = null;
      setActiveCanvasState(null);
    }
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        isLowEnd,
        isLiteMode,
        activeCanvas,
        requestActiveCanvas,
        releaseActiveCanvas,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}
