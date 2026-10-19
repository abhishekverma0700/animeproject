import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";
import { vercelProjects, netlifySites } from "@/data/live";

export const revalidate = 120;

export type DeployStatus = "READY" | "BUILDING" | "ERROR";

export interface NormalizedDeploy {
  provider: "vercel" | "netlify";
  name: string;
  status: DeployStatus;
  branch: string;
  createdAt: string;
  url: string;
}

export interface DeploysApiResponse {
  deploys: NormalizedDeploy[];
  updatedAt?: string;
  errors?: {
    vercel?: string | null;
    netlify?: string | null;
  };
}

interface VercelRawDeployment {
  uid?: string;
  name?: string;
  url?: string;
  created?: number;
  createdAt?: string;
  state?: string;
  readyState?: string;
  meta?: {
    githubCommitRef?: string;
    gitlabCommitRef?: string;
    bitbucketCommitRef?: string;
    branch?: string;
  };
}

interface VercelResponse {
  deployments?: VercelRawDeployment[];
}

interface NetlifyRawDeploy {
  id?: string;
  state?: string;
  branch?: string;
  created_at?: string;
  ssl_url?: string;
  url?: string;
}

interface NetlifyRawSite {
  id: string;
  name: string;
  ssl_url?: string;
  url?: string;
  published_deploy?: NetlifyRawDeploy;
  build_settings?: {
    repo_branch?: string;
  };
}

function normalizeVercelStatus(readyState?: string, state?: string): DeployStatus {
  const s = (readyState || state || "").toUpperCase();
  if (s === "READY") return "READY";
  if (["BUILDING", "INITIALIZING", "QUEUED"].includes(s)) return "BUILDING";
  return "ERROR";
}

function normalizeNetlifyStatus(state?: string): DeployStatus {
  const s = (state || "").toLowerCase();
  if (["ready", "current"].includes(s)) return "READY";
  if (["building", "enqueued", "processing", "uploading", "uploaded", "new"].includes(s)) {
    return "BUILDING";
  }
  return "ERROR";
}

// In-memory last-good caches per provider
let lastGoodVercel: NormalizedDeploy[] = [];
let lastGoodNetlify: NormalizedDeploy[] = [];

export async function GET() {
  const errors: { vercel?: string | null; netlify?: string | null } = {};

  // 1. Fetch Vercel deployments
  const fetchVercel = async (): Promise<NormalizedDeploy[]> => {
    const token = env.VERCEL_TOKEN;
    if (!token) {
      errors.vercel = "VERCEL_TOKEN is not configured";
      return lastGoodVercel;
    }

    try {
      const url = "https://api.vercel.com/v6/deployments?limit=20";
      const res = await fetchJson<VercelResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "portfolio-deploys-fetcher",
        },
      });

      if (res.error || !res.data) {
        errors.vercel = res.error || "Failed to fetch Vercel deployments";
        return lastGoodVercel;
      }

      const rawDeployments = res.data.deployments || [];
      const whitelist = new Set(vercelProjects.map((p) => p.toLowerCase()));
      const latestByProject = new Map<string, NormalizedDeploy>();

      for (const dep of rawDeployments) {
        if (!dep || !dep.name) continue;
        const projectKey = dep.name.toLowerCase();

        // Filter against data/live.ts whitelist if specified
        if (whitelist.size > 0 && !whitelist.has(projectKey)) continue;

        // Keep only the latest deployment per project
        if (!latestByProject.has(projectKey)) {
          const rawUrl = dep.url || "";
          const fullUrl = rawUrl.startsWith("http")
            ? rawUrl
            : rawUrl
            ? `https://${rawUrl}`
            : "";

          const branch =
            dep.meta?.githubCommitRef ||
            dep.meta?.branch ||
            dep.meta?.gitlabCommitRef ||
            dep.meta?.bitbucketCommitRef ||
            "main";

          const createdAt = dep.created
            ? new Date(dep.created).toISOString()
            : dep.createdAt || new Date().toISOString();

          latestByProject.set(projectKey, {
            provider: "vercel",
            name: dep.name,
            status: normalizeVercelStatus(dep.readyState, dep.state),
            branch,
            createdAt,
            url: fullUrl,
          });
        }
      }

      const results = Array.from(latestByProject.values());
      lastGoodVercel = results;
      return results;
    } catch (err: unknown) {
      errors.vercel = err instanceof Error ? err.message : "Error querying Vercel API";
      return lastGoodVercel;
    }
  };

  // 2. Fetch Netlify deployments
  const fetchNetlify = async (): Promise<NormalizedDeploy[]> => {
    const token = env.NETLIFY_TOKEN;
    if (!token) {
      errors.netlify = "NETLIFY_TOKEN is not configured";
      return lastGoodNetlify;
    }

    try {
      const sitesUrl = "https://api.netlify.com/api/v1/sites";
      const sitesRes = await fetchJson<NetlifyRawSite[]>(sitesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "portfolio-deploys-fetcher",
        },
      });

      if (sitesRes.error || !sitesRes.data || !Array.isArray(sitesRes.data)) {
        errors.netlify = sitesRes.error || "Failed to fetch Netlify sites";
        return lastGoodNetlify;
      }

      const whitelist = new Set(netlifySites.map((s) => s.toLowerCase()));
      const matchingSites = sitesRes.data.filter(
        (site) =>
          site &&
          (whitelist.size === 0 ||
            whitelist.has((site.name || "").toLowerCase()) ||
            whitelist.has((site.id || "").toLowerCase()))
      );

      // Fetch the latest deploy for each whitelisted site concurrently
      const siteDeploys = await Promise.all(
        matchingSites.map(async (site): Promise<NormalizedDeploy | null> => {
          let latestDeploy: NetlifyRawDeploy | undefined;

          // Attempt to fetch latest deploy via deploys endpoint
          const deploysUrl = `https://api.netlify.com/api/v1/sites/${encodeURIComponent(site.id)}/deploys?per_page=1`;
          const depRes = await fetchJson<NetlifyRawDeploy[]>(deploysUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "portfolio-deploys-fetcher",
            },
          });

          if (depRes.data && Array.isArray(depRes.data) && depRes.data[0]) {
            latestDeploy = depRes.data[0];
          } else {
            // Fall back to site.published_deploy if available
            latestDeploy = site.published_deploy;
          }

          if (!latestDeploy) return null;

          const branch =
            latestDeploy.branch ||
            site.build_settings?.repo_branch ||
            "main";

          const createdAt = latestDeploy.created_at || new Date().toISOString();
          const rawUrl =
            latestDeploy.ssl_url ||
            latestDeploy.url ||
            site.ssl_url ||
            site.url ||
            "";
          const fullUrl = rawUrl.startsWith("http")
            ? rawUrl
            : rawUrl
            ? `https://${rawUrl}`
            : "";

          return {
            provider: "netlify",
            name: site.name,
            status: normalizeNetlifyStatus(latestDeploy.state),
            branch,
            createdAt,
            url: fullUrl,
          };
        })
      );

      const results = siteDeploys.filter((d): d is NormalizedDeploy => d !== null);
      lastGoodNetlify = results;
      return results;
    } catch (err: unknown) {
      errors.netlify = err instanceof Error ? err.message : "Error querying Netlify API";
      return lastGoodNetlify;
    }
  };

  // Run both provider fetches concurrently; one provider failing must not break the other
  const [vercelResults, netlifyResults] = await Promise.all([
    fetchVercel(),
    fetchNetlify(),
  ]);

  const allDeploys = [...vercelResults, ...netlifyResults].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    deploys: allDeploys,
    updatedAt: new Date().toISOString(),
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
