"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Project } from "@/data/projects";
import CountUp from "./CountUp";

interface VisualProps {
  project: Project;
  onOpenModal: (project: Project) => void;
}

export default function VoxMetricVisual({
  project,
  onOpenModal,
}: VisualProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const middleLayerRef = useRef<HTMLDivElement>(null);
  const foregroundLayerRef = useRef<HTMLDivElement>(null);

  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse-based 3D tilt + internal parallax layers at different depths
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
    const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });

    // 3D Card Tilt
    gsap.to(card, {
      rotateY: xNorm * 14,
      rotateX: -yNorm * 14,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 1000,
      overwrite: "auto",
    });

    // Background Layer Parallax (depth: -8px)
    if (bgLayerRef.current) {
      gsap.to(bgLayerRef.current, {
        x: -xNorm * 10,
        y: -yNorm * 10,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Middle Layer Parallax: Chart (depth: +14px)
    if (middleLayerRef.current) {
      gsap.to(middleLayerRef.current, {
        x: xNorm * 16,
        y: yNorm * 16,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Foreground Layer Parallax: Trace Card & Badges (depth: +26px)
    if (foregroundLayerRef.current) {
      gsap.to(foregroundLayerRef.current, {
        x: xNorm * 28,
        y: yNorm * 28,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (bgLayerRef.current) {
      gsap.to(bgLayerRef.current, { x: 0, y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
    }
    if (middleLayerRef.current) {
      gsap.to(middleLayerRef.current, { x: 0, y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
    }
    if (foregroundLayerRef.current) {
      gsap.to(foregroundLayerRef.current, { x: 0, y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onOpenModal(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="view"
      className="glass relative w-full max-w-[450px] xl:max-w-[490px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl transition-all select-none"
      style={{
        boxShadow: isHovered
          ? `0 20px 60px -15px ${project.accent}35, 0 0 40px -10px ${project.accent}20`
          : `0 10px 40px -20px ${project.accent}15`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* ================= LAYER 1: Deep Background Glow & Grid ================= */}
      <div ref={bgLayerRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle 320px at 50% 50%, ${project.accent}22, transparent 70%)`,
            opacity: isHovered ? 1 : 0.6,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(${project.accent} 1px, transparent 1px), linear-gradient(90deg, ${project.accent} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ================= LAYER 2: Middle Depth - Continuous Live Drawing Chart ================= */}
      <div ref={middleLayerRef} className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none z-10 will-change-transform">
        {/* Header Telemetry with Blinking LIVE Dot & Count-Up */}
        <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-2.5">
            {/* Blinking LIVE indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="font-mono text-[9px] font-bold text-amber-400 tracking-wider">LIVE</span>
            </div>

            <span className="text-amber-400 font-bold tracking-wider">
              <CountUp end={2.4} decimals={1} suffix="B" /> TRACES / DAY
            </span>
          </div>
          <span className="tracking-widest text-neutral-500 text-[10px]">
            OTEL // 60FPS
          </span>
        </div>

        {/* Live Multi-Line Latency Oscilloscope with Continuous Loop Stroke Drawing */}
        <div className="relative w-full h-28 my-1">
          <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
            {/* Grid Horizon Lines */}
            <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

            {/* Secondary Cyan Trace (Undulating & Drawing) */}
            <motion.path
              d="M0,80 Q50,40 100,75 T200,50 T300,65 T400,45"
              fill="none"
              stroke="rgba(56,189,248,0.5)"
              strokeWidth="1.8"
              strokeDasharray="12 4"
              animate={{
                strokeDashoffset: [0, -32],
                d: [
                  "M0,80 Q50,40 100,75 T200,50 T300,65 T400,45",
                  "M0,65 Q50,85 100,50 T200,75 T300,40 T400,60",
                  "M0,80 Q50,40 100,75 T200,50 T300,65 T400,45",
                ],
              }}
              transition={{
                strokeDashoffset: { duration: 1.8, repeat: Infinity, ease: "linear" },
                d: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            {/* Primary Amber Live Wave Path (Loop Drawing with Dynamic Pulse) */}
            <motion.path
              d="M0,60 Q50,90 100,40 T200,70 T300,30 T400,65"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.8"
              strokeDasharray="24 6"
              animate={{
                strokeDashoffset: [0, -60],
                d: [
                  "M0,60 Q50,90 100,40 T200,70 T300,30 T400,65",
                  "M0,45 Q50,30 100,80 T200,40 T300,75 T400,35",
                  "M0,60 Q50,90 100,40 T200,70 T300,30 T400,65",
                ],
              }}
              transition={{
                strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                d: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            {/* Pulsing Active Trace Point */}
            <motion.circle
              cx="300"
              cy="30"
              r="4.5"
              fill="#ffffff"
              stroke="#f59e0b"
              strokeWidth="2"
              animate={{ scale: [1, 1.45, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </svg>
        </div>

        {/* Empty placeholder to balance flex-between */}
        <div className="h-16" />
      </div>

      {/* ================= LAYER 3: Foreground Depth - Floating Trace Card & Badges ================= */}
      <div ref={foregroundLayerRef} className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none z-20 will-change-transform">
        {/* Distributed Trace Flamegraph Card with Count-Up Numbers */}
        <div className="w-full p-2.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between font-mono text-[9px] text-neutral-400">
            <span>DISTRIBUTED SPAN TRACE</span>
            <span className="text-amber-400 font-bold">&lt; 0.1% ANOMALY</span>
          </div>

          {/* Span 1 */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-neutral-300">GET /v2/analytics/traces</span>
              <span className="text-amber-400 font-bold">
                <CountUp end={14.2} decimals={1} suffix="ms" />
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="w-full h-full bg-amber-400 rounded-full" />
            </div>
          </div>

          {/* Span 2 (Sub-query) */}
          <div className="space-y-1 pl-4">
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-neutral-400">↳ ClickHouse Parquet Scan</span>
              <span className="text-emerald-400 font-bold">
                <CountUp end={4.1} decimals={1} suffix="ms" />
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
              <div className="w-[32%] h-full bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Glare Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.18), transparent 60%)`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Bottom-Right Badge inside the card with padding */}
      <div className="absolute bottom-4 right-5 z-30 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-300 group-hover:text-white transition-all shadow-md pointer-events-none">
        <span>CLICK TO INSPECT</span>
        <span className="text-amber-400 font-bold">↗</span>
      </div>
    </div>
  );
}
