export interface ProjectStat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface Project {
  index: string;
  title: string;
  description: string;
  summary: string;
  logo?: string;
  visual: "injuryconnect" | "synapse" | "kronos" | "voxmetric";
  tags: string[];
  image: string;
  video?: string;
  link: string;
  accent: string;
  role: string;
  features: string[];
  stats: ProjectStat[];
  gallery?: string[];
}

export const PROJECTS: Project[] = [
  {
    index: "01",
    title: "INJURYCONNECT",
    description:
      "Attorney communication & clinical intelligence platform orchestrating legal caseloads, medical record intake, and automated litigation triage.",
    summary:
      "Connects personal injury law firms directly with medical clinics to eliminate paperwork delays. Automates clinical record intake, extracts injury severity with OCR, and lets attorneys message clients in real time.",
    logo: "/projects/norbu-logo.svg",
    visual: "injuryconnect",
    tags: ["NestJS", "Next.js", "Postgres", "AWS"],
    image: "/projects/injuryconnect.svg",
    video: "/projects/injuryconnect.mp4",
    link: "https://injuryconnect.example.com",
    accent: "#38bdf8", // Electric Blue
    role: "Lead Full-Stack Architect & Engineering Lead",
    features: [
      "Automated OCR clinical extraction with HIPAA-compliant audit trails and end-to-end encryption.",
      "Real-time WebSocket attorney-client messaging portal with low-latency push queues.",
      "Automated case score indexing using pgvector similarity search on injury patterns.",
    ],
    stats: [
      { label: "CASES INGESTED", value: 148, prefix: "", suffix: "k+" },
      { label: "TRIAGE ACCURACY", value: 99.4, prefix: "", suffix: "%" },
      { label: "PROCESSING TIME", value: 4.2, prefix: "", suffix: "s" },
    ],
    gallery: [
      "/projects/injuryconnect.svg",
      "/projects/synapse.svg",
      "/projects/kronos.svg",
    ],
  },
  {
    index: "02",
    title: "SYNAPSE AI",
    description:
      "Autonomous multi-agent research and reasoning pipeline integrating vector similarity lookups, RAG ingestion, and real-time streaming.",
    summary:
      "An autonomous swarm of specialized AI agents that collaborates on complex market and technical research. Coordinates multi-hop vector search, synthesizes findings, and streams verified answers in milliseconds.",
    visual: "synapse",
    tags: ["Python", "FastAPI", "Pinecone", "LangChain"],
    image: "/projects/synapse.svg",
    link: "https://synapse.example.com",
    accent: "#a855f7", // Deep Purple
    role: "AI Systems Engineer & Distributed Architecture",
    features: [
      "Dynamic multi-agent supervisor orchestrating autonomous research workflows.",
      "Hybrid vector + BM25 keyword search yielding sub-80ms semantic retrieval.",
      "Server-sent events (SSE) streaming engine delivering real-time agent token telemetry.",
    ],
    stats: [
      { label: "AGENTS DEPLOYED", value: 1240, prefix: "", suffix: "+" },
      { label: "EMBEDDINGS INDEXED", value: 84, prefix: "", suffix: "M" },
      { label: "P99 RETRIEVAL", value: 112, prefix: "", suffix: "ms" },
    ],
    gallery: [
      "/projects/synapse.svg",
      "/projects/voxmetric.svg",
      "/projects/injuryconnect.svg",
    ],
  },
  {
    index: "03",
    title: "KRONOS CLOUD",
    description:
      "Ultra-low latency financial telemetry engine handling 120k events/sec with distributed event queues and partition-tolerant caches.",
    summary:
      "A real-time financial telemetry platform processing over 120,000 transactions per second. Replaces batch ETL jobs with instant Kafka streaming queues, fault-tolerant Redis caching, and automated drift recovery.",
    visual: "kronos",
    tags: ["Go", "Kafka", "Redis", "Terraform"],
    image: "/projects/kronos.svg",
    link: "https://kronos.example.com",
    accent: "#10b981", // Emerald Neon
    role: "Principal Infrastructure & Backend Engineer",
    features: [
      "High-throughput event ingest pipeline processing 120,000 transactions/second with zero dropped messages.",
      "Multi-region Kafka cluster topology orchestrated with automated Terraform drift correction.",
      "In-memory Redis pipeline caching layer cutting API latency from 45ms to 1.8ms.",
    ],
    stats: [
      { label: "THROUGHPUT PEAK", value: 120, prefix: "", suffix: "k/s" },
      { label: "ACTIVE REGIONS", value: 64, prefix: "", suffix: " pts" },
      { label: "SYSTEM UPTIME", value: 99.999, prefix: "", suffix: "%" },
    ],
    gallery: [
      "/projects/kronos.svg",
      "/projects/injuryconnect.svg",
      "/projects/voxmetric.svg",
    ],
  },
  {
    index: "04",
    title: "VOX METRIC",
    description:
      "Full-stack observability suite providing continuous runtime tracing, automated query anomaly detection, and synthetic health probes.",
    summary:
      "Full-stack observability suite that monitors distributed services, tracks API bottlenecks, and detects performance anomalies before outages happen. Analyzes billions of traces with sub-second queries.",
    visual: "voxmetric",
    tags: ["TypeScript", "ClickHouse", "GraphQL", "Docker"],
    image: "/projects/voxmetric.svg",
    link: "https://voxmetric.example.com",
    accent: "#f59e0b", // Amber Glow
    role: "Systems Architect & Full-Stack Developer",
    features: [
      "Distributed OpenTelemetry span collector aggregating 2.4 billion daily RPC calls.",
      "Columnar ClickHouse analytical store providing instant aggregation over petabyte datasets.",
      "Custom GraphQL schema federation uniting heterogeneous microservice traces into a unified graph.",
    ],
    stats: [
      { label: "DAILY TRACES", value: 2.4, prefix: "", suffix: "B" },
      { label: "STORAGE REDUCTION", value: 74, prefix: "", suffix: "%" },
      { label: "QUERY ANOMALIES", value: 0, prefix: "<", suffix: "0.1%" },
    ],
    gallery: [
      "/projects/voxmetric.svg",
      "/projects/kronos.svg",
      "/projects/synapse.svg",
    ],
  },
];
