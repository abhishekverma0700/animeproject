import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";
import {
  PROJECT_CONFIGS,
  INITIAL_PROJECTS,
  LiveProject,
  ProjectConfig,
} from "@/data/projects";

export const revalidate = 600;

interface NetlifySite {
  id: string;
  name: string;
  ssl_url?: string;
  url?: string;
  screenshot_url?: string;
  published_deploy?: {
    id?: string;
    state?: string;
    created_at?: string;
    ssl_url?: string;
    url?: string;
  };
}

interface VercelProject {
  id: string;
  name: string;
  targets?: {
    production?: {
      alias?: string[];
      url?: string;
      readyState?: string;
      createdAt?: number;
    };
  };
  latestDeployments?: Array<{
    alias?: string[];
    url?: string;
    readyState?: string;
    createdAt?: number;
  }>;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  topics?: string[];
  stargazers_count: number;
  pushed_at: string;
  default_branch?: string;
  owner?: {
    login: string;
  };
}

interface GitHubReadmeResponse {
  name: string;
  content?: string;
  encoding?: string;
}

// In-memory fallback cache to guarantee 100% uptime
let lastGoodProjects: LiveProject[] = [...INITIAL_PROJECTS];

function cleanName(s: string): string {
  return (s || "").toLowerCase().replace(/[-_\s]/g, "");
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  return dp[m][n];
}

function matchesFuzzy(target: string, candidate: string, explicitHint?: string): boolean {
  if (!target || !candidate) return false;
  const cTarget = cleanName(target);
  const cCandidate = cleanName(candidate);

  if (cTarget === cCandidate) return true;
  if (explicitHint && cleanName(explicitHint) === cCandidate) return true;
  if (cCandidate.includes(cTarget) || cTarget.includes(cCandidate)) return true;

  // Stems / prefixes (e.g., "amala" prefix)
  if (cTarget.length >= 5 && cTarget.slice(0, 5) === cCandidate.slice(0, 5)) {
    return true;
  }

  // Levenshtein similarity threshold of >= 70%
  const dist = levenshteinDistance(cTarget, cCandidate);
  const maxLen = Math.max(cTarget.length, cCandidate.length);
  if (1 - dist / maxLen >= 0.70) return true;

  return false;
}

function extractMeaningfulReadmeParagraphs(rawContent: string): string {
  if (!rawContent) return "";

  const cleaned = rawContent
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove HTML tags
    .replace(/<[^>]*>/g, " ")
    // Remove image links [![alt](url)](url) or ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Strip markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove markdown headers
    .replace(/^#+\s+.*$/gm, "")
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove bold/italics
    .replace(/(\*\*|__|\*|_)/g, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .trim();

  // Split into paragraphs
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 35);

  const boilerplateKeywords = [
    "lovable",
    "ai studio",
    "run and deploy",
    "welcome to your",
    "how can i edit",
    "getting started",
    "npm run",
    "npm install",
    "yarn",
    "pnpm",
    "this contains everything you need to run",
    "click on the link below",
    "replace_with_project_id",
  ];

  const filtered = paragraphs.filter((p) => {
    const low = p.toLowerCase();
    return !boilerplateKeywords.some((term) => low.includes(term));
  });

  if (filtered.length === 0) return "";
  return filtered.slice(0, 2).join(" ");
}

export async function GET() {
  try {
    const netlifyToken = env.NETLIFY_TOKEN;
    const vercelToken = env.VERCEL_TOKEN;
    const vercelTeamId = env.VERCEL_TEAM_ID;
    const githubUser = env.githubUsernames?.[0] || "abhishekverma0700";
    const githubToken = env.GITHUB_TOKEN;

    // 1. Fetch Netlify Sites
    let netlifySites: NetlifySite[] = [];
    if (netlifyToken) {
      try {
        const netlifyRes = await fetchJson<NetlifySite[]>(
          "https://api.netlify.com/api/v1/sites",
          {
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
              "User-Agent": "PortfolioApp",
            },
            timeoutMs: 6000,
          }
        );
        if (Array.isArray(netlifyRes.data)) {
          netlifySites = netlifyRes.data;
        }
      } catch (err) {
        console.warn("[Projects API] Failed to fetch Netlify sites:", err);
      }
    }

    // 2. Fetch Vercel Projects
    let vercelProjects: VercelProject[] = [];
    if (vercelToken) {
      try {
        const teamParam = vercelTeamId ? `?teamId=${vercelTeamId}` : "";
        const vercelRes = await fetchJson<{ projects?: VercelProject[] }>(
          `https://api.vercel.com/v9/projects${teamParam}`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              "User-Agent": "PortfolioApp",
            },
            timeoutMs: 6000,
          }
        );
        if (Array.isArray(vercelRes.data?.projects)) {
          vercelProjects = vercelRes.data.projects;
        }
      } catch (err) {
        console.warn("[Projects API] Failed to fetch Vercel projects:", err);
      }
    }

    // 3. Fetch GitHub Repos
    let githubRepos: GitHubRepo[] = [];
    try {
      const ghHeaders: Record<string, string> = {
        "User-Agent": "PortfolioApp",
        Accept: "application/vnd.github.v3+json",
      };
      if (githubToken) {
        ghHeaders.Authorization = `Bearer ${githubToken}`;
      }
      const ghRes = await fetchJson<GitHubRepo[]>(
        `https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`,
        {
          headers: ghHeaders,
          timeoutMs: 6000,
        }
      );
      if (Array.isArray(ghRes.data)) {
        githubRepos = ghRes.data;
      }
    } catch (err) {
      console.warn("[Projects API] Failed to fetch GitHub repos:", err);
    }

    // 4. Resolve each ProjectConfig with per-project try/catch
    const resolvedProjects: LiveProject[] = await Promise.all(
      PROJECT_CONFIGS.map(async (config: ProjectConfig, idx: number): Promise<LiveProject> => {
        const projectIndexStr = String(idx + 1).padStart(2, "0");
        const fallbackProject = INITIAL_PROJECTS[idx] || {
          index: projectIndexStr,
          slug: config.slug,
          title: config.title,
          summary: config.summaryOverride || "Project under active development.",
          techTags: ["TypeScript", "React", "Next.js"],
          liveUrl: "",
          repoUrl: `https://github.com/${githubUser}/${config.githubRepo || config.slug}`,
          status: "COMING SOON" as const,
          thumbnail: "",
          accent: config.accent,
          isComingSoon: true,
        };

        try {
          // --- Match Netlify Site ---
          const matchedNetlify = netlifySites.find((site) =>
            matchesFuzzy(config.slug, site.name, config.netlifySite)
          );

          // --- Match Vercel Project ---
          const matchedVercel = vercelProjects.find((p) =>
            matchesFuzzy(config.slug, p.name, config.vercelProject)
          );

          // --- Match GitHub Repo ---
          const matchedRepo = githubRepos.find((r) =>
            matchesFuzzy(config.slug, r.name, config.githubRepo)
          );

          // Log matching status as requested
          if (matchedNetlify) {
            console.log(
              `[Projects API] Matched Netlify site '${matchedNetlify.name}' (${matchedNetlify.ssl_url}) for '${config.slug}'`
            );
          } else if (matchedVercel) {
            console.log(
              `[Projects API] Matched Vercel project '${matchedVercel.name}' for '${config.slug}'`
            );
          } else {
            console.log(
              `[Projects API] No live deployment site matched for '${config.slug}'`
            );
          }

          if (matchedRepo) {
            console.log(
              `[Projects API] Matched GitHub repo '${matchedRepo.name}' for '${config.slug}'`
            );
          } else {
            console.log(
              `[Projects API] No GitHub repo matched for '${config.slug}'`
            );
          }

          // If neither deployment nor repo matched, show coming soon state and never crash
          const hasMatchedResource = Boolean(matchedNetlify || matchedVercel || matchedRepo);
          if (!hasMatchedResource) {
            console.warn(
              `[Projects API] No resource matched for '${config.slug}', showing COMING SOON state`
            );
            return {
              ...fallbackProject,
              status: "COMING SOON",
              isComingSoon: true,
              matchedResource: { provider: "none" },
            };
          }

          // Determine Live URL and Deploy state
          let liveUrl = "";
          let deployedAt: string | undefined = undefined;
          let netlifyScreenshot: string | undefined = undefined;
          let deployState: "LIVE" | "BUILDING" | "COMING SOON" | "ERROR" = "LIVE";
          let provider: "netlify" | "vercel" | "none" = "none";
          let matchedSiteName: string | undefined = undefined;

          if (matchedNetlify) {
            provider = "netlify";
            matchedSiteName = matchedNetlify.name;
            liveUrl = matchedNetlify.ssl_url || matchedNetlify.url || "";
            netlifyScreenshot = matchedNetlify.screenshot_url;
            deployedAt = matchedNetlify.published_deploy?.created_at;

            const nState = (matchedNetlify.published_deploy?.state || "").toLowerCase();
            if (["ready", "current"].includes(nState)) {
              deployState = "LIVE";
            } else if (["building", "enqueued", "uploading"].includes(nState)) {
              deployState = "BUILDING";
            } else if (nState.length > 0) {
              deployState = "ERROR";
            }
          } else if (matchedVercel) {
            provider = "vercel";
            matchedSiteName = matchedVercel.name;
            const alias =
              matchedVercel.targets?.production?.alias?.[0] ||
              matchedVercel.latestDeployments?.[0]?.alias?.[0];
            const rawUrl =
              matchedVercel.targets?.production?.url ||
              matchedVercel.latestDeployments?.[0]?.url;

            if (alias) {
              liveUrl = `https://${alias}`;
            } else if (rawUrl) {
              liveUrl = `https://${rawUrl}`;
            } else {
              liveUrl = `https://${matchedVercel.name}.vercel.app`;
            }

            const vState = (
              matchedVercel.targets?.production?.readyState ||
              matchedVercel.latestDeployments?.[0]?.readyState ||
              ""
            ).toUpperCase();

            if (vState === "READY") {
              deployState = "LIVE";
            } else if (["BUILDING", "INITIALIZING", "QUEUED"].includes(vState)) {
              deployState = "BUILDING";
            } else if (vState.length > 0) {
              deployState = "ERROR";
            }

            const rawCreatedAt =
              matchedVercel.targets?.production?.createdAt ||
              matchedVercel.latestDeployments?.[0]?.createdAt;
            if (rawCreatedAt) {
              deployedAt = new Date(rawCreatedAt).toISOString();
            }
          }

          if (!liveUrl) {
            liveUrl = fallbackProject.liveUrl;
          }

          // Repo URL & Metadata
          const repoOwner = matchedRepo?.owner?.login || githubUser;
          const repoName = matchedRepo?.name || config.githubRepo || config.slug;
          const repoUrl = matchedRepo?.html_url || `https://github.com/${repoOwner}/${repoName}`;

          // Fetch repo languages & README if repo matched
          let techTags: string[] = fallbackProject.techTags;
          let parsedReadmeSummary = "";

          if (matchedRepo) {
            const ghHeaders: Record<string, string> = {
              "User-Agent": "PortfolioApp",
              Accept: "application/vnd.github.v3+json",
            };
            if (githubToken) {
              ghHeaders.Authorization = `Bearer ${githubToken}`;
            }

            // Fetch languages
            try {
              const langRes = await fetchJson<Record<string, number>>(
                `https://api.github.com/repos/${repoOwner}/${repoName}/languages`,
                { headers: ghHeaders, timeoutMs: 4000 }
              );
              if (langRes.data && typeof langRes.data === "object") {
                const langs = Object.keys(langRes.data).map((l) =>
                  l === "PLpgSQL" ? "PostgreSQL" : l
                );
                const topics = matchedRepo.topics || [];
                const combined = Array.from(
                  new Set([...langs, ...topics, ...(fallbackProject.techTags || [])])
                )
                  .filter((t) => !["HTML", "CSS"].includes(t) || langs.length <= 2)
                  .slice(0, 5);

                if (combined.length > 0) {
                  techTags = combined;
                }
              }
            } catch (err) {
              console.warn(`[Projects API] Languages fetch failed for ${repoName}:`, err);
            }

            // Fetch README
            try {
              const readmeRes = await fetchJson<GitHubReadmeResponse>(
                `https://api.github.com/repos/${repoOwner}/${repoName}/readme`,
                { headers: ghHeaders, timeoutMs: 4000 }
              );
              if (readmeRes.data?.content) {
                const decoded = Buffer.from(readmeRes.data.content, "base64").toString(
                  "utf8"
                );
                parsedReadmeSummary = extractMeaningfulReadmeParagraphs(decoded);
              }
            } catch (err) {
              console.warn(`[Projects API] Readme fetch failed for ${repoName}:`, err);
            }
          }

          // Determine Summary:
          // 2-3 plain-English lines from README / description, or summaryOverride
          let finalSummary = config.summaryOverride || fallbackProject.summary;
          if (parsedReadmeSummary && parsedReadmeSummary.length >= 60) {
            finalSummary = parsedReadmeSummary;
          } else if (matchedRepo?.description && matchedRepo.description.length >= 25) {
            finalSummary = matchedRepo.description;
          }

          // Determine Thumbnail
          let thumbnail = fallbackProject.thumbnail;
          if (netlifyScreenshot) {
            thumbnail = netlifyScreenshot;
          } else if (liveUrl) {
            thumbnail = `https://image.thum.io/get/width/1200/${liveUrl}`;
          }

          const resolved: LiveProject = {
            index: projectIndexStr,
            slug: config.slug,
            title: config.title,
            summary: finalSummary,
            techTags: techTags.length > 0 ? techTags : fallbackProject.techTags,
            liveUrl: liveUrl || fallbackProject.liveUrl,
            repoUrl,
            status: !liveUrl ? "COMING SOON" : deployState,
            deployedAt: deployedAt || fallbackProject.deployedAt,
            thumbnail: thumbnail || fallbackProject.thumbnail,
            accent: config.accent,
            matchedResource: {
              provider,
              siteName: matchedSiteName,
              repoName: matchedRepo?.name,
            },
            isComingSoon: !liveUrl,
            // Backwards compatibility aliases
            tags: techTags.length > 0 ? techTags : fallbackProject.techTags,
            link: liveUrl || fallbackProject.liveUrl,
            image: thumbnail || fallbackProject.thumbnail,
            description: finalSummary,
            role: fallbackProject.role,
            stats: fallbackProject.stats,
            features: fallbackProject.features,
            visual: fallbackProject.visual,
          };

          return resolved;
        } catch (err) {
          console.error(`[Projects API] Error resolving project '${config.slug}':`, err);
          return fallbackProject;
        }
      })
    );

    lastGoodProjects = resolvedProjects;

    return NextResponse.json(
      {
        projects: resolvedProjects,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("[Projects API] Fatal route error:", error);
    return NextResponse.json(
      {
        projects: lastGoodProjects,
        error: error instanceof Error ? error.message : "Internal Server Error",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
