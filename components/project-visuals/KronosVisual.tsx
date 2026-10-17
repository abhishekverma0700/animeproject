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

export default function KronosVisual({
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

    // Middle Layer Parallax: Equalizer Bars (depth: +14px)
    if (middleLayerRef.current) {
      gsap.to(middleLayerRef.current, {
        x: xNorm * 16,
        y: yNorm * 16,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Foreground Layer Parallax: Tickers & Badges (depth: +26px)
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

  // 20 Streaming Bars with varying heights & durations
  const barConfigs = [
    { base: 35, max: 85, dur: 1.1 },
    { base: 45, max: 95, dur: 0.9 },
    { base: 20, max: 60, dur: 1.4 },
    { base: 60, max: 90, dur: 0.8 },
    { base: 40, max: 75, dur: 1.2 },
    { base: 75, max: 100, dur: 0.7 },
    { base: 30, max: 80, dur: 1.3 },
    { base: 55, max: 92, dur: 0.85 },
    { base: 65, max: 98, dur: 0.75 },
    { base: 25, max: 70, dur: 1.15 },
    { base: 80, max: 100, dur: 0.65 },
    { base: 45, max: 85, dur: 1.0 },
    { base: 70, max: 95, dur: 0.9 },
    { base: 30, max: 65, dur: 1.2 },
    { base: 85, max: 100, dur: 0.7 },
    { base: 40, max: 78, dur: 1.1 },
    { base: 60, max: 92, dur: 0.8 },
    { base: 50, max: 88, dur: 0.95 },
    { base: 75, max: 96, dur: 0.75 },
    { base: 35, max: 70, dur: 1.3 },
  ];

  return (
    <div
      ref={cardRef}
      onClick={() => onOpenModal(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="view"
      className="relative w-full max-w-[450px] xl:max-w-[490px] aspect-[4/3] rounded-2xl bg-[#0d0d0d] border border-white/10 overflow-hidden cursor-pointer group shadow-2xl transition-all select-none"
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
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(${project.accent} 1px, transparent 1px), linear-gradient(90deg, ${project.accent} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ================= LAYER 2: Middle Depth - Streaming Equalizer Bars ================= */}
      <div ref={middleLayerRef} className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none z-10 will-change-transform">
        {/* Metric Header with Blinking LIVE Dot */}
        <div className="w-full max-w-[390px] flex items-center justify-between font-mono text-[11px] mb-3 text-neutral-400">
          <div className="flex items-center gap-2.5">
            {/* Blinking LIVE dot */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[9px] font-bold text-emerald-400 tracking-wider">LIVE</span>
            </div>

            <span className="text-emerald-400 font-bold tracking-wider">
              <CountUp end={120000} decimals={0} /> TX / SEC
            </span>
          </div>
          <span className="tracking-widest text-neutral-500 text-[10px]">
            KAFKA // INGEST
          </span>
        </div>

        {/* Dynamic Equalizer Streaming Bars Container */}
        <div className="w-full max-w-[390px] h-32 flex items-end justify-between gap-1.5 px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/20 backdrop-blur-md">
          {barConfigs.map((bar, idx) => (
            <div key={idx} className="flex-1 h-full flex items-end">
              <motion.div
                className="w-full rounded-t-sm"
                style={{
                  background: `linear-gradient(to top, rgba(16, 185, 129, 0.2), #10b981)`,
                  boxShadow: `0 0 10px rgba(16, 185, 129, 0.4)`,
                }}
                animate={{
                  height: [`${bar.base}%`, `${bar.max}%`, `${bar.base}%`],
                }}
                transition={{
                  duration: bar.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (idx % 4) * 0.15,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= LAYER 3: Foreground Depth - Telemetry Ticker & Floating Badges ================= */}
      <div ref={foregroundLayerRef} className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none z-20 will-change-transform">
        {/* Floating Status Pill (Top Left) */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          className="self-start px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-500/30 flex items-center gap-2 shadow-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] uppercase text-emerald-300 font-semibold tracking-wider">
            64 Distributed Regions
          </span>
        </motion.div>

        {/* Bottom Telemetry Ticker with Count-Up */}
        <div className="w-full max-w-[390px] flex items-center justify-between font-mono text-[9px] text-neutral-400 border-t border-white/10 pt-2.5 pb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">P99:</span>
            <span className="text-emerald-400 font-bold">
              <CountUp end={1.8} decimals={1} suffix="ms" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">DRIFT:</span>
            <span className="text-emerald-400 font-bold">0.00%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">UPTIME:</span>
            <span className="text-white font-bold">
              <CountUp end={99.999} decimals={3} suffix="%" />
            </span>
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
        <span className="text-emerald-400 font-bold">↗</span>
      </div>
    </div>
  );
}
