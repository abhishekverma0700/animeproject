export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  credentialId: string;
  accent: string;
  details: string;
  skills: string[];
  verifyUrl: string;
}

/**
 * 6 clearly marked PLACEHOLDER entries.
 * Replace with your real certifications, credential IDs, and verification URLs.
 */
export const CERTIFICATIONS: Certification[] = [
  {
    // [PLACEHOLDER 01 - Replace with your credential]
    id: "cert-01",
    title: "AWS CERTIFIED SOLUTIONS ARCHITECT",
    issuer: "AMAZON WEB SERVICES",
    year: "2024",
    credentialId: "AWS-SAA-PLACEHOLDER-01",
    accent: "#f59e0b", // Amber / AWS Gold
    details:
      "Comprehensive validation of high-availability cloud architectures, VPC networking topologies, multi-tier microservices, automated disaster recovery, and cost-optimized distributed storage systems.",
    skills: [
      "Cloud Architecture",
      "AWS VPC & Transit Gateway",
      "S3 & DynamoDB",
      "IAM & KMS Security",
      "Auto Scaling & ECS",
    ],
    verifyUrl: "https://aws.amazon.com/verification?id=AWS-SAA-PLACEHOLDER-01",
  },
  {
    // [PLACEHOLDER 02 - Replace with your credential]
    id: "cert-02",
    title: "META SENIOR FRONTEND DEVELOPER",
    issuer: "META / COURSERA",
    year: "2024",
    credentialId: "META-FED-PLACEHOLDER-02",
    accent: "#06b6d4", // Cyan
    details:
      "Advanced mastery of production React 18 & Next.js architectures, concurrent rendering pipelines, complex client-side state machines, Core Web Vitals optimization, and enterprise design systems.",
    skills: [
      "React 18 & Next.js",
      "Performance Optimization",
      "State Machines",
      "Design Systems",
      "Accessibility & A11y",
    ],
    verifyUrl: "https://coursera.org/verify/META-FED-PLACEHOLDER-02",
  },
  {
    // [PLACEHOLDER 03 - Replace with your credential]
    id: "cert-03",
    title: "GOOGLE CLOUD PROFESSIONAL ARCHITECT",
    issuer: "GOOGLE CLOUD",
    year: "2023",
    credentialId: "GCP-PCA-PLACEHOLDER-03",
    accent: "#38bdf8", // Sky Blue
    details:
      "Enterprise infrastructure design on Google Cloud Platform, Google Kubernetes Engine (GKE) cluster automation, hybrid interconnects, BigQuery data pipelines, and zero-trust IAM policies.",
    skills: [
      "Google Kubernetes Engine",
      "GCP Cloud Networking",
      "BigQuery & Dataflow",
      "Terraform IaC",
      "Zero-Trust IAM",
    ],
    verifyUrl: "https://cloud.google.com/certification?id=GCP-PCA-PLACEHOLDER-03",
  },
  {
    // [PLACEHOLDER 04 - Replace with your credential]
    id: "cert-04",
    title: "CERTIFIED KUBERNETES ADMINISTRATOR",
    issuer: "CNCF / LINUX FOUNDATION",
    year: "2023",
    credentialId: "CNCF-CKA-PLACEHOLDER-04",
    accent: "#34d399", // Emerald Green
    details:
      "Hands-on demonstration of Kubernetes cluster administration, multi-node deployment, pod networking with CNI, etcd backup/restore, ingress controllers, RBAC policies, and cluster troubleshooting.",
    skills: [
      "Kubernetes Core",
      "CNI & CoreDNS",
      "etcd Disaster Recovery",
      "Helm Orchestration",
      "RBAC & Security",
    ],
    verifyUrl: "https://www.cncf.io/certification/cka?id=CNCF-CKA-PLACEHOLDER-04",
  },
  {
    // [PLACEHOLDER 05 - Replace with your credential]
    id: "cert-05",
    title: "DEEP LEARNING SPECIALIZATION",
    issuer: "DEEPLEARNING.AI",
    year: "2023",
    credentialId: "DLAI-DLS-PLACEHOLDER-05",
    accent: "#ec4899", // Pink / Fuchsia
    details:
      "Foundational theory and implementation of neural network architectures, transformers, self-attention mechanisms, convolutional vision models, vector embeddings, and LLM fine-tuning pipelines.",
    skills: [
      "PyTorch & TensorFlow",
      "Transformer Models",
      "LLM Fine-Tuning",
      "Vector Embeddings",
      "Model Quantization",
    ],
    verifyUrl: "https://deeplearning.ai/verify?id=DLAI-DLS-PLACEHOLDER-05",
  },
  {
    // [PLACEHOLDER 06 - Replace with your credential]
    id: "cert-06",
    title: "HASHICORP TERRAFORM ASSOCIATE",
    issuer: "HASHICORP",
    year: "2022",
    credentialId: "HASHI-TA-PLACEHOLDER-06",
    accent: "#a855f7", // Purple
    details:
      "Declarative Infrastructure as Code (IaC) principles, state file isolation and locking, custom modular architecture development, multi-cloud cloud provisioning, and automated GitOps CI/CD pipelines.",
    skills: [
      "Terraform HCL",
      "State Management",
      "Modular IaC Architecture",
      "Multi-Cloud Provisioning",
      "GitOps CI/CD",
    ],
    verifyUrl: "https://hashicorp.com/certification?id=HASHI-TA-PLACEHOLDER-06",
  },
];
