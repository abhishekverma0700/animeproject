"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { CONTACT_DATA } from "@/data/contact";

const MENU_ITEMS = [
  { label: "WORK", href: "#work", desc: "SELECTED CLIENT & OPEN-SOURCE CASE STUDIES" },
  { label: "ABOUT", href: "#about", desc: "BACKGROUND, METHODOLOGY & TIMELINE" },
  { label: "SKILLS", href: "#skills", desc: "FULL-STACK, CLOUD & AI TECH STACK" },
  { label: "PROOF OF WORK", href: "#proof-of-work", desc: "LIVE GITHUB, DEPLOYS, CREDENTIALS & NETWORK" },
  { label: "CONTACT", href: "#contact", desc: "START A PROJECT OR SAY HELLO" },
];

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Detect scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Magnetic MENU button effect
  useEffect(() => {
    const btn = menuButtonRef.current;
    if (!btn) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 80) {
        xTo(dx * 0.4);
        yTo(dy * 0.4);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full pointer-events-none transition-all duration-300 flex justify-center ${
          isScrolled ? "py-4 px-4 sm:px-6" : "py-6 md:py-8 px-6 md:px-12 lg:px-16"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={`pointer-events-auto transition-all duration-300 flex items-center justify-between ${
            isScrolled
              ? "glass w-full max-w-4xl px-6 py-3 !rounded-full shadow-2xl"
              : "w-full max-w-[1920px] bg-transparent border-0 border-none shadow-none"
          }`}
        >
          {/* Left: ABHISHEK */}
          <div className="flex items-center gap-2.5 group cursor-pointer" data-cursor="hover">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-medium text-white/90 group-hover:text-white transition-colors select-none">
              ABHISHEK
            </span>
          </div>

          {/* Right: Magnetic MENU */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.25em] font-medium text-white/80 hover:text-white transition-colors focus:outline-none select-none cursor-pointer px-3 py-1.5"
            aria-label="Toggle Navigation Menu"
            data-cursor="hover"
          >
            <span>{isMenuOpen ? "CLOSE" : "MENU"}</span>
            <span className="inline-block w-4 h-[1px] bg-white/60 group-hover:bg-white group-hover:w-6 transition-all duration-300" />
          </button>
        </motion.div>
      </header>

      {/* Fullscreen Editorial Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[80] bg-[#0a0a0a]/95 flex flex-col justify-between px-6 py-10 md:px-16 md:py-16 text-white select-none overflow-hidden"
          >
            <div className="max-w-[1920px] mx-auto w-full pt-16 flex flex-col justify-between h-full">
              {/* Menu Navigation Links Panel */}
              <div
                className="glass max-w-5xl mx-auto w-full p-8 md:p-14 rounded-3xl flex flex-col gap-4 sm:gap-6 md:gap-8 my-auto"
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {MENU_ITEMS.map((item, idx) => {
                  const isCurrent = hoveredIdx === idx;
                  const isAnyHovered = hoveredIdx !== null;
                  const opacityClass = !isAnyHovered
                    ? "opacity-90"
                    : isCurrent
                    ? "opacity-100"
                    : "opacity-25";

                  return (
                    <div key={item.label} className="overflow-hidden">
                      <motion.a
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        initial={{ y: "115%" }}
                        animate={{ y: "0%" }}
                        transition={{
                          duration: 0.7,
                          delay: 0.08 + idx * 0.07,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={`group block font-anton uppercase text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight transition-all duration-300 ${opacityClass}`}
                        data-cursor="hover"
                      >
                        <div className="flex items-baseline gap-4 md:gap-8">
                          <span className="text-xs sm:text-sm font-mono tracking-widest text-neutral-500">
                            0{idx + 1}
                          </span>
                          <span className="transition-transform duration-300 group-hover:translate-x-3">
                            {item.label}
                          </span>
                          <span className="hidden lg:inline-block text-xs font-mono tracking-[0.2em] text-neutral-500 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {"//"} {item.desc}
                          </span>
                        </div>
                      </motion.a>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Footer Info */}
              <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono uppercase tracking-[0.22em] text-neutral-400">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{`${CONTACT_DATA.location.toUpperCase()} // REMOTE WORLDWIDE`}</span>
                </div>
                <span>{CONTACT_DATA.availability}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
