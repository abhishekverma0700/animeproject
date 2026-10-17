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

export default function InjuryConnectVisual({
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

    // Middle Layer Parallax: Norbu Logo (depth: +14px)
    if (middleLayerRef.current) {
      gsap.to(middleLayerRef.current, {
        x: xNorm * 16,
        y: yNorm * 16,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Foreground Layer Parallax: Floating UI Cards (depth: +26px)
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
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(${project.accent} 1px, transparent 1px), linear-gradient(90deg, ${project.accent} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ================= LAYER 2: Middle Depth - Norbu Animated SVG Logo ================= */}
      <div ref={middleLayerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 will-change-transform">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full drop-shadow-[0_0_24px_rgba(56,189,248,0.45)]"
          >
            <defs>
              <linearGradient id="norbuStrokeGrad2" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Outer Hexagon with Drawing Motion */}
            <motion.path
              d="M80 18 L134 49 L134 111 L80 142 L26 111 L26 49 Z"
              stroke="url(#norbuStrokeGrad2)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(56, 189, 248, 0.04)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />

            {/* Inner Medical Cross */}
            <motion.path
              d="M80 38 L80 122"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
            />
            <motion.path
              d="M38 80 L122 80"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
            />

            {/* Diamond Core */}
            <motion.path
              d="M80 50 L110 80 L80 110 L50 80 Z"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.06)"
              initial={{ pathLength: 0, scale: 0.8 }}
              animate={{ pathLength: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            />

            {/* Pulsing Core Node */}
            <motion.circle
              cx="80"
              cy="80"
              r="4.5"
              fill="#ffffff"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="80" cy="18" r="3" fill="#38bdf8" />
            <circle cx="134" cy="49" r="3" fill="#38bdf8" />
            <circle cx="134" cy="111" r="3" fill="#38bdf8" />
            <circle cx="80" cy="142" r="3" fill="#38bdf8" />
            <circle cx="26" cy="111" r="3" fill="#38bdf8" />
            <circle cx="26" cy="49" r="3" fill="#38bdf8" />
          </svg>

          {/* Core Logo Label */}
          <span className="absolute -bottom-6 font-mono text-[9px] tracking-[0.3em] uppercase text-sky-400 font-semibold">
            NORBU // CLINICAL
          </span>
        </div>
      </div>

      {/* ================= LAYER 3: Foreground Depth - Floating Glass UI Cards ================= */}
      <div ref={foregroundLayerRef} className="absolute inset-0 pointer-events-none z-20 will-change-transform">
        {/* Card 1: Case Chat (Top Left) */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-4 w-48 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[9px] uppercase text-neutral-300 font-semibold tracking-wider">
                Case #4829
              </span>
            </div>
            <span className="font-mono text-[8px] text-neutral-500">LIVE WS</span>
          </div>
          <p className="font-sans text-[10px] text-neutral-300 leading-tight">
            &quot;Dr. Vance verified spine MRI. Records attached.&quot;
          </p>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[8px] text-sky-400">
            <span>HIPAA AUDITED</span>
            <span>
              <CountUp end={99.4} decimals={1} suffix="%" /> MATCH
            </span>
          </div>
        </motion.div>

        {/* Card 2: Document Upload & OCR (Bottom Left) */}
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="absolute bottom-4 left-4 w-48 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-mono text-[9px] text-sky-400 font-bold">
              PDF
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-mono text-[9px] text-white truncate">
                Orthopedic_09.pdf
              </p>
              <span className="font-mono text-[8px] text-neutral-400">
                OCR: <CountUp end={100} decimals={0} suffix="%" />
              </span>
            </div>
          </div>
          <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "30%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-sky-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Card 3: Clinical Score (Top Right) */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute top-4 right-4 w-36 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-sky-500/30 shadow-xl"
        >
          <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-400 block mb-0.5">
            Injury Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-anton text-2xl text-sky-400">
              <CountUp end={94} decimals={0} />
            </span>
            <span className="font-mono text-[10px] text-neutral-400">/ 100</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 font-mono text-[8px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>pgvector matched</span>
          </div>
        </motion.div>
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
        <span className="text-sky-400 font-bold">↗</span>
      </div>
    </div>
  );
}
