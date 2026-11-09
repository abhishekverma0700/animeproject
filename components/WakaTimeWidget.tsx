"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "./project-visuals/CountUp";
import { WakaTimeApiResponse } from "@/app/api/wakatime/route";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface WakaTimeWidgetProps {
  inView: boolean;
}

export default function WakaTimeWidget({ inView }: WakaTimeWidgetProps) {
  const [data, setData] = useState<WakaTimeApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());

  // Fetch telemetry
  useEffect(() => {
    if (!inView) return;

    let isMounted = true;

    async function fetchWakaTime() {
      try {
        const res = await fetch("/api/wakatime");
        if (!res.ok) throw new Error("Failed to load WakaTime telemetry");
        const json: WakaTimeApiResponse = await res.json();
        if (isMounted) {
          setData(json);
          setIsLoading(false);
          setNowTimestamp(Date.now());
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : "Network error");
          setIsLoading(false);
        }
      }
    }

    fetchWakaTime();

    // Poll every 60s while section is in view
    const interval = setInterval(fetchWakaTime, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [inView]);

  // Update relative time counter every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const relativeUpdatedText = useMemo(() => {
    if (!data?.updatedAt) return "just now";
    const elapsedMinutes = Math.floor((nowTimestamp - data.updatedAt) / 60000);
    if (elapsedMinutes <= 1) return "updated just now";
    return `updated ${elapsedMinutes} min ago`;
  }, [data?.updatedAt, nowTimestamp]);

  // Refresh ScrollTrigger so pinned and downstream sections stay aligned
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
    return () => clearTimeout(timer);
  }, [isLoading, data]);

  // Hide the whole widget if WAKATIME_API_KEY is missing
  if (!isLoading && (!data || data.configured === false)) {
    return null;
  }

  // SKELETON STATE
  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.10)]">
          <div className="h-4 w-48 rounded bg-[rgba(17,17,17,0.06)] animate-pulse" />
          <div className="h-4 w-32 rounded bg-[rgba(17,17,17,0.06)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-64 rounded-2xl bg-white border border-[rgba(17,17,17,0.10)] animate-pulse" />
          <div className="lg:col-span-8 h-64 rounded-2xl bg-white border border-[rgba(17,17,17,0.10)] animate-pulse" />
        </div>
      </div>
    );
  }

  // EMPTY STATE ("No data yet")
  if (data?.isEmpty || (data?.totalHours === 0 && (!data?.languages || data.languages.length === 0))) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.10)]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
              TELEMETRY // CODE METRICS
            </span>
            <span className="text-[#6B6B6B] font-mono text-xs">
              (WAKATIME LAST 7 DAYS)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#6B6B6B]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>STANDBY</span>
          </div>
        </div>

        <div className="p-10 rounded-2xl bg-white border border-[rgba(17,17,17,0.10)] shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <span className="font-anton uppercase text-2xl text-[#111111] tracking-wide">
            NO DATA YET
          </span>
          <p className="font-mono text-xs text-[#6B6B6B] max-w-md">
            WakaTime telemetry is currently calculating or no activity was recorded in the last 7 days.
          </p>
        </div>
      </div>
    );
  }

  const topLanguages = (data?.languages || []).slice(0, 5);
  const maxBarHours = Math.max(...(data?.days || []).map((d) => d.hours), 1);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header with Pulsing LIVE Dot & Updated Minutes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(17,17,17,0.10)]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C43A00] font-bold">
            TELEMETRY // CODE METRICS
          </span>
          <span className="text-[#6B6B6B] font-mono text-xs">
            (WAKATIME LAST 7 DAYS)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {errorMsg && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 font-mono text-[10px] uppercase">
              <span>CACHE</span>
            </div>
          )}

          {/* Pulsing LIVE Dot */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#6B6B6B]">
            <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse shrink-0 shadow-[0_0_8px_rgba(255,77,0,0.6)]" />
            <span className="text-[#C43A00] font-semibold tracking-wider">LIVE</span>
            <span className="text-[rgba(17,17,17,0.2)]">•</span>
            <span className="text-[#6B6B6B]">{relativeUpdatedText}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: THIS WEEK + 7-BAR CHART + TOP 5 LANGUAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ============================================================================== */}
        {/* CARD 1: "THIS WEEK" CARD WITH COUNT-UP HOURS */}
        {/* ============================================================================== */}
        <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm lg:col-span-4 p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#111111] font-bold">
              THIS WEEK
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF4D00]/10 text-[#C43A00] border border-[#FF4D00]/25">
              ROLLING 7 DAYS
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <span className="font-anton text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#111111] leading-none">
                <CountUp end={data?.totalHours || 0} decimals={1} duration={1.2} />
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-[#C43A00]">
                HRS
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#6B6B6B]">
              ACTIVE PROGRAMMING TIME
            </span>
          </div>

          <div className="pt-4 border-t border-[rgba(17,17,17,0.08)] flex flex-col gap-2.5 font-mono text-xs text-[#6B6B6B]">
            <div className="flex items-center justify-between">
              <span className="text-[#6B6B6B]">DAILY AVERAGE:</span>
              <span className="text-[#111111] font-semibold">
                {data?.dailyAverage || 0} hrs/day
              </span>
            </div>

            {data?.bestDay && (
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B6B]">PEAK OUTPUT:</span>
                <span className="text-[#C43A00] font-semibold truncate max-w-[170px]" title={data.bestDay.text}>
                  {data.bestDay.text}
                </span>
              </div>
            )}

            {data?.editors && data.editors.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#6B6B6B]">TOP ENVIRONMENT:</span>
                <span className="text-[#111111]">
                  {data.editors[0].name} ({data.editors[0].percent}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================================== */}
        {/* CARD 2: 7-BAR DAILY CHART */}
        {/* ============================================================================== */}
        <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm lg:col-span-4 p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#111111] font-bold">
              DAILY VELOCITY
            </span>
            <span className="font-mono text-[10px] text-[#6B6B6B] uppercase">
              7-DAY CYCLE
            </span>
          </div>

          {/* 7-Bar Visual Display */}
          <div className="flex items-end justify-between gap-2 sm:gap-3 h-40 pt-4">
            {(data?.days || []).map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.hours / maxBarHours) * 100));
              const isPeak = data?.bestDay?.date === day.date || day.hours === maxBarHours;

              return (
                <div key={day.date || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Hours tooltop on hover */}
                  <span className="text-[10px] font-mono text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.hours}h
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[32px] h-32 bg-[#F5F3EE] rounded-t-lg relative flex items-end overflow-hidden border border-[rgba(17,17,17,0.08)] group-hover:border-[rgba(17,17,17,0.25)] transition-colors">
                    <motion.div
                      initial={{ height: "0%" }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                      className={`w-full rounded-t-md transition-colors ${
                        isPeak
                          ? "bg-[#FF4D00] shadow-[0_0_12px_rgba(255,77,0,0.35)]"
                          : "bg-[#D8D6CE] group-hover:bg-[#111111]"
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${isPeak ? "text-[#C43A00] font-bold" : "text-[#6B6B6B]"}`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between font-mono text-[10px] text-[#6B6B6B] uppercase">
            <span>HISTORICAL LOGS</span>
            <span>MAX: {maxBarHours} HRS</span>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* CARD 3: TOP 5 LANGUAGES AS ANIMATED HORIZONTAL BARS */}
        {/* ============================================================================== */}
        <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm lg:col-span-4 p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#111111] font-bold">
              TOP LANGUAGES
            </span>
            <span className="font-mono text-[10px] text-[#6B6B6B] uppercase">
              STACK WEIGHT
            </span>
          </div>

          {/* Languages Stacked Rows */}
          <div className="flex flex-col gap-3.5 my-auto">
            {topLanguages.map((lang, idx) => {
              const color = idx === 0 ? "#FF4D00" : "#8C8A82";

              return (
                <div key={lang.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[#111111] font-medium truncate max-w-[150px]">
                        {lang.name}
                      </span>
                    </div>
                    <span className="text-[#6B6B6B] font-semibold">
                      {lang.percent}%
                    </span>
                  </div>

                  {/* Animated Horizontal Bar */}
                  <div className="w-full h-2 rounded-full bg-[#F5F3EE] overflow-hidden border border-[rgba(17,17,17,0.08)]">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min(100, Math.max(4, lang.percent))}%` }}
                      transition={{ duration: 0.9, delay: 0.1 + idx * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between font-mono text-[10px] text-[#6B6B6B] uppercase">
            <span>MEASURED VIA IDE SENSORS</span>
            <span>TOP 05</span>
          </div>
        </div>
      </div>
    </div>
  );
}
