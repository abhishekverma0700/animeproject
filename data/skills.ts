export interface SkillItem {
  id: string;
  name: string;
  note: string;
}

export interface SkillCategory {
  id: string;
  number: string;
  title: string;
  accent: string;
  skills: SkillItem[];
}

export interface SkillsSectionData {
  sectionLabel: string;
  sectionNumber: string;
  headingLine1: string;
  headingLine2: string;
  categories: SkillCategory[];
  marqueeSkills: string[];
}

export const SKILLS_DATA: SkillsSectionData = {
  sectionLabel: "(STACK)",
  sectionNumber: "03 // TECHNICAL ARSENAL",
  headingLine1: "TOOLS /",
  headingLine2: "I BUILD WITH",
  categories: [
    {
      id: "frontend",
      number: "01",
      title: "FRONTEND",
      accent: "#38bdf8",
      skills: [
        {
          id: "nextjs",
          name: "Next.js",
          note: "App Router, SSR & ISR in production",
        },
        {
          id: "react",
          name: "React",
          note: "Concurrent features, custom hooks & state",
        },
        {
          id: "typescript",
          name: "TypeScript",
          note: "Strict type-safety across full stack",
        },
        {
          id: "tailwind",
          name: "Tailwind",
          note: "Design systems & responsive layouts",
        },
        {
          id: "gsap",
          name: "GSAP",
          note: "ScrollTrigger & 60fps editorial timelines",
        },
        {
          id: "threejs",
          name: "Three.js",
          note: "WebGL particles, shaders & 3D canvases",
        },
      ],
    },
    {
      id: "backend",
      number: "02",
      title: "BACKEND",
      accent: "#34d399",
      skills: [
        {
          id: "nestjs",
          name: "NestJS",
          note: "Used in InjuryConnect & enterprise APIs",
        },
        {
          id: "nodejs",
          name: "Node.js",
          note: "Event-driven asynchronous microservices",
        },
        {
          id: "postgresql",
          name: "PostgreSQL",
          note: "Complex schemas, indexing & transactions",
        },
        {
          id: "prisma",
          name: "Prisma",
          note: "Type-safe ORM models & database migrations",
        },
        {
          id: "redis",
          name: "Redis",
          note: "Distributed caching, rate limiting & pub/sub",
        },
        {
          id: "bullmq",
          name: "BullMQ",
          note: "Resilient asynchronous job queues & workers",
        },
      ],
    },
    {
      id: "cloud",
      number: "03",
      title: "CLOUD & DEVOPS",
      accent: "#a78bfa",
      skills: [
        {
          id: "aws-ecs",
          name: "AWS ECS",
          note: "Containerized tasks, Fargate & auto-scaling",
        },
        {
          id: "aws-rds",
          name: "RDS",
          note: "Multi-AZ PostgreSQL high availability",
        },
        {
          id: "aws-s3",
          name: "S3",
          note: "Secure bucket storage & asset distribution",
        },
        {
          id: "elasticache",
          name: "ElastiCache",
          note: "Low-latency Redis clusters in VPC",
        },
        {
          id: "docker",
          name: "Docker",
          note: "Multi-stage production image containerization",
        },
        {
          id: "vercel",
          name: "Vercel",
          note: "Edge middleware, analytics & CI/CD deployments",
        },
      ],
    },
    {
      id: "tools",
      number: "04",
      title: "TOOLS & AI",
      accent: "#fbbf24",
      skills: [
        {
          id: "claude-code",
          name: "Claude Code",
          note: "Agentic coding & CLI workflow automation",
        },
        {
          id: "cursor",
          name: "Cursor",
          note: "AI-native engineering & context indexing",
        },
        {
          id: "git",
          name: "Git",
          note: "Trunk-based workflow, rebasing & releases",
        },
        {
          id: "postman",
          name: "Postman",
          note: "Contract validation & automated regression",
        },
        {
          id: "figma",
          name: "Figma",
          note: "Component systems, specs & prototype handoff",
        },
      ],
    },
  ],
  marqueeSkills: [
    "NEXT.JS",
    "REACT",
    "TYPESCRIPT",
    "TAILWIND",
    "GSAP",
    "THREE.JS",
    "NESTJS",
    "NODE.JS",
    "POSTGRESQL",
    "PRISMA",
    "REDIS",
    "BULLMQ",
    "AWS ECS",
    "RDS",
    "S3",
    "ELASTICACHE",
    "DOCKER",
    "VERCEL",
    "CLAUDE CODE",
    "CURSOR",
    "GIT",
    "POSTMAN",
    "FIGMA",
  ],
};
