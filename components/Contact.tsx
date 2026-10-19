"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_DATA } from "@/data/contact";
import { linkedinUrl, resumePath } from "@/data/live";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  // Tilting PDF thumbnail state
  const [pdfTilt, setPdfTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });
  const [pdfHovered, setPdfHovered] = useState(false);

  // Form submission state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formErrorMsg, setFormErrorMsg] = useState("");

  const handleCopyEmail = useCallback(() => {
    const email = [CONTACT_DATA.emailParts[0], CONTACT_DATA.emailParts[1]].join("@");
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  const handleWhatsApp = useCallback(() => {
    const waUrl = "https://" + ["wa.me", CONTACT_DATA.whatsappParts.join("")].join("/");
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, []);

  const handleCall = useCallback(() => {
    const tel = "tel:" + CONTACT_DATA.phoneParts.join("");
    window.location.href = tel;
  }, []);

  const handlePdfMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    setPdfTilt({
      rotateX: -normY * 18,
      rotateY: normX * 18,
    });
  };

  const handlePdfMouseLeave = () => {
    setPdfHovered(false);
    setPdfTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;

    setFormStatus("loading");
    setFormErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          message: formMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setFormStatus("error");
        setFormErrorMsg(data.error || "Failed to transmit message. Please try again.");
      } else {
        setFormStatus("success");
        setFormName("");
        setFormEmail("");
        setFormMessage("");
      }
    } catch {
      setFormStatus("error");
      setFormErrorMsg("Network error. Please try again or email directly.");
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full bg-[#080808] text-white pt-28 pb-12 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/5"
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Ambient Lighting Gradient */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-t from-emerald-500/5 via-sky-500/5 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1720px] mx-auto w-full flex flex-col gap-24">
        {/* ============================================================================== */}
        {/* TOP STATUS & EDITORIAL HEADER */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/90">
                (05 // TRANSMISSION & INQUIRIES)
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                ({CONTACT_DATA.location.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{CONTACT_DATA.availability}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
            <div>
              <div className="overflow-hidden">
                <h2 className="font-anton uppercase text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] tracking-tight text-white select-none leading-[0.88]">
                  LET&apos;S /
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2 className="font-anton uppercase text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] tracking-tight text-transparent select-none leading-[0.88] text-stroke-editorial">
                  TALK
                </h2>
              </div>
            </div>

            {/* Direct Communication Channels: COPY EMAIL, WHATSAPP, CALL */}
            <div className="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[340px] max-w-md">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                DIRECT FREQUENCY
              </span>

              {/* COPY EMAIL Button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="group relative px-6 py-4 rounded-2xl bg-[#141414] border border-white/15 hover:border-emerald-400/60 transition-all duration-300 flex items-center justify-between gap-4 text-left cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]"
                data-cursor="email"
                title="Click to copy email address"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    PRIMARY INBOX
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {copied ? "COPIED TO CLIPBOARD" : "COPY EMAIL"}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                    copied
                      ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      : "bg-white/10 text-neutral-300 group-hover:bg-white group-hover:text-black"
                  }`}
                >
                  {copied ? (
                    <>
                      <span>COPIED</span>
                      <span>✓</span>
                    </>
                  ) : (
                    <>
                      <span>COPY</span>
                      <span>⧉</span>
                    </>
                  )}
                </div>
              </button>

              {/* Action Buttons: WHATSAPP & CALL */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="px-5 py-3.5 rounded-xl bg-[#141414] hover:bg-[#15231c] border border-white/15 hover:border-emerald-400/60 transition-all duration-300 flex items-center justify-between gap-2 text-left cursor-pointer group shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  data-cursor="hover"
                  title="Open WhatsApp chat"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      INSTANT CHAT
                    </span>
                    <span className="font-mono text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      WHATSAPP
                    </span>
                  </div>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
                    ↗
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCall}
                  className="px-5 py-3.5 rounded-xl bg-[#141414] hover:bg-[#16212e] border border-white/15 hover:border-sky-400/60 transition-all duration-300 flex items-center justify-between gap-2 text-left cursor-pointer group shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  data-cursor="hover"
                  title="Initiate phone call"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      VOICE LINE
                    </span>
                    <span className="font-mono text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                      CALL
                    </span>
                  </div>
                  <span className="text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
                    ↗
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* MAIN INTERACTION GRID: FORM + SOCIALS + RESUME BLOCK */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Transmission Contact Form (7 cols) */}
          <div className="glass lg:col-span-7 p-8 md:p-10 rounded-3xl flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold">
                  TRANSMIT AN INQUIRY
                </h3>
              </div>
              <span className="font-mono text-[11px] text-neutral-500">
                ENCRYPTED & DELIVERED DIRECTLY
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="form-name" className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                    YOUR NAME // ENTITY
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Jane Doe"
                    className="glass !rounded-xl w-full px-4 py-3 font-sans text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-email" className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                    RETURN EMAIL
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="glass !rounded-xl w-full px-4 py-3 font-sans text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="form-message" className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                  PROJECT SPECIFICATIONS // SCOPE
                </label>
                <textarea
                  id="form-message"
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Detail the architecture, objectives, timeline, and team requirements..."
                  className="glass !rounded-xl w-full px-4 py-3 font-sans text-sm text-white placeholder-neutral-500 focus:border-emerald-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="font-mono text-[11px] text-neutral-500 text-center sm:text-left">
                  TYPICAL RESPONSE TIME &lt; 24 HOURS
                </span>

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                  data-cursor="hover"
                >
                  {formStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>DISPATCHING...</span>
                    </>
                  ) : (
                    <>
                      <span>DISPATCH MESSAGE</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {formStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2.5"
                  >
                    <span>✓</span>
                    <span>Transmission successful. Your message has been logged. Thank you!</span>
                  </motion.div>
                )}

                {formStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center gap-2.5"
                  >
                    <span>⚠️</span>
                    <span>{formErrorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Socials & Tilting Resume Block (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* RESUME BLOCK WITH TILTING THUMBNAIL */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400 font-bold">
                  CURRICULUM VITAE // 2026
                </span>
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  VERIFIED PDF
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Tilting PDF Thumbnail */}
                <div
                  className="relative w-24 h-32 rounded-xl cursor-pointer [perspective:800px] shrink-0 select-none"
                  onMouseEnter={() => setPdfHovered(true)}
                  onMouseLeave={handlePdfMouseLeave}
                  onMouseMove={handlePdfMouseMove}
                  data-cursor="hover"
                >
                  <div
                    className="w-full h-full rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#121212] border border-white/20 p-2.5 flex flex-col justify-between shadow-[0_12px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
                    style={{
                      transform: pdfHovered
                        ? `perspective(800px) rotateX(${pdfTilt.rotateX}deg) rotateY(${pdfTilt.rotateY}deg) scale(1.05)`
                        : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
                    }}
                  >
                    {/* Header: PDF Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono text-[8px] font-bold">
                        PDF
                      </span>
                      <span className="text-[7px] font-mono text-neutral-500">2026</span>
                    </div>

                    {/* Miniature Document Skeleton Lines */}
                    <div className="flex flex-col gap-1.5 my-auto">
                      <div className="w-10 h-1 rounded bg-white/60" />
                      <div className="w-14 h-1 rounded bg-white/25" />
                      <div className="w-12 h-1 rounded bg-white/25" />
                      <div className="w-8 h-1 rounded bg-emerald-400/40" />
                    </div>

                    {/* Footer: Miniature Chip / QR */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-[7px] font-mono text-neutral-500">1 PAGE</span>
                      <span className="text-[8px] text-emerald-400">✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-anton uppercase text-xl text-white tracking-tight">
                    FULL RESUME & CREDENTIALS
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                    Complete work experience, distributed cloud architecture, AI pipelines, and technical leadership track record.
                  </p>
                </div>
              </div>

              {/* Action Buttons: VIEW + DOWNLOAD */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                  data-cursor="hover"
                >
                  <span>VIEW</span>
                  <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </a>

                <a
                  href={resumePath}
                  download="Abhishek_Verma_Resume.pdf"
                  className="py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 hover:border-emerald-500 font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  data-cursor="hover"
                >
                  <span>DOWNLOAD</span>
                  <span className="group-hover:translate-y-0.5 transition-transform">
                    ↓
                  </span>
                </a>
              </div>
            </div>

            {/* SOCIALS DIRECTORY */}
            <div className="p-8 rounded-3xl bg-[#0f0f0f]/90 border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                  DIGITAL FOOTPRINT
                </span>
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  SOCIAL NETWORKS
                </span>
              </div>

              <div className="flex flex-col divide-y divide-white/5">
                {CONTACT_DATA.socials
                  .filter((s) => s.id === "linkedin" || s.id === "github")
                  .map((social) => {
                    const targetUrl = social.id === "linkedin" ? linkedinUrl : social.url;

                    return (
                      <a
                        key={social.id}
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 flex items-center justify-between group hover:pl-2 transition-all duration-300"
                        data-cursor="hover"
                      >
                        <div className="flex flex-col">
                          <span className="font-anton uppercase text-lg text-white group-hover:text-emerald-400 transition-colors">
                            {social.name}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {social.handle}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 hidden sm:inline">
                            {social.note}
                          </span>
                          <span className="text-neutral-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-xs">
                            ↗
                          </span>
                        </div>
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* FOOTER SECTION: GIANT OUTLINED NAME & BACK TO TOP */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-12 pt-16 border-t border-white/10">
          {/* Giant Outlined Name Banner */}
          <div className="w-full overflow-hidden select-none py-6 sm:py-8 border-y border-white/10 group">
            <h1 className="font-anton uppercase text-5xl sm:text-7xl md:text-9xl lg:text-[12.5vw] tracking-tighter text-transparent text-stroke-editorial text-center leading-none group-hover:text-white/10 transition-colors duration-700">
              ABHISHEK VERMA
            </h1>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs uppercase tracking-wider text-neutral-400">
            {/* Left: Location & Coordinates */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="text-white">{CONTACT_DATA.location}</span>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="text-neutral-500">{CONTACT_DATA.coordinates}</span>
            </div>

            {/* Center: Copyright */}
            <div className="text-neutral-500 text-center">
              © 2026 ABHISHEK VERMA // ALL RIGHTS RESERVED
            </div>

            {/* Right: BACK TO TOP BUTTON */}
            <button
              onClick={handleBackToTop}
              className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white text-neutral-300 hover:text-black border border-white/10 hover:border-white transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              data-cursor="hover"
              aria-label="Scroll back to top of page"
            >
              <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                BACK TO TOP
              </span>
              <span className="group-hover:-translate-y-1 transition-transform text-sm font-bold">
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
