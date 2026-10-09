"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Project, PROJECTS } from "@/data/projects";
import { useSmoothScroll } from "./SmoothScroll";

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

// Count-up animation for outcome statistics
function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * easeProgress;
      setDisplayValue(Number(current.toFixed(value % 1 === 0 ? 0 : 1)));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export default function CaseStudyModal({
  project,
  onClose,
  onSelectProject,
}: CaseStudyModalProps) {
  const { lenis } = useSmoothScroll();

  // Pause Lenis smooth scroll while case study modal is open
  useEffect(() => {
    if (project) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      lenis?.start();
      document.body.style.overflow = "auto";
    };
  }, [project, lenis, onClose]);

  if (!project) return null;

  const currentIndex = PROJECTS.findIndex((p) => p.index === project.index);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-2xl overflow-y-auto text-white"
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 left-0 right-0 z-20 px-6 py-6 md:px-12 md:py-8 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
            data-cursor="hover"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            <span>BACK // CLOSE [ESC]</span>
          </button>

          <div className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 hidden sm:block">
            CASE STUDY [{project.index} / 04]
          </div>

          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-white hover:text-white transition-colors"
            data-cursor="hover"
            style={{ color: project.accent }}
          >
            <span>LIVE DEMO</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </header>

        {/* Modal Main Content Container */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
          {/* Hero Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: project.accent }}
              />
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-neutral-400">
                {project.role}
              </span>
            </div>

            <h1 className="font-anton uppercase tracking-[-0.02em] text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.88] text-white my-2">
              {project.title}
            </h1>

            <p className="text-neutral-300 font-sans text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed mt-2">
              {project.description}
            </p>
          </div>

          {/* Primary Featured Image Mockup */}
          <motion.div
            layoutId={`card-image-${project.index}`}
            className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#121212] shadow-2xl"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Outcome Numbers (Count-Up Animation) */}
          <section className="flex flex-col gap-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {"//"} QUANTIFIABLE OUTCOMES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {project.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 md:p-8 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">
                    {stat.label}
                  </span>
                  <div
                    className="font-anton text-4xl sm:text-5xl md:text-6xl tracking-tight"
                    style={{ color: project.accent }}
                  >
                    <CountUpNumber
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Features Grid */}
          <section className="flex flex-col gap-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {"//"} ARCHITECTURAL HIGHLIGHTS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.features.map((feature, i) => (
                <div
                  key={i}
                  className="p-6 md:p-8 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-6"
                >
                  <span className="font-mono text-xs tracking-widest text-neutral-500">
                    0{i + 1}
                  </span>
                  <p className="font-sans text-sm md:text-base leading-relaxed text-neutral-300">
                    {feature}
                  </p>
                  <div
                    className="h-1 w-8 rounded-full"
                    style={{ backgroundColor: project.accent }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section className="flex flex-col gap-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {"//"} CORE TECHNOLOGY STACK
            </h3>

            <div className="flex flex-wrap gap-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider border transition-colors"
                  style={{
                    backgroundColor: `${project.accent}14`,
                    borderColor: `${project.accent}40`,
                    color: project.accent,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Secondary Image Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                {"//"} SYSTEM TELEMETRY & WORKFLOW PREVIEWS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.gallery.slice(1).map((imgSrc, i) => (
                  <div
                    key={i}
                    className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-[#121212]"
                  >
                    <Image
                      src={imgSrc}
                      alt={`${project.title} Preview ${i + 1}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Next Project Footer Switcher */}
          <footer className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-16">
            <button
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              ← RETURN TO PROJECTS INDEX
            </button>

            <button
              onClick={() => onSelectProject(nextProject)}
              className="group flex items-baseline gap-4 text-left cursor-pointer focus:outline-none bg-transparent border-none"
              data-cursor="hover"
            >
              <div className="flex flex-col items-end">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  NEXT CASE STUDY
                </span>
                <span className="font-anton text-3xl sm:text-4xl text-white group-hover:text-white/80 transition-colors uppercase">
                  {nextProject.title} →
                </span>
              </div>
            </button>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
