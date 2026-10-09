"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, Project } from "@/data/projects";
import CaseStudyModal from "./CaseStudyModal";

// Number-roll counter for top-left header
function NumberRollCounter({
  activeIndex,
  total = 4,
}: {
  activeIndex: number;
  total?: number;
}) {
  return (
    <div className="flex items-center gap-1 font-mono text-xs md:text-sm tracking-[0.25em] text-neutral-400">
      <div className="h-5 overflow-hidden relative w-7">
        <div
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col"
          style={{ transform: `translateY(-${activeIndex * 1.25}rem)` }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className="h-5 flex items-center justify-start text-white font-bold"
            >
              0{i + 1}
            </span>
          ))}
        </div>
      </div>
      <span className="text-neutral-600"> / 0{total}</span>
    </div>
  );
}

interface ProjectPanelProps {
  project: Project;
  isActive: boolean;
  isRevealed: boolean;
  onOpenModal: (project: Project) => void;
}

function ProjectPanel({
  project,
  isActive,
  isRevealed,
  onOpenModal,
}: ProjectPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // 3D Card Perspective Tilt + Glare Highlight
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

    gsap.to(card, {
      rotateY: xNorm * 12,
      rotateX: -yNorm * 12,
      scale: 1.02,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 1000,
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <div
      className={`w-full lg:w-[85vw] xl:w-[78vw] max-w-[1440px] flex-shrink-0 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 px-6 md:px-12 lg:px-16 transition-all duration-700 ease-out ${
        isActive
          ? "lg:scale-100 lg:opacity-100 lg:blur-none"
          : "lg:scale-90 lg:opacity-50 lg:blur-[2px]"
      }`}
    >
      {/* Left: Info & Typography */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center">
        {/* Index & Role Badge */}
        <div className="flex items-baseline gap-4 mb-2">
          <span className="font-anton text-6xl md:text-8xl text-neutral-700 leading-none">
            {project.index}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            {"//"} CASE STUDY
          </span>
        </div>

        {/* Masked Title with Stagger Slide-Up */}
        <div className="overflow-hidden py-1">
          <h3
            className="font-anton uppercase tracking-[-0.02em] text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.92] text-white my-2 transition-transform duration-700 ease-out"
            style={{
              transform: isRevealed ? "translateY(0%)" : "translateY(115%)",
            }}
          >
            {project.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-neutral-400 font-sans text-sm md:text-base leading-relaxed max-w-lg mt-2 mb-6">
          {project.description}
        </p>

        {/* Tech Tags (Reactive Accent Color on Active Panel) */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-colors duration-500 border"
              style={{
                backgroundColor: isActive ? `${project.accent}14` : "rgba(255,255,255,0.04)",
                borderColor: isActive ? `${project.accent}45` : "rgba(255,255,255,0.1)",
                color: isActive ? project.accent : "#d4d4d4",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button & Case Study Trigger */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onOpenModal(project)}
            className="group inline-flex items-center gap-2.5 font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-white hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            data-cursor="hover"
          >
            <span className="border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
              VIEW CASE STUDY
            </span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Right: Interactive 3D Tilt Mockup Card with Inset Reveal & Glare */}
      <div className="w-full lg:w-7/12 flex justify-center items-center">
        <motion.div
          layoutId={`card-container-${project.index}`}
          ref={cardRef}
          onClick={() => onOpenModal(project)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-[16/10] max-h-[560px] rounded-2xl overflow-hidden border border-white/10 bg-[#121212] group cursor-pointer shadow-2xl transition-all"
          data-cursor="view"
          style={{
            willChange: isHovered ? "transform" : "auto",
          }}
        >
          {/* Inset Wipe Reveal Container */}
          <div
            className="relative w-full h-full overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              clipPath: isRevealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              transform: isRevealed ? "scale(1)" : "scale(1.2)",
            }}
          >
            {/* Base Mockup Image (Grayscale -> Color on hover) */}
            <Image
              src={project.image}
              alt={project.title}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 90vw, 50vw"
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered
                  ? "grayscale-0 contrast-100 brightness-100"
                  : "grayscale contrast-125 brightness-95"
              }`}
            />

            {/* Video preview swap if project.video exists */}
            {project.video && !videoError && isHovered && (
              <video
                src={project.video}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              />
            )}
          </div>

          {/* Glare Highlight Layer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22), transparent 60%)`,
              mixBlendMode: "overlay",
            }}
          />

          {/* Glass reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

          {/* Bottom Badge Tag */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span style={{ color: project.accent }}>{project.title}</span>
            <span>OPEN CASE STUDY ↗</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgTitleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [revealedPanels, setRevealedPanels] = useState<boolean[]>([
    true,
    false,
    false,
    false,
  ]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const activeProject = PROJECTS[activePanelIndex] || PROJECTS[0];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const track = trackRef.current;
    const bgTitle = bgTitleRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const getScrollAmount = () => track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Fill top-left section progress bar
            if (progressBarRef.current) {
              gsap.set(progressBarRef.current, { scaleX: p });
            }

            // Determine active project panel (0 to 3)
            const panelCount = PROJECTS.length;
            const currentIdx = Math.min(
              panelCount - 1,
              Math.floor(p * panelCount + 0.15)
            );
            setActivePanelIndex(currentIdx);

            // Trigger clip-path & title reveal for visited panels
            setRevealedPanels((prev) => {
              const updated = [...prev];
              for (let i = 0; i <= currentIdx; i++) {
                updated[i] = true;
              }
              return updated;
            });
          },
        },
      });

      // Parallax effect on giant background outlined project names
      if (bgTitle) {
        gsap.to(bgTitle, {
          x: () => -getScrollAmount() * 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scrub: 1,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
          },
        });
      }

      return () => {
        horizontalTween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Background outlined string
  const outlinedProjectsString =
    PROJECTS.map((p) => p.title).join(" • ") + " • ";

  return (
    <>
      <section
        ref={sectionRef}
        id="work"
        className="relative w-full min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden py-16 lg:py-0 lg:h-screen lg:flex lg:flex-col lg:justify-center select-none transition-colors duration-700"
      >
        {/* Dynamic Reactive Accent Background Glow */}
        <div
          className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ease-out -z-10"
          style={{
            backgroundColor: activeProject.accent,
            opacity: 0.12,
          }}
        />

        {/* Top Header / Progress Indicator */}
        <div className="absolute top-8 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-5">
            {/* Number-roll counter 01 / 04 */}
            <NumberRollCounter activeIndex={activePanelIndex} total={4} />

            {/* Section Progress Bar with Reactive Accent Color */}
            <div className="w-24 sm:w-36 md:w-48 h-[2px] bg-white/10 relative overflow-hidden hidden sm:block">
              <div
                ref={progressBarRef}
                className="w-full h-full origin-left will-change-transform transition-colors duration-500"
                style={{
                  transform: "scaleX(0)",
                  backgroundColor: activeProject.accent,
                }}
              />
            </div>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500 hidden md:block">
            ARCHIVE 2024 — 2026 {"//"} SCROLL HORIZONTALLY
          </div>
        </div>

        {/* Giant Parallax Background Title (Outlined Project Names, Opacity ~8%) */}
        <div
          ref={bgTitleRef}
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 left-0 whitespace-nowrap pointer-events-none select-none z-0 will-change-transform opacity-[0.08]"
        >
          <span
            className="font-anton uppercase text-[clamp(10rem,24vw,28rem)] leading-none tracking-tighter"
            style={{
              WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.45)",
              color: "transparent",
            }}
          >
            {outlinedProjectsString.repeat(3)}
          </span>
        </div>

        {/* Horizontal Track (or vertical stack on mobile) */}
        <div
          ref={trackRef}
          className="relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-32 w-full lg:w-max pt-16 lg:pt-0"
        >
          {/* Intro Panel */}
          <div className="w-full lg:w-[60vw] xl:w-[50vw] flex-shrink-0 flex flex-col justify-center px-6 md:px-12 lg:px-16 pt-8 lg:pt-0">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-neutral-500 mb-4">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>PORTFOLIO INDEX</span>
            </div>

            <h2 className="font-anton uppercase tracking-[-0.02em] text-[clamp(4.2rem,11.5vw,11.8rem)] leading-[0.84] text-transparent select-none">
              <span
                style={{
                  WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.75)",
                }}
              >
                SELECTED
              </span>
              <br />
              <span className="flex items-baseline gap-4">
                <span
                  style={{
                    WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.75)",
                  }}
                >
                  WORK
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-mono text-neutral-500 font-normal tracking-widest">
                  (04)
                </span>
              </span>
            </h2>

            <p className="mt-8 text-neutral-400 font-sans text-sm sm:text-base max-w-md leading-relaxed">
              Engineered scalable digital platforms, autonomous intelligence
              engines, and distributed high-throughput backends.
            </p>

            <div className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              <span>SCROLL TO EXPLORE</span>
              <span className="text-white">→</span>
            </div>
          </div>

          {/* 4 Project Panels */}
          {PROJECTS.map((project, idx) => (
            <ProjectPanel
              key={project.index}
              project={project}
              isActive={activePanelIndex === idx}
              isRevealed={revealedPanels[idx]}
              onOpenModal={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      </section>

      {/* Shared-Element Fullscreen Case Study Modal */}
      <CaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(p) => setSelectedProject(p)}
      />
    </>
  );
}
