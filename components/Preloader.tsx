"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsDone(true);
      onComplete?.();
      return;
    }

    const counterObj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        onComplete?.();
      },
    });

    // Animate counter from 0 to 100 with editorial easing
    tl.to(counterObj, {
      val: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        const rounded = Math.floor(counterObj.val);
        if (counterRef.current) {
          counterRef.current.textContent =
            rounded < 10 ? `0${rounded}` : `${rounded}`;
        }
        if (progressLineRef.current) {
          progressLineRef.current.style.width = `${rounded}%`;
        }
      },
    })
      // Pause briefly at 100%
      .to({}, { duration: 0.15 })
      // Slide preloader curtain up and away
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
      });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#F5F3EE] text-[#111111] flex flex-col justify-between p-8 md:p-14 lg:p-20 select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center text-xs font-mono uppercase tracking-[0.28em] text-[#6B6B6B]">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
          <span>PORTFOLIO // ARCHITECTURE</span>
        </div>
        <span>VOL. 04 / 2026</span>
      </div>

      {/* Middle Counter */}
      <div className="my-auto flex flex-col items-start max-w-[1920px] w-full mx-auto">
        <div className="flex items-baseline font-anton text-[clamp(4.5rem,14vw,13rem)] leading-[0.8] tracking-tight text-[#111111]">
          <span ref={counterRef}>00</span>
          <span className="text-[#6B6B6B] text-[0.4em] font-sans font-light ml-2">
            %
          </span>
        </div>

        {/* Thin Loading Bar */}
        <div className="w-full max-w-md h-[1px] bg-[rgba(17,17,17,0.10)] mt-6 relative overflow-hidden">
          <div
            ref={progressLineRef}
            className="absolute left-0 top-0 bottom-0 bg-[#FF4D00] w-0 transition-all duration-75"
          />
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-[0.25em] text-[#6B6B6B]">
        <span>INITIALIZING INTERACTION ENGINE</span>
        <span>ABHISHEK STUDIO</span>
      </div>
    </div>
  );
}
