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

export default function SynapseVisual({
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

    // Middle Layer Parallax: Agent Swarm (depth: +14px)
    if (middleLayerRef.current) {
      gsap.to(middleLayerRef.current, {
        x: xNorm * 16,
        y: yNorm * 16,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Foreground Layer Parallax: Telemetry Badges (depth: +26px)
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

  // Agent Swarm Nodes
  const nodes = [
    { id: "supervisor", name: "SUPERVISOR", x: 200, y: 150, r: 24, main: true },
    { id: "retriever", name: "RAG RETRIEVER", x: 80, y: 80, r: 16 },
    { id: "embedder", name: "VECTOR ENGINE", x: 320, y: 70, r: 16 },
    { id: "synthesizer", name: "SYNTHESIS", x: 90, y: 220, r: 16 },
    { id: "validator", name: "EVAL AGENT", x: 310, y: 230, r: 16 },
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

      {/* ================= LAYER 2: Middle Depth - Agent Swarm SVG ================= */}
      <div ref={middleLayerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 will-change-transform">
        <svg viewBox="0 0 400 300" className="w-full h-full p-4">
          <defs>
            <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Synaptic Connecting Lines between supervisor and sub-agents */}
          {nodes.slice(1).map((node, i) => (
            <g key={node.id}>
              {/* Connecting Arc Line with traveling dasharray */}
              <motion.line
                x1={nodes[0].x}
                y1={nodes[0].y}
                x2={node.x}
                y2={node.y}
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -16] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />

              {/* Pulsing Data Packets Traveling Along Synapse */}
              <motion.circle
                r="3.5"
                fill="#ffffff"
                filter="url(#purpleGlow)"
                animate={{
                  cx: [nodes[0].x, node.x],
                  cy: [nodes[0].y, node.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.2,
                  delay: i * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </g>
          ))}

          {/* Outer Mesh Connections between workers */}
          <line x1="80" y1="80" x2="320" y2="70" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="80" y1="80" x2="90" y2="220" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="320" y1="70" x2="310" y2="230" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="90" y1="220" x2="310" y2="230" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Agent Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              {/* Pulsing ring */}
              {node.main && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + 14}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Node Body */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={node.main ? "#7e22ce" : "#1e1b4b"}
                stroke={node.main ? "#e9d5ff" : "#c084fc"}
                strokeWidth={node.main ? "2.5" : "1.8"}
                filter="url(#purpleGlow)"
              />

              {/* Inner Node Core */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.main ? 8 : 4.5}
                fill="#ffffff"
              />

              {/* Label */}
              <text
                x={node.x}
                y={node.y + (node.main ? 38 : 26)}
                textAnchor="middle"
                fill="#e9d5ff"
                fontSize={node.main ? "9" : "8"}
                fontFamily="monospace"
                letterSpacing="0.15em"
                fontWeight={node.main ? "bold" : "normal"}
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* ================= LAYER 3: Foreground Depth - Telemetry Badges ================= */}
      <div ref={foregroundLayerRef} className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none z-20 will-change-transform">
        {/* Floating Telemetry Badge with LIVE Dot (Top Right) */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="self-end px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-purple-500/30 flex items-center gap-2 shadow-lg"
        >
          {/* Blinking LIVE dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>

          <span className="font-mono text-[10px] uppercase text-purple-300 font-semibold tracking-wider">
            <CountUp end={1240} decimals={0} /> AGENTS ONLINE
          </span>
        </motion.div>

        {/* Floating Telemetry Badge (Bottom Left) */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="self-start px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center gap-3 font-mono text-[10px] shadow-lg mb-8"
        >
          <span className="text-neutral-400">P99 RETRIEVAL:</span>
          <span className="text-purple-400 font-bold">
            <CountUp end={112} decimals={0} suffix="ms" />
          </span>
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
        <span className="text-purple-400 font-bold">↗</span>
      </div>
    </div>
  );
}
