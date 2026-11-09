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
      className="relative w-full bg-[#F5F3EE] text-[#111111] pt-28 pb-12 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-[rgba(17,17,17,0.10)]"
    >
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

      <div className="max-w-[1720px] mx-auto w-full flex flex-col gap-24">
        {/* ============================================================================== */}
        {/* TOP STATUS & EDITORIAL HEADER */}
        {/* ============================================================================== */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(17,17,17,0.10)]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
                (05 // TRANSMISSION & INQUIRIES)
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#6B6B6B]">
                ({CONTACT_DATA.location.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#6B6B6B]">
              <span className="w-2 h-2 rounded-full bg-[#FF4D00]" />
              <span>{CONTACT_DATA.availability}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
            <div>
              <div className="overflow-hidden">
                <h2 className="font-anton uppercase text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] tracking-tight text-[#111111] select-none leading-[0.88]">
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B6B6B]">
                DIRECT FREQUENCY
              </span>

              {/* COPY EMAIL Button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="group relative px-6 py-4 rounded-2xl bg-white border border-[rgba(17,17,17,0.12)] hover:border-[#FF4D00] transition-all duration-300 flex items-center justify-between gap-4 text-left cursor-pointer shadow-sm hover:shadow-md"
                data-cursor="email"
                title="Click to copy email address"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B6B6B]">
                    PRIMARY INBOX
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#111111] group-hover:text-[#C43A00] transition-colors">
                    {copied ? "COPIED TO CLIPBOARD" : "COPY EMAIL"}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                    copied
                      ? "bg-[#FF4D00] text-[#111111] shadow-sm"
                      : "bg-[#F5F3EE] text-[#111111] group-hover:bg-[#FF4D00] group-hover:text-[#111111]"
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
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-[rgba(17,17,17,0.12)] hover:border-[#111111] transition-all duration-200 flex items-center justify-between gap-2 text-left cursor-pointer group shadow-sm"
                  data-cursor="hover"
                  title="Open WhatsApp chat"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B6B6B]">
                      INSTANT CHAT
                    </span>
                    <span className="font-mono text-sm font-bold text-[#111111] group-hover:text-[#C43A00] transition-colors">
                      WHATSAPP
                    </span>
                  </div>
                  <span className="text-[#C43A00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
                    ↗
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCall}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-[rgba(17,17,17,0.12)] hover:border-[#111111] transition-all duration-200 flex items-center justify-between gap-2 text-left cursor-pointer group shadow-sm"
                  data-cursor="hover"
                  title="Initiate phone call"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B6B6B]">
                      VOICE LINE
                    </span>
                    <span className="font-mono text-sm font-bold text-[#111111] group-hover:text-[#C43A00] transition-colors">
                      CALL
                    </span>
                  </div>
                  <span className="text-[#C43A00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">
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
          <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm lg:col-span-7 p-8 md:p-10 rounded-3xl flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(17,17,17,0.08)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4D00]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#111111] font-bold">
                  TRANSMIT AN INQUIRY
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#6B6B6B]">
                ENCRYPTED & DELIVERED DIRECTLY
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="form-name" className="font-mono text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                    YOUR NAME // ENTITY
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-[#F5F3EE] border border-[rgba(17,17,17,0.12)] !rounded-xl w-full px-4 py-3 font-sans text-sm text-[#111111] placeholder-[#6B6B6B] focus:border-[#FF4D00] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-email" className="font-mono text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                    RETURN EMAIL
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="bg-[#F5F3EE] border border-[rgba(17,17,17,0.12)] !rounded-xl w-full px-4 py-3 font-sans text-sm text-[#111111] placeholder-[#6B6B6B] focus:border-[#FF4D00] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="form-message" className="font-mono text-[11px] uppercase tracking-wider text-[#6B6B6B]">
                  PROJECT SPECIFICATIONS // SCOPE
                </label>
                <textarea
                  id="form-message"
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Detail the architecture, objectives, timeline, and team requirements..."
                  className="bg-[#F5F3EE] border border-[rgba(17,17,17,0.12)] !rounded-xl w-full px-4 py-3 font-sans text-sm text-[#111111] placeholder-[#6B6B6B] focus:border-[#FF4D00] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="font-mono text-[11px] text-[#6B6B6B] text-center sm:text-left">
                  TYPICAL RESPONSE TIME &lt; 24 HOURS
                </span>

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF4D00] text-[#111111] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#E04400] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  data-cursor="hover"
                >
                  {formStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
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
                    className="p-4 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#C43A00] font-mono text-xs flex items-center gap-2.5"
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
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-[#C53030] font-mono text-xs flex items-center gap-2.5"
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
            <div className="bg-white border border-[rgba(17,17,17,0.10)] shadow-sm p-8 rounded-3xl flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.08)]">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C43A00] font-bold">
                  CURRICULUM VITAE // 2026
                </span>
                <span className="font-mono text-[10px] text-[#6B6B6B] uppercase">
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
                    className="w-full h-full rounded-xl bg-[#F5F3EE] border border-[rgba(17,17,17,0.15)] p-2.5 flex flex-col justify-between shadow-sm transition-all duration-300"
                    style={{
                      transform: pdfHovered
                        ? `perspective(800px) rotateX(${pdfTilt.rotateX}deg) rotateY(${pdfTilt.rotateY}deg) scale(1.05)`
                        : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
                    }}
                  >
                    {/* Header: PDF Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-[#FF4D00] text-[#111111] font-mono text-[8px] font-bold">
                        PDF
                      </span>
                      <span className="text-[7px] font-mono text-[#6B6B6B]">2026</span>
                    </div>

                    {/* Miniature Document Skeleton Lines */}
                    <div className="flex flex-col gap-1.5 my-auto">
                      <div className="w-10 h-1 rounded bg-[#111111]/70" />
                      <div className="w-14 h-1 rounded bg-[#111111]/30" />
                      <div className="w-12 h-1 rounded bg-[#111111]/30" />
                      <div className="w-8 h-1 rounded bg-[#FF4D00]/50" />
                    </div>

                    {/* Footer: Miniature Chip / QR */}
                    <div className="flex items-center justify-between pt-1 border-t border-[rgba(17,17,17,0.08)]">
                      <span className="text-[7px] font-mono text-[#6B6B6B]">1 PAGE</span>
                      <span className="text-[8px] text-[#C43A00]">✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-anton uppercase text-xl text-[#111111] tracking-tight">
                    FULL RESUME & CREDENTIALS
                  </h4>
                  <p className="font-sans text-xs text-[#6B6B6B] leading-relaxed">
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
                  className="py-3 px-4 rounded-xl bg-white hover:bg-neutral-50 text-[#111111] border border-[rgba(17,17,17,0.15)] font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
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
                  className="py-3 px-4 rounded-xl bg-[#FF4D00] hover:bg-[#E04400] text-[#111111] font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
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
            <div className="p-8 rounded-3xl bg-white border border-[rgba(17,17,17,0.10)] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(17,17,17,0.08)]">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#111111] font-semibold">
                  DIGITAL FOOTPRINT
                </span>
                <span className="font-mono text-[10px] text-[#6B6B6B] uppercase">
                  SOCIAL NETWORKS
                </span>
              </div>

              <div className="flex flex-col divide-y divide-[rgba(17,17,17,0.06)]">
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
                        className="py-3.5 flex items-center justify-between group hover:pl-2 transition-all duration-200"
                        data-cursor="hover"
                      >
                        <div className="flex flex-col">
                          <span className="font-anton uppercase text-lg text-[#111111] group-hover:text-[#C43A00] transition-colors">
                            {social.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#6B6B6B]">
                            {social.handle}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6B6B] hidden sm:inline">
                            {social.note}
                          </span>
                          <span className="text-[#6B6B6B] group-hover:text-[#111111] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-xs">
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
        <div className="flex flex-col gap-12 pt-16 border-t border-[rgba(17,17,17,0.10)]">
          {/* Giant Outlined Name Banner */}
          <div className="w-full overflow-hidden select-none py-6 sm:py-8 border-y border-[rgba(17,17,17,0.10)] group">
            <h1 className="font-anton uppercase text-5xl sm:text-7xl md:text-9xl lg:text-[12.5vw] tracking-tighter text-[rgba(17,17,17,0.08)] group-hover:text-[#111111] text-center leading-none transition-colors duration-700">
              ABHISHEK VERMA
            </h1>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs uppercase tracking-wider text-[#6B6B6B]">
            {/* Left: Location & Coordinates */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="text-[#111111] font-medium">{CONTACT_DATA.location}</span>
              <span className="text-[rgba(17,17,17,0.2)] hidden sm:inline">•</span>
              <span className="text-[#6B6B6B]">{CONTACT_DATA.coordinates}</span>
            </div>

            {/* Center: Copyright */}
            <div className="text-[#6B6B6B] text-center">
              © 2026 ABHISHEK VERMA // ALL RIGHTS RESERVED
            </div>

            {/* Right: BACK TO TOP BUTTON */}
            <button
              onClick={handleBackToTop}
              className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[rgba(17,17,17,0.15)] transition-all duration-200 cursor-pointer shadow-sm"
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
