"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { LiveProject } from "@/data/projects";

interface GlassMockBrowserProps {
  project: LiveProject;
  isActive: boolean;
  onOpenModal?: (p: LiveProject) => void;
}

export default function GlassMockBrowser({
  project,
  isActive,
  onOpenModal,
}: GlassMockBrowserProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [viewMode, setViewMode] = useState<"auto" | "screenshot">("auto");
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  // Lazy-load iframe only when this slide becomes active
  useEffect(() => {
    if (isActive && !hasStartedLoading) {
      setHasStartedLoading(true);
    }
  }, [isActive, hasStartedLoading]);

  // Reset interactive state when slide changes
  useEffect(() => {
    if (!isActive) {
      setIsInteractive(false);
    }
  }, [isActive]);

  // Extract clean domain from liveUrl
  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url.replace(/^https?:\/\//, "").split("/")[0] || "preview.dev";
    }
  };

  const domain = getDomain(project.liveUrl);

  // 3D Tilt Effect on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 1200,
      overwrite: "auto",
    });

    if (glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle 350px at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 75%)`;
    }

    // Set cursor variables for .glass animated border
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });

    if (glareRef.current) {
      glareRef.current.style.background = "none";
    }

    // Leaving container resets interactive lock so user can smoothly scroll page again
    setIsInteractive(false);
  };

  const thumbnailSrc =
    project.thumbnail ||
    (project.liveUrl
      ? `https://image.thum.io/get/width/1200/${project.liveUrl}`
      : "/placeholder.png");

  // Determine whether to display the live iframe or the screenshot fallback
  const showIframe =
    hasStartedLoading &&
    !iframeError &&
    viewMode !== "screenshot" &&
    project.liveUrl &&
    project.status !== "COMING SOON";

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[620px] xl:max-w-[680px] perspective-[1400px] select-none"
    >
      {/* Outer ambient glow colored by project accent */}
      <div
        className="absolute -inset-2 rounded-[28px] opacity-40 blur-2xl pointer-events-none transition-all duration-700 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${project.accent}55 0%, transparent 75%)`,
        }}
      />

      {/* 3D Tilt Card Shell */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass relative w-full aspect-[16/10.5] sm:aspect-[16/10] rounded-[22px] overflow-hidden flex flex-col border border-white/15 bg-neutral-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.65)] will-change-transform transform-gpu transition-shadow duration-500 hover:shadow-[0_25px_65px_rgba(0,0,0,0.85)]"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dynamic Specular Glare Overlay */}
        <div
          ref={glareRef}
          className="absolute inset-0 z-30 pointer-events-none rounded-[22px] transition-opacity duration-300"
        />

        {/* =========================================================================
            BROWSER WINDOW HEADER (Traffic-light dots + Domain bar + Controls)
            ========================================================================= */}
        <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_6px_rgba(255,95,86,0.5)] transition-transform duration-200 hover:scale-110"
              title="Close"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_6px_rgba(255,189,46,0.5)] transition-transform duration-200 hover:scale-110"
              title="Minimize"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_6px_rgba(39,201,63,0.5)] transition-transform duration-200 hover:scale-110"
              title="Maximize"
            />
          </div>

          {/* Centered URL Address Bar */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] mx-3">
            <div className="glass !rounded-full px-3 py-1 flex items-center justify-between text-[11px] sm:text-xs font-mono text-neutral-300 border border-white/10 bg-black/40 truncate shadow-inner">
              <div className="flex items-center gap-1.5 truncate">
                {/* Green Padlock Icon */}
                <svg
                  className="w-3 h-3 flex-shrink-0 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate text-neutral-200 font-medium">
                  {domain}
                </span>
              </div>

              {/* Status / Live indicator */}
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: project.accent }}
                />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: project.accent }}
                >
                  SSL
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher (Live vs Screenshot) */}
            <button
              onClick={() =>
                setViewMode((prev) => (prev === "screenshot" ? "auto" : "screenshot"))
              }
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Live Webview / HD Screenshot"
            >
              <span>{viewMode === "screenshot" ? "HD SHOT" : "LIVE"}</span>
            </button>

            {/* Visit Live External Link */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Open live site in new tab"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* =========================================================================
            BROWSER VIEWPORT CONTENT (Iframe / Screenshot Fallback / Click to Interact)
            ========================================================================= */}
        <div className="relative flex-1 w-full h-full bg-[#0d0d0d] overflow-hidden">
          {/* 1. Live Iframe (Lazy-loaded when slide is active) */}
          {showIframe ? (
            <div className="relative w-full h-full">
              {/* Spinner while iframe loads */}
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-neutral-950/80 backdrop-blur-sm">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
                    style={{
                      borderColor: `${project.accent}30`,
                      borderTopColor: project.accent,
                    }}
                  />
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    CONNECTING TO LIVE EDGE...
                  </span>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={project.liveUrl}
                title={`${project.title} Live Preview`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                onError={() => {
                  console.warn(
                    `[GlassMockBrowser] Iframe failed for ${project.title}, falling back to screenshot`
                  );
                  setIframeError(true);
                }}
                className={`w-full h-full border-none transition-opacity duration-500 ${
                  iframeLoaded ? "opacity-100" : "opacity-0"
                } ${isInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
              />
            </div>
          ) : (
            /* 2. High-Res Screenshot Fallback */
            <div className="relative w-full h-full">
              {thumbnailSrc ? (
                <Image
                  src={thumbnailSrc}
                  alt={`${project.title} Web Snapshot`}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 680px"
                  priority={project.index === "01"}
                  className="object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/40 p-6 text-center">
                  <span
                    className="font-anton text-2xl uppercase tracking-wider mb-2"
                    style={{ color: project.accent }}
                  >
                    {project.title}
                  </span>
                  <p className="font-mono text-xs text-neutral-400 max-w-sm">
                    {project.isComingSoon
                      ? "Deployment scheduled. Initial release coming soon."
                      : "Preview ready on live domain."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Click to Interact Overlay (Enforces pointer-events: none until clicked) */}
          {showIframe && (
            <div
              onClick={() => setIsInteractive((prev) => !prev)}
              className={`absolute inset-0 z-20 flex items-end justify-end p-4 transition-all duration-300 ${
                isInteractive
                  ? "pointer-events-none"
                  : "cursor-pointer bg-black/10 hover:bg-black/25"
              }`}
            >
              {!isInteractive ? (
                <div className="glass px-3 py-1.5 rounded-full border border-white/20 bg-neutral-900/80 shadow-lg flex items-center gap-2 font-mono text-[11px] text-white tracking-wider backdrop-blur-md animate-pulse">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.accent }}
                  />
                  <span>CLICK TO INTERACT</span>
                  <span>↗</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInteractive(false);
                  }}
                  className="glass px-2.5 py-1 rounded-full border border-white/20 bg-neutral-900/90 font-mono text-[10px] text-neutral-300 tracking-wider hover:text-white pointer-events-auto"
                >
                  PAUSE INTERACTION ✕
                </button>
              )}
            </div>
          )}

          {/* Quick Case Study trigger strip at bottom */}
          {onOpenModal && (
            <button
              onClick={() => onOpenModal(project)}
              className="absolute bottom-3 left-4 z-20 glass !rounded-full px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-white/80 hover:text-white transition-colors border border-white/15 bg-black/50 cursor-pointer"
            >
              EXPAND CASE STUDY ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
