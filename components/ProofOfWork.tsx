"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { linkedinUrl, resumePath } from "@/data/live";
import { CONTACT_DATA } from "@/data/contact";
import { GitHubApiResponse, GitHubRepoItem, GitHubPushEventItem } from "@/app/api/github/route";
import { HeatmapApiResponse, HeatmapWeek } from "@/app/api/github/heatmap/route";
import { DeploysApiResponse, NormalizedDeploy } from "@/app/api/deploys/route";
import { BadgesApiResponse, NormalizedBadge } from "@/app/api/badges/route";
import WakaTimeWidget from "./WakaTimeWidget";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// EMV Smart Chip SVG Glyph
function SmartChipGlyph() {
  return (
    <svg
      width="28"
      height="20"
      viewBox="0 0 30 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-80"
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="29" height="21" rx="3.5" fill="#F5F3EE" stroke="rgba(17,17,17,0.2)" strokeWidth="1" />
      <rect x="7.5" y="5" width="15" height="12" rx="1.5" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
      <line x1="7.5" y1="11" x2="22.5" y2="11" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
      <line x1="15" y1="0.5" x2="15" y2="5" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
      <line x1="15" y1="17" x2="15" y2="21.5" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
      <line x1="0.5" y1="11" x2="7.5" y2="11" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
      <line x1="22.5" y1="11" x2="29.5" y2="11" stroke="rgba(17,17,17,0.35)" strokeWidth="0.8" />
    </svg>
  );
}

// Geometric QR Code Matrix Glyph
function QrMatrixGlyph() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 opacity-75"
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="37" height="37" rx="4" fill="#FFFFFF" stroke="rgba(17,17,17,0.15)" />
      <rect x="4" y="4" width="10" height="10" fill="none" stroke="#111111" strokeWidth="1.5" />
      <rect x="6.5" y="6.5" width="5" height="5" fill="#111111" />
      <rect x="24" y="4" width="10" height="10" fill="none" stroke="#111111" strokeWidth="1.5" />
      <rect x="26.5" y="6.5" width="5" height="5" fill="#111111" />
      <rect x="4" y="24" width="10" height="10" fill="none" stroke="#111111" strokeWidth="1.5" />
      <rect x="6.5" y="26.5" width="5" height="5" fill="#111111" />
      <rect x="17" y="5" width="3" height="3" fill="#111111" opacity="0.9" />
      <rect x="17" y="11" width="3" height="3" fill="#111111" opacity="0.6" />
      <rect x="17" y="17" width="3" height="3" fill="#111111" opacity="0.9" />
      <rect x="24" y="17" width="3" height="3" fill="#111111" opacity="0.75" />
      <rect x="30" y="22" width="3" height="3" fill="#111111" opacity="0.85" />
      <rect x="17" y="29" width="3" height="3" fill="#111111" opacity="0.7" />
      <rect x="23" y="29" width="3" height="3" fill="#111111" opacity="0.85" />
    </svg>
  );
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "recently";
  try {
    const time = new Date(dateString).getTime();
    if (isNaN(time)) return "recently";
    const diffSec = Math.floor((Date.now() - time) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return "recently";
  }
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#FF4D00",
  JavaScript: "#6B6B6B",
  Python: "#6B6B6B",
  Go: "#6B6B6B",
  Rust: "#6B6B6B",
  HTML: "#6B6B6B",
  CSS: "#6B6B6B",
  Shell: "#6B6B6B",
  Solidity: "#6B6B6B",
};

function getIssuerAccent(issuer?: string): string {
  void issuer;
  return "#FF4D00";
}

// In-view 60s polling hook with fallback caching
interface UsePollingOptions {
  url: string;
  inView: boolean;
  intervalMs?: number;
}

function useInViewPolling<T>({ url, inView, intervalMs = 60000 }: UsePollingOptions) {
  const [data, setData] = useState<T | null>(null);
  const [lastGoodData, setLastGoodData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json && typeof json === "object" && "error" in json && json.error) {
        // Upstream issue reported; show fallback
        setData(json);
        setLastGoodData((prev) => prev || json);
        setIsLoading(false);
        setIsError(true);
        setErrorMsg("Couldn't load, showing last data");
        return;
      }
      setData(json);
      setLastGoodData(json);
      setIsLoading(false);
      setIsError(false);
      setErrorMsg(null);
    } catch {
      setIsLoading(false);
      setIsError(true);
      setErrorMsg("Couldn't load, showing last data");
    }
  }, [url]);

  useEffect(() => {
    if (!inView) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (document.visibilityState === "visible") {
        fetchData();
        if (!timer) {
          timer = setInterval(fetchData, intervalMs);
        }
      }
    };

    const stopPolling = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [inView, intervalMs, fetchData]);

  return {
    data: data || lastGoodData,
    isLoading: isLoading && !lastGoodData,
    isError,
    errorMsg,
    refetch: fetchData,
  };
}

// Panel Error / Cache State Banner
function PanelErrorBanner({ show, message }: { show: boolean; message: string | null }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[#C53030] font-mono text-[11px] uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] animate-ping" />
      <span>{message || "Couldn't load, showing last data"}</span>
    </div>
  );
}

export default function ProofOfWork() {
  const containerRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  // Viewport intersection observer: activates polling only while section is in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 1. GITHUB DATA
  const {
    data: githubData,
    isLoading: githubLoading,
    isError: githubError,
    errorMsg: githubErrorMsg,
  } = useInViewPolling<GitHubApiResponse>({
    url: "/api/github",
    inView: isInView,
  });

  const {
    data: heatmapData,
    isLoading: heatmapLoading,
    isError: heatmapError,
    errorMsg: heatmapErrorMsg,
  } = useInViewPolling<HeatmapApiResponse>({
    url: "/api/github/heatmap",
    inView: isInView,
  });

  // 2. DEPLOYS DATA
  const {
    data: deploysData,
    isLoading: deploysLoading,
    isError: deploysError,
    errorMsg: deploysErrorMsg,
  } = useInViewPolling<DeploysApiResponse>({
    url: "/api/deploys",
    inView: isInView,
  });

  // 3. BADGES DATA
  const {
    data: badgesData,
    isLoading: badgesLoading,
    isError: badgesError,
    errorMsg: badgesErrorMsg,
  } = useInViewPolling<BadgesApiResponse>({
    url: "/api/badges",
    inView: isInView,
  });

  // Keep Lenis & ScrollTrigger in sync whenever dynamic sections load data or layout changes
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
    return () => clearTimeout(timer);
  }, [githubLoading, heatmapLoading, deploysLoading, badgesLoading]);

  // CERTIFICATIONS INTERACTIVITY: 3D Tilt, Glare, Foil, Flip & Filter Tabs
  const [activeIssuerTab, setActiveIssuerTab] = useState<string>("ALL");
  const [flippedBadges, setFlippedBadges] = useState<Record<string, boolean>>({});
  const [hoveredBadgeIdx, setHoveredBadgeIdx] = useState<number | null>(null);
  const [badgeGlarePos, setBadgeGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [badgeFoilAngle, setBadgeFoilAngle] = useState<number>(135);
  const [badgeTilt, setBadgeTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });

  const badgesList: NormalizedBadge[] = useMemo(() => {
    return badgesData?.badges || [];
  }, [badgesData]);

  // Issuer categories for filter tabs
  const issuerTabs = useMemo(() => {
    const set = new Set<string>();
    badgesList.forEach((b) => {
      if (b.issuer) set.add(b.issuer.toUpperCase().trim());
    });
    return ["ALL", ...Array.from(set)];
  }, [badgesList]);

  // Filtered badges based on active tab
  const filteredBadges = useMemo(() => {
    if (activeIssuerTab === "ALL") return badgesList;
    return badgesList.filter((b) => b.issuer.toUpperCase().trim() === activeIssuerTab);
  }, [badgesList, activeIssuerTab]);

  // Recalculate ScrollTrigger on tab change
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeIssuerTab]);

  const handleToggleFlip = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedBadges((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleBadgeMouseMove = (e: React.MouseEvent<HTMLDivElement>, isFlipped: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const py = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    setBadgeGlarePos({ x: px, y: py });
    setBadgeFoilAngle(Math.round(normX * 80 + normY * 80 + 135));

    const maxTilt = isFlipped ? 8 : 16;
    setBadgeTilt({
      rotateX: -normY * maxTilt,
      rotateY: normX * maxTilt,
    });
  };

  const handleBadgeMouseLeave = () => {
    setHoveredBadgeIdx(null);
    setBadgeTilt({ rotateX: 0, rotateY: 0 });
    setBadgeGlarePos({ x: 50, y: 50 });
  };

  // Vercel and Netlify deploys separation
  const { vercelDeploys, netlifyDeploys } = useMemo(() => {
    const all = deploysData?.deploys || [];
    return {
      vercelDeploys: all.filter((d) => d.provider === "vercel"),
      netlifyDeploys: all.filter((d) => d.provider === "netlify"),
    };
  }, [deploysData]);

  return (
    <section
      ref={containerRef}
      id="proof-of-work"
      className="relative w-full bg-[#F5F3EE] text-[#111111] py-24 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-[rgba(17,17,17,0.10)]"
    >
      {/* Anchor targets for backwards compatibility */}
      <div id="github" className="absolute -top-24" />
      <div id="deploys" className="absolute -top-24" />
      <div id="certifications" className="absolute -top-24" />
      <div id="linkedin" className="absolute -top-24" />

      {/* Background Architectural Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(17, 17, 17, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17, 17, 17, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1720px] mx-auto w-full relative z-10 flex flex-col gap-28">
        {/* ============================================================================== */}
        {/* SECTION HERO HEADER */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-6 border-b border-[rgba(17,17,17,0.10)] pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
                (PROOF OF WORK)
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#6B6B6B]">
                (LIVE TELEMETRY)
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#6B6B6B]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]" />
                POLLING 60S IN VIEW
              </span>
              <span className="hidden md:inline text-[rgba(17,17,17,0.2)]">{"//"}</span>
              <span className="hidden md:inline">GITHUB • VERCEL • CREDLY • LINKEDIN</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="font-anton uppercase text-6xl sm:text-8xl md:text-9xl tracking-tight text-[#111111] select-none leading-[0.9]">
                PROOF /
              </h2>
              <h2 className="font-anton uppercase text-6xl sm:text-8xl md:text-9xl tracking-tight text-transparent select-none leading-[0.9] text-stroke-editorial">
                OF WORK
              </h2>
            </div>
            <p className="max-w-xl text-[#6B6B6B] text-sm md:text-base leading-relaxed font-sans">
              Real-time engineering verification stream. Live Git repository activity, edge deployment status badges, verifiable W3C holographic certifications, and professional network footprint.
            </p>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 1. GITHUB SECTION (REPOS, COMMITS, HEATMAP) */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(17,17,17,0.10)]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
                01 // GITHUB ECOSYSTEM
              </span>
              <span className="text-[#6B6B6B] font-mono text-xs">
                (PUBLIC REPOS & ACTIVITY)
              </span>
            </div>
            <PanelErrorBanner show={githubError || heatmapError} message={githubErrorMsg || heatmapErrorMsg} />
          </div>

          {/* GitHub Heatmap Calendar */}
          <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm p-6 md:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-anton uppercase text-2xl md:text-3xl tracking-tight text-[#111111]">
                  CONTRIBUTION CALENDAR
                </h3>
                <span className="font-mono text-xs uppercase tracking-widest text-[#6B6B6B]">
                  ANNUAL COMMIT DENSITY & CODE VELOCITY
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#F5F3EE] border border-[rgba(17,17,17,0.10)] font-mono text-xs">
                <span className="text-[#C43A00] font-bold text-sm">
                  {heatmapData?.total ?? (heatmapLoading ? "..." : 0)}
                </span>
                <span className="text-[#6B6B6B] uppercase tracking-wider">
                  TOTAL CONTRIBUTIONS IN PAST YEAR
                </span>
              </div>
            </div>

            {/* Heatmap Grid */}
            {heatmapLoading && !heatmapData ? (
              <div className="w-full h-32 rounded-lg bg-[rgba(17,17,17,0.06)] animate-pulse" />
            ) : (
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[780px] flex gap-1.5 items-center justify-between">
                  {(heatmapData?.weeks || []).map((week: HeatmapWeek, wIdx: number) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.days.map((day, dIdx) => {
                        let bg = "#E8E6DF";
                        if (day.count > 0 && day.count < 3) bg = "#FFC2A8";
                        else if (day.count >= 3 && day.count < 6) bg = "#FF8A50";
                        else if (day.count >= 6 && day.count < 10) bg = "#FF6420";
                        else if (day.count >= 10) bg = "#FF4D00";

                        return (
                          <div
                            key={dIdx}
                            className="w-3 h-3 rounded-[2.5px] transition-all hover:scale-125 cursor-pointer"
                            style={{ backgroundColor: bg }}
                            title={`${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">
                  <span>LESS FREQUENT</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#E8E6DF]" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FFC2A8]" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FF8A50]" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FF6420]" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FF4D00]" />
                  </div>
                  <span>HIGH VELOCITY</span>
                </div>
              </div>
            )}
          </div>

          {/* Repositories Grid + Latest Push Events Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top 8 Public Repositories (2 Columns) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                  TOP REPOSITORIES (RECENTLY PUSHED)
                </span>
                <span className="font-mono text-xs text-neutral-500">TOP 08</span>
              </div>

              {githubLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : (githubData?.repos?.length || 0) === 0 ? (
                <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center font-mono text-xs text-neutral-400">
                  NO PUBLIC REPOSITORIES FOUND
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {githubData?.repos.slice(0, 8).map((repo: GitHubRepoItem) => {
                    const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || "#FF4D00" : "#888";
                    return (
                      <a
                        key={repo.url}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm hover:border-[rgba(17,17,17,0.25)] hover:shadow-md group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                        data-cursor="hover"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-mono font-bold text-sm text-[#111111] group-hover:text-[#C43A00] transition-colors truncate">
                              {repo.name}
                            </h4>
                            <span className="text-[#6B6B6B] text-xs shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                              ↗
                            </span>
                          </div>
                          <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed font-sans mb-4">
                            {repo.description || "Public open-source repository and codebase."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[rgba(17,17,17,0.08)] text-[11px] font-mono text-[#6B6B6B]">
                          <div className="flex items-center gap-3">
                            {repo.language && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>★</span>
                              <span>{repo.stars}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#6B6B6B]">
                            {formatRelativeTime(repo.pushedAt)}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Latest 8 Push Events (1 Column Ticker) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#6B6B6B]">
                  LATEST PUSH ACTIVITY
                </span>
                <span className="font-mono text-xs text-[#6B6B6B]">RECENT 08</span>
              </div>

              {githubLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-[rgba(17,17,17,0.06)] animate-pulse border border-[rgba(17,17,17,0.08)]" />
                  ))}
                </div>
              ) : (githubData?.events?.length || 0) === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-[rgba(17,17,17,0.10)] text-center font-mono text-xs text-[#6B6B6B]">
                  NO RECENT PUSH EVENTS
                </div>
              ) : (
                <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm flex flex-col gap-2.5 p-5 rounded-2xl">
                  {githubData?.events.slice(0, 8).map((ev: GitHubPushEventItem, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#F5F3EE] border border-[rgba(17,17,17,0.08)] flex flex-col gap-1 hover:border-[rgba(17,17,17,0.2)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-xs text-[#111111] truncate">
                          {ev.repo}
                        </span>
                        <span className="font-mono text-[10px] text-[#6B6B6B] shrink-0">
                          {formatRelativeTime(ev.time)}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[#6B6B6B] truncate">
                        $ git commit -m &quot;{ev.message}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WAKATIME TELEMETRY WIDGET (BELOW GITHUB CHARTS) */}
        <WakaTimeWidget inView={isInView} />

        {/* ============================================================================== */}
        {/* 2. DEPLOYS SECTION (VERCEL + NETLIFY SIDE BY SIDE) */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(17,17,17,0.10)]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
                02 // CLOUD DEPLOYMENTS
              </span>
              <span className="text-[#6B6B6B] font-mono text-xs">
                (EDGE RUNTIME STATUS)
              </span>
            </div>
            <PanelErrorBanner show={deploysError} message={deploysErrorMsg} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* VERCEL PANEL */}
            <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm p-6 md:p-8 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 fill-[#111111]" viewBox="0 0 1155 1000">
                    <path d="m577.3 0 577.4 1000H0z" />
                  </svg>
                  <h3 className="font-anton uppercase text-2xl tracking-tight text-[#111111]">
                    VERCEL EDGE
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#6B6B6B]">
                  {vercelDeploys.length} SITES
                </span>
              </div>

              {deploysLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-[rgba(17,17,17,0.06)] animate-pulse" />
                  ))}
                </div>
              ) : vercelDeploys.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#F5F3EE] border border-[rgba(17,17,17,0.08)] text-center font-mono text-xs text-[#6B6B6B]">
                  NO ACTIVE VERCEL DEPLOYMENTS IN WHITELIST
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {vercelDeploys.map((dep: NormalizedDeploy) => {
                    const isReady = dep.status === "READY";
                    const isBuilding = dep.status === "BUILDING";

                    return (
                      <a
                        key={dep.name}
                        href={dep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-[#F5F3EE] border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.25)] transition-all flex items-center justify-between group"
                        data-cursor="hover"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-sm text-[#111111] group-hover:text-[#C43A00] transition-colors uppercase">
                            {dep.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B]">
                            <span>branch: {dep.branch}</span>
                            <span>•</span>
                            <span>deployed {formatRelativeTime(dep.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                              isReady
                                ? "bg-[#FF4D00]/10 text-[#C43A00] border-[#FF4D00]/25"
                                : isBuilding
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/25 animate-pulse"
                                : "bg-red-500/10 text-[#C53030] border-red-500/25"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isReady ? "bg-[#FF4D00]" : isBuilding ? "bg-amber-500" : "bg-[#C53030]"
                              }`}
                            />
                            {dep.status}
                          </span>
                          <span className="text-[#6B6B6B] group-hover:translate-x-0.5 group-hover:text-[#111111] transition-all text-xs">
                            ↗
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NETLIFY PANEL */}
            <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm p-6 md:p-8 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 fill-[#111111]" viewBox="0 0 24 24">
                    <path d="M16.924 10.963l-4.04-4.04a.5.5 0 00-.707 0L8.136 10.963a.5.5 0 000 .707l4.04 4.04a.5.5 0 00.708 0l4.04-4.04a.5.5 0 000-.707zm-4.394 3.333l-2.98-2.98 2.98-2.98 2.98 2.98-2.98 2.98z" />
                  </svg>
                  <h3 className="font-anton uppercase text-2xl tracking-tight text-[#111111]">
                    NETLIFY EDGE
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#6B6B6B]">
                  {netlifyDeploys.length} SITES
                </span>
              </div>

              {deploysLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-[rgba(17,17,17,0.06)] animate-pulse" />
                  ))}
                </div>
              ) : netlifyDeploys.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#F5F3EE] border border-[rgba(17,17,17,0.08)] text-center font-mono text-xs text-[#6B6B6B]">
                  NO ACTIVE NETLIFY SITES IN WHITELIST
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {netlifyDeploys.map((dep: NormalizedDeploy) => {
                    const isReady = dep.status === "READY";
                    const isBuilding = dep.status === "BUILDING";

                    return (
                      <a
                        key={dep.name}
                        href={dep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-[#F5F3EE] border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.25)] transition-all flex items-center justify-between group"
                        data-cursor="hover"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-sm text-[#111111] group-hover:text-[#C43A00] transition-colors uppercase">
                            {dep.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B]">
                            <span>branch: {dep.branch}</span>
                            <span>•</span>
                            <span>deployed {formatRelativeTime(dep.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                              isReady
                                ? "bg-[#FF4D00]/10 text-[#C43A00] border-[#FF4D00]/25"
                                : isBuilding
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/25 animate-pulse"
                                : "bg-red-500/10 text-[#C53030] border-red-500/25"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isReady ? "bg-[#FF4D00]" : isBuilding ? "bg-amber-500" : "bg-[#C53030]"
                              }`}
                            />
                            {dep.status}
                          </span>
                          <span className="text-[#6B6B6B] group-hover:translate-x-0.5 group-hover:text-[#111111] transition-all text-xs">
                            ↗
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 3. CERTIFICATIONS SECTION (HOLOGRAPHIC CARDS FROM /api/badges) */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(17,17,17,0.10)]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
                03 // VERIFIED CREDENTIALS
              </span>
              <span className="text-[#6B6B6B] font-mono text-xs">
                (HOLOGRAPHIC 3D CARDS)
              </span>
            </div>
            <PanelErrorBanner show={badgesError} message={badgesErrorMsg} />
          </div>

          {/* Issuer Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {issuerTabs.map((tab) => {
              const isActive = activeIssuerTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveIssuerTab(tab)}
                  className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#111111] text-white font-bold shadow-md"
                      : "bg-white text-[#6B6B6B] hover:text-[#111111] border border-[rgba(17,17,17,0.12)]"
                  }`}
                  data-cursor="hover"
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Holographic Cards Grid */}
          {badgesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-[rgba(17,17,17,0.06)] animate-pulse border border-[rgba(17,17,17,0.08)]" />
              ))}
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[rgba(17,17,17,0.10)] text-center font-mono text-xs text-[#6B6B6B]">
              NO BADGES FOUND FOR CURRENT FILTER
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBadges.map((badge: NormalizedBadge, idx: number) => {
                const isFlipped = Boolean(flippedBadges[badge.title]);
                const isHovered = hoveredBadgeIdx === idx;
                const accent = getIssuerAccent(badge.issuer);
                const isNew = Math.abs(Date.now() - new Date(badge.issuedAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
                const year = new Date(badge.issuedAt).getFullYear() || 2024;

                return (
                  <div
                    key={badge.title}
                    className="relative w-full h-[410px] cursor-pointer select-none"
                    onClick={(e) => handleToggleFlip(badge.title, e)}
                    onMouseEnter={() => setHoveredBadgeIdx(idx)}
                    onMouseLeave={handleBadgeMouseLeave}
                    onMouseMove={(e) => handleBadgeMouseMove(e, isFlipped)}
                    data-cursor="flip"
                  >
                    {/* 3D Tilt Wrapper */}
                    <div
                      className="w-full h-full [perspective:1200px]"
                      style={{
                        transform: isHovered
                          ? `perspective(1200px) rotateX(${badgeTilt.rotateX}deg) rotateY(${badgeTilt.rotateY}deg) translateZ(12px)`
                          : "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
                        transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {/* 3D Flip Container */}
                      <div
                        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                      >
                        {/* FRONT FACE */}
                        <div
                          className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 [backface-visibility:hidden] bg-white border"
                          style={{
                            borderColor: isHovered ? "#FF4D00" : "rgba(17, 17, 17, 0.10)",
                            boxShadow: isHovered
                              ? "0 20px 40px -10px rgba(17, 17, 17, 0.12), 0 0 20px rgba(255, 77, 0, 0.15)"
                              : "0 8px 30px rgba(17, 17, 17, 0.06)",
                          }}
                        >
                          {/* Moving Specular Glare */}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                            style={{
                              opacity: isHovered && !isFlipped ? 0.6 : 0,
                              background: `radial-gradient(circle 240px at ${badgeGlarePos.x}% ${badgeGlarePos.y}%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.2) 35%, transparent 70%)`,
                            }}
                            aria-hidden="true"
                          />

                          {/* Subtle Silver Sheen Foil Gradient */}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
                            style={{
                              opacity: isHovered && !isFlipped ? 0.35 : 0,
                              background: `linear-gradient(${badgeFoilAngle}deg, rgba(255,255,255,0) 0%, rgba(220,220,220,0.6) 45%, rgba(255,255,255,0.9) 50%, rgba(220,220,220,0.6) 55%, rgba(255,255,255,0) 100%)`,
                            }}
                            aria-hidden="true"
                          />

                          {/* Top Bar: Issuer + Smart Chip + NEW tag */}
                          <div className="flex items-center justify-between gap-2 border-b border-[rgba(17,17,17,0.08)] pb-3">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] font-semibold truncate max-w-[130px]">
                              {badge.issuer}
                            </span>
                            <div className="flex items-center gap-2">
                              {isNew && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest bg-[#FF4D00]/10 text-[#C43A00] border border-[#FF4D00]/30 animate-pulse">
                                  NEW
                                </span>
                              )}
                              <SmartChipGlyph />
                            </div>
                          </div>

                          {/* Center: Title & Accent Line */}
                          <div className="my-auto py-2">
                            <h3 className="font-anton uppercase text-2xl tracking-tight text-[#111111] leading-[1.05] line-clamp-3">
                              {badge.title}
                            </h3>
                            <div
                              className="w-7 h-[2px] mt-2.5 rounded-full"
                              style={{ backgroundColor: accent }}
                            />
                          </div>

                          {/* Bottom Info: Year, Verified, QR */}
                          <div className="flex flex-col gap-3 pt-3 border-t border-[rgba(17,17,17,0.08)]">
                            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">
                              <span>ISSUED // {year}</span>
                              <span className="text-[9px] text-[#6B6B6B] font-mono">
                                VERIFIED BADGE
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <QrMatrixGlyph />
                              <div className="flex flex-col items-end text-right font-mono">
                                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#111111]">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                                  <span>VERIFIED</span>
                                </div>
                                <span className="text-[8px] tracking-[0.2em] text-[#6B6B6B] mt-0.5">
                                  CLICK TO FLIP ↺
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BACK FACE */}
                        <div
                          className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border border-[rgba(17,17,17,0.12)] shadow-[0_16px_40px_rgba(17,17,17,0.08)]"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.08)] pb-2.5 mb-2.5">
                              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] font-semibold truncate max-w-[140px]">
                                {badge.issuer}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#111111] transition-colors">
                                ↺ FLIP
                              </span>
                            </div>

                            <h4 className="font-anton uppercase text-lg tracking-tight text-[#111111] leading-tight line-clamp-2">
                              {badge.title}
                            </h4>
                          </div>

                          <div className="my-auto py-2 flex flex-col gap-3 text-xs font-mono text-[#6B6B6B]">
                            <div>
                              <span className="text-[9px] text-[#6B6B6B] uppercase tracking-widest block mb-1">
                                ISSUED DATE
                              </span>
                              <span className="text-[#111111]">{new Date(badge.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </div>

                            <div>
                              <span className="text-[9px] text-[#6B6B6B] uppercase tracking-widest block mb-1">
                                ISSUING ENTITY
                              </span>
                              <span className="text-[#111111]">{badge.issuer}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[rgba(17,17,17,0.08)]">
                            <a
                              href={badge.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-2.5 px-3 rounded-lg bg-[#111111] hover:bg-[#FF4D00] text-white hover:text-[#111111] font-mono text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                              data-cursor="hover"
                            >
                              <span>VERIFY CREDENTIAL</span>
                              <span className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
                                ↗
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================================== */}
        {/* 4. LINKEDIN SECTION (STATIC PROFILE CARD) */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(17,17,17,0.10)]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
                04 // PROFESSIONAL NETWORK
              </span>
              <span className="text-[#6B6B6B] font-mono text-xs">
                (LINKEDIN PRESENCE & RESUME)
              </span>
            </div>
            <span className="font-mono text-xs text-[#6B6B6B]">EXECUTIVE OVERVIEW</span>
          </div>

          <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm p-8 md:p-12 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-anton text-4xl shadow-sm shrink-0 border border-[rgba(17,17,17,0.12)]">
                AV
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-anton uppercase text-3xl sm:text-4xl tracking-tight text-[#111111]">
                    ABHISHEK VERMA
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-[#111111] flex items-center justify-center text-white text-[11px] font-bold" title="Verified Professional">
                    ✓
                  </span>
                </div>

                <p className="text-sm font-mono text-[#C43A00] uppercase tracking-wider font-semibold">
                  Lead Full-Stack Architect & AI Systems Engineer
                </p>

                <p className="text-xs text-[#6B6B6B] font-sans max-w-lg leading-relaxed">
                  Specializing in enterprise cloud infrastructure, high-throughput streaming telemetry, and autonomous multi-agent pipelines. Based in {CONTACT_DATA.location}, working globally.
                </p>

                <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-[#6B6B6B]">
                  <span className="text-[#111111] font-medium">500+ Connections</span>
                  <span>•</span>
                  <span>Open for Advisory & Senior Engineering</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto relative z-10 shrink-0">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#FF4D00] hover:bg-[#E04400] text-[#111111] font-mono text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                data-cursor="hover"
              >
                <span>CONNECT ON LINKEDIN</span>
                <span>↗</span>
              </a>

              <a
                href={resumePath}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-[rgba(17,17,17,0.15)] text-[#111111] font-mono text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                data-cursor="hover"
              >
                <span>DOWNLOAD RESUME</span>
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
