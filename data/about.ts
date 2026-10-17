export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  detail: string;
}

export interface WorkPrinciple {
  id: string;
  prefix: string;
  title: string;
  description: string;
}

export interface AboutData {
  sectionLabel: string;
  sectionNumber: string;
  heading: string;
  statement: string;
  photo: {
    src: string;
    alt: string;
    badgeText: string;
    caption: string;
    location: string;
  };
  stats: StatItem[];
  principles: WorkPrinciple[];
}

export const ABOUT_DATA: AboutData = {
  sectionLabel: "(ABOUT)",
  sectionNumber: "02 // PHILOSOPHY & PROFILE",
  heading: "ENGINEERING WITH ARCHITECTURAL DISCIPLINE & EDITORIAL PRECISION.",
  statement:
    "I turn complex ideas into scalable products. From backend architecture to pixel-perfect interfaces, I build and ship full-stack platforms end to end.",
  photo: {
    src: "/me.png",
    alt: "Abhishek — Full-Stack Engineer and System Architect",
    badgeText: "AVAILABLE FOR WORK • AVAILABLE FOR WORK • ",
    caption: "ABHISHEK VERMA",
    location: "NEW DELHI // UTC+5:30",
  },
  stats: [
    {
      id: "years",
      value: 4,
      suffix: "+",
      label: "YEARS",
      detail: "PRODUCTION EXPERIENCE",
    },
    {
      id: "projects",
      value: 20,
      suffix: "+",
      label: "PROJECTS",
      detail: "SHIPPED TO PRODUCTION",
    },
    {
      id: "systems",
      value: 10,
      suffix: "+",
      label: "SYSTEMS SHIPPED",
      detail: "DISTRIBUTED PLATFORMS",
    },
    {
      id: "ownership",
      value: 100,
      suffix: "%",
      label: "OWNERSHIP",
      detail: "END-TO-END EXECUTION",
    },
  ],
  principles: [
    {
      id: "principle-1",
      prefix: "/ Architecture first",
      title: "Foundations define scale",
      description:
        "Clean domain boundaries, resilient distributed patterns, strict type-safety, and zero tech-debt compromises from day one.",
    },
    {
      id: "principle-2",
      prefix: "/ Ship fast, iterate",
      title: "Velocity backed by telemetry",
      description:
        "Short development cycles, automated testing pipelines, live metrics, and real-time user feedback drive every deployment.",
    },
    {
      id: "principle-3",
      prefix: "/ Clean, scalable code",
      title: "Craft in every layer",
      description:
        "Maintainable modular systems, minimal mental overhead for teams, and micro-interactions tuned to an uncompromising 60fps standard.",
    },
  ],
};
