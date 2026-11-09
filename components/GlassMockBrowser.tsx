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
  const [loadLiveIframe, setLoadLiveIframe] = useState(false);

  // When slide becomes inactive, unmount iframe to free GPU & memory
  useEffect(() => {
    if (!isActive) {
      setIsInteractive(false);
      setLoadLiveIframe(false);
      setIframeLoaded(false);
    }
  }, [isActive]);

  const domain = React.useMemo(() => {
    try {
      const u = new URL(project.liveUrl);
      return u.hostname;
    } catch {
      return project.liveUrl?.replace(/^https?:\/\//, "").split("/")[0] || "preview.dev";
    }
  }, [project.liveUrl]);

  // Optimized 3D Tilt Effect using quickTo and cached bounding rect
  const rotXTo = useRef<((v: number) => void) | null>(null);
  const rotYTo = useRef<((v: number) => void) | null>(null);
  const cachedRect = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    cachedRect.current = card.getBoundingClientRect();
    if (!rotXTo.current) {
      rotXTo.current = gsap.quickTo(card, "rotateX", {
        duration: 0.35,
        ease: "power2.out",
      });
      rotYTo.current = gsap.quickTo(card, "rotateY", {
        duration: 0.35,
        ease: "power2.out",
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cachedRect.current;
    if (!rect || !rotXTo.current || !rotYTo.current) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    rotXTo.current(rotateX);
    rotYTo.current(rotateY);

    if (glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle 350px at ${glareX}% ${glareY}%, rgba(255,255,255,0.12), transparent 75%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glareRef.current) {
      glareRef.current.style.background = "none";
    }

    setIsInteractive(false);
  };

  const thumbnailSrc =
    project.thumbnail ||
    (project.liveUrl
      ? `https://image.thum.io/get/width/1200/${project.liveUrl}`
      : "/placeholder.png");

  // Render iframe ONLY for the active project when explicitly enabled
  const showIframe =
    isActive &&
    loadLiveIframe &&
    !iframeError &&
    project.liveUrl &&
    project.status !== "COMING SOON";

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[620px] xl:max-w-[680px] perspective-[1400px] select-none"
    >
      {/* 3D Tilt Card Shell */}
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[16/10.5] sm:aspect-[16/10] rounded-[22px] overflow-hidden flex flex-col border border-[rgba(17,17,17,0.10)] bg-white shadow-[0_16px_40px_rgba(17,17,17,0.06)]"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={glareRef}
          className="absolute inset-0 z-30 pointer-events-none rounded-[22px] transition-opacity duration-300"
        />

        {/* Browser Window Header */}
        <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-[rgba(17,17,17,0.10)] bg-[#F5F3EE]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full bg-[#ff5f56]"
              title="Close"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#ffbd2e]"
              title="Minimize"
            />
            <span
              className="w-3 h-3 rounded-full bg-[#27c93f]"
              title="Maximize"
            />
          </div>

          <div className="flex-1 max-w-[280px] sm:max-w-[340px] mx-3">
            <div className="rounded-full px-3 py-1 flex items-center justify-between text-[11px] sm:text-xs font-mono text-[#111111] border border-[rgba(17,17,17,0.10)] bg-white truncate shadow-sm">
              <div className="flex items-center gap-1.5 truncate">
                <svg
                  className="w-3 h-3 flex-shrink-0 text-[#111111]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate text-[#111111] font-medium">
                  {domain}
                </span>
              </div>

              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]"
                />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider text-[#C43A00]"
                >
                  SSL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-md flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] hover:bg-[rgba(17,17,17,0.06)] transition-colors"
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

        {/* Viewport Content */}
        <div className="relative flex-1 w-full h-full bg-[#F5F3EE] overflow-hidden">
          {showIframe ? (
            <div className="relative w-full h-full">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3 border-[#FF4D00]/30 border-t-[#FF4D00]"
                  />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#6B6B6B]">
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
                  setIframeError(true);
                  setLoadLiveIframe(false);
                }}
                className={`w-full h-full border-none transition-opacity duration-300 ${
                  iframeLoaded ? "opacity-100" : "opacity-0"
                } ${isInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
              />
            </div>
          ) : (
            /* Screenshot Fallback & Click to Load Live Preview */
            <div className="relative w-full h-full">
              {thumbnailSrc ? (
                <Image
                  src={thumbnailSrc}
                  alt={`${project.title} Web Snapshot`}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 680px"
                  priority={project.index === "01"}
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F3EE] p-6 text-center">
                  <span
                    className="font-anton text-2xl uppercase tracking-wider mb-2 text-[#C43A00]"
                  >
                    {project.title}
                  </span>
                  <p className="font-mono text-xs text-[#6B6B6B] max-w-sm">
                    {project.isComingSoon
                      ? "Deployment scheduled. Initial release coming soon."
                      : "Preview ready on live domain."}
                  </p>
                </div>
              )}

              {/* Click-to-load Live Preview Button Overlay */}
              {isActive && project.liveUrl && project.status !== "COMING SOON" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/15 hover:bg-black/10 transition-colors">
                  <button
                    onClick={() => setLoadLiveIframe(true)}
                    className="px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-[#FF4D00] hover:bg-[#E04400] text-[#111111] shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <span
                      className="w-2 h-2 rounded-full bg-[#111111] animate-ping"
                    />
                    <span>LOAD LIVE PREVIEW ↗</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Click to Interact Overlay when Iframe is active */}
          {showIframe && (
            <div
              onClick={() => setIsInteractive((prev) => !prev)}
              className={`absolute inset-0 z-20 flex items-end justify-end p-4 transition-all duration-300 ${
                isInteractive
                  ? "pointer-events-none"
                  : "cursor-pointer bg-black/5 hover:bg-black/10"
              }`}
            >
              {!isInteractive ? (
                <div className="px-3 py-1.5 rounded-full border border-[rgba(17,17,17,0.12)] bg-white/95 shadow-md flex items-center gap-2 font-mono text-[11px] text-[#111111] tracking-wider animate-pulse">
                  <span
                    className="w-2 h-2 rounded-full bg-[#FF4D00]"
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
                  className="px-2.5 py-1 rounded-full border border-[rgba(17,17,17,0.12)] bg-white font-mono text-[10px] text-[#111111] tracking-wider hover:text-[#C43A00] pointer-events-auto shadow-sm"
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
              className="absolute bottom-3 left-4 z-20 rounded-full px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-[#111111] hover:text-[#C43A00] transition-colors border border-[rgba(17,17,17,0.12)] bg-white/90 shadow-sm cursor-pointer"
            >
              EXPAND CASE STUDY ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
