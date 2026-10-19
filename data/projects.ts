export interface ProjectConfig {
  slug: string;
  title: string;
  netlifySite?: string;
  vercelProject?: string;
  githubRepo: string;
  accent: string;
  summaryOverride?: string;
}

export interface LiveProject {
  index: string;
  slug: string;
  title: string;
  summary: string;
  techTags: string[];
  liveUrl: string;
  repoUrl: string;
  status: "LIVE" | "BUILDING" | "COMING SOON" | "ERROR";
  deployedAt?: string;
  thumbnail: string;
  accent: string;
  matchedResource?: {
    provider: "netlify" | "vercel" | "none";
    siteName?: string;
    repoName?: string;
  };
  isComingSoon?: boolean;

  // Compatibility fields for CaseStudyModal and detailed views
  tags?: string[];
  link?: string;
  image?: string;
  description?: string;
  role?: string;
  stats?: Array<{ label: string; value: number; prefix?: string; suffix?: string }>;
  features?: string[];
  gallery?: string[];
  visual?: string;
}

// Backwards compatibility alias
export type Project = LiveProject;

export const PROJECT_CONFIGS: ProjectConfig[] = [
  {
    slug: "abhirent",
    title: "ABHIRENT",
    netlifySite: "abhirent",
    githubRepo: "Abhirent",
    accent: "#38bdf8", // Electric Sky
    summaryOverride:
      "Full-stack rental marketplace and equipment reservation platform. Features real-time inventory management, automated scheduling, customer booking flows, and robust edge deployment.",
  },
  {
    slug: "amalabiocetulas",
    title: "AMALA BIOCEUTICALS",
    netlifySite: "amalabioceuticals",
    githubRepo: "Amalabioceuticals",
    accent: "#10b981", // Emerald Neon
    summaryOverride:
      "Enterprise pharmaceutical commerce and healthcare portal showcasing verified clinical formulations, laboratory batch authentications, and streamlined wholesale distribution inquiries.",
  },
  {
    slug: "portvia",
    title: "PORTVIA",
    netlifySite: "portvia",
    vercelProject: "portvia",
    githubRepo: "portvia",
    accent: "#a855f7", // Deep Purple
    summaryOverride:
      "AI-accelerated developer portfolio builder and digital presence studio that converts GitHub commit streams, deployment telemetry, and verified certifications into interactive showcases.",
  },
];

export const INITIAL_PROJECTS: LiveProject[] = [
  {
    index: "01",
    slug: "abhirent",
    title: "ABHIRENT",
    summary:
      "Full-stack rental marketplace and equipment reservation platform. Features real-time inventory management, automated scheduling, customer booking flows, and robust edge deployment.",
    techTags: ["TypeScript", "Next.js", "React", "CSS", "Tailwind"],
    liveUrl: "https://abhirent.netlify.app",
    repoUrl: "https://github.com/abhishekverma0700/Abhirent",
    status: "LIVE",
    deployedAt: "2026-02-27T21:03:41.011Z",
    thumbnail:
      "https://d33wubrfki0l68.cloudfront.net/69a206ad2f26da00084dd10d/screenshot_2026-02-27-21-03-55-0000.webp",
    accent: "#38bdf8",
    matchedResource: {
      provider: "netlify",
      siteName: "abhirent",
      repoName: "Abhirent",
    },
    isComingSoon: false,
    tags: ["TypeScript", "Next.js", "React", "Tailwind", "Edge Functions"],
    link: "https://abhirent.netlify.app",
    image:
      "https://d33wubrfki0l68.cloudfront.net/69a206ad2f26da00084dd10d/screenshot_2026-02-27-21-03-55-0000.webp",
    description:
      "Full-stack rental marketplace and equipment reservation platform. Features real-time inventory management, automated scheduling, customer booking flows, and robust edge deployment.",
    role: "Lead Full-Stack Architect",
    stats: [
      { label: "Booking Latency", value: 45, suffix: "ms" },
      { label: "Uptime SLA", value: 99.9, suffix: "%" },
      { label: "Active Listings", value: 120, prefix: "+" },
    ],
    features: [
      "Dynamic reservation calendar with conflict resolution and automated booking buffers",
      "Real-time asset telemetry, payment gateway integration, and instant PDF invoice generation",
      "Optimized edge rendering with zero-cold-start performance across global edge nodes",
    ],
    visual: "abhirent",
  },
  {
    index: "02",
    slug: "amalabiocetulas",
    title: "AMALA BIOCEUTICALS",
    summary:
      "Enterprise pharmaceutical commerce and healthcare portal showcasing verified clinical formulations, laboratory batch authentications, and streamlined wholesale distribution inquiries.",
    techTags: ["TypeScript", "JavaScript", "HTML", "CSS", "Healthcare"],
    liveUrl: "https://amalabioceuticals.in",
    repoUrl: "https://github.com/abhishekverma0700/Amalabioceuticals",
    status: "LIVE",
    deployedAt: "2026-02-21T16:00:40.583Z",
    thumbnail:
      "https://d33wubrfki0l68.cloudfront.net/6999d6a88900220008fab7af/screenshot_2026-02-21-16-00-53-0000.webp",
    accent: "#10b981",
    matchedResource: {
      provider: "netlify",
      siteName: "amalabioceuticals",
      repoName: "Amalabioceuticals",
    },
    isComingSoon: false,
    tags: ["TypeScript", "Healthcare", "E-Commerce", "Tailwind", "Responsive"],
    link: "https://amalabioceuticals.in",
    image:
      "https://d33wubrfki0l68.cloudfront.net/6999d6a88900220008fab7af/screenshot_2026-02-21-16-00-53-0000.webp",
    description:
      "Enterprise pharmaceutical commerce and healthcare portal showcasing verified clinical formulations, laboratory batch authentications, and streamlined wholesale distribution inquiries.",
    role: "Full-Stack Engineer & Designer",
    stats: [
      { label: "Product Catalog", value: 85, prefix: "+" },
      { label: "Lighthouse Score", value: 98, suffix: "/100" },
      { label: "Wholesale Conversions", value: 34, suffix: "%" },
    ],
    features: [
      "Regulatory-compliant clinical documentation access and verified batch testing reports",
      "Secure wholesale quotation request portal with automated volume discounting calculators",
      "Mobile-optimized catalog browsing with high-resolution packaging previews",
    ],
    visual: "amalabioceuticals",
  },
  {
    index: "03",
    slug: "portvia",
    title: "PORTVIA",
    summary:
      "AI-accelerated developer portfolio builder and digital presence studio that converts GitHub commit streams, deployment telemetry, and verified certifications into interactive showcases.",
    techTags: ["TypeScript", "PostgreSQL", "React", "Tailwind", "Vite"],
    liveUrl: "https://portvia.netlify.app",
    repoUrl: "https://github.com/abhishekverma0700/portvia",
    status: "LIVE",
    deployedAt: "2025-12-20T13:35:16.830Z",
    thumbnail:
      "https://d33wubrfki0l68.cloudfront.net/6946a614f0295b00082c7383/screenshot_2025-12-20-13-35-46-0000.webp",
    accent: "#a855f7",
    matchedResource: {
      provider: "netlify",
      siteName: "portvia",
      repoName: "portvia",
    },
    isComingSoon: false,
    tags: ["TypeScript", "PostgreSQL", "React", "Tailwind", "Vite"],
    link: "https://portvia.netlify.app",
    image:
      "https://d33wubrfki0l68.cloudfront.net/6946a614f0295b00082c7383/screenshot_2025-12-20-13-35-46-0000.webp",
    description:
      "AI-accelerated developer portfolio builder and digital presence studio that converts GitHub commit streams, deployment telemetry, and verified certifications into interactive showcases.",
    role: "Full-Stack Creator",
    stats: [
      { label: "Portfolios Generated", value: 350, prefix: "+" },
      { label: "Deploy Time", value: 12, suffix: "s" },
      { label: "Custom Themes", value: 18, prefix: "" },
    ],
    features: [
      "Automated GitHub & Vercel telemetry ingestion for real-time live activity tracking",
      "Instant responsive layout generator supporting bespoke kinetic typography and dark mode",
      "One-click custom domain routing with integrated SSL termination and preview branches",
    ],
    visual: "portvia",
  },
];

export const PROJECTS: LiveProject[] = INITIAL_PROJECTS;
export default PROJECTS;

