import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";

export const revalidate = 300;

export interface GitHubRepoItem {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
  account: string;
}

export interface GitHubPushEventItem {
  repo: string;
  message: string;
  time: string;
}

export interface GitHubApiResponse {
  repos: GitHubRepoItem[];
  events: GitHubPushEventItem[];
  updatedAt?: string;
  error?: string | null;
}

interface GitHubRawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  html_url: string;
  owner?: {
    login: string;
  };
}

interface GitHubRawEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url?: string;
  };
  payload?: {
    commits?: Array<{
      message?: string;
      sha?: string;
    }>;
  };
  created_at: string;
}

// In-memory cache for last-good response
let lastGoodData: GitHubApiResponse | null = null;

export async function GET() {
  try {
    const token = env.GITHUB_TOKEN;
    const usernames = env.githubUsernames || (env.GITHUB_USERNAMES ? [env.GITHUB_USERNAMES] : ["abhishekverma0700"]);

    if (!usernames || usernames.length === 0) {
      const errMsg = "GITHUB_USERNAMES is not configured";
      if (lastGoodData) {
        return NextResponse.json({ ...lastGoodData, error: errMsg });
      }
      return NextResponse.json({ repos: [], events: [], error: errMsg });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "portfolio-github-fetcher",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const allReposMap = new Map<string, GitHubRepoItem>();
    const allPushEvents: GitHubPushEventItem[] = [];

    // Fetch repos and events across all specified accounts concurrently
    await Promise.all(
      usernames.map(async (username) => {
        // 1. Fetch public repositories
        const reposUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=public&sort=pushed&per_page=50`;
        const reposRes = await fetchJson<GitHubRawRepo[]>(reposUrl, { headers });

        if (reposRes.data && Array.isArray(reposRes.data)) {
          for (const item of reposRes.data) {
            if (!item || !item.name) continue;
            const key = (item.html_url || `${username}/${item.name}`).toLowerCase();
            // Deduplicate by repository URL / identifier
            if (!allReposMap.has(key)) {
              allReposMap.set(key, {
                name: item.name,
                description: item.description ?? null,
                language: item.language ?? null,
                stars: typeof item.stargazers_count === "number" ? item.stargazers_count : 0,
                pushedAt: item.pushed_at || new Date(0).toISOString(),
                url: item.html_url,
                account: item.owner?.login || username,
              });
            }
          }
        }

        // 2. Fetch public events
        const eventsUrl = `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`;
        const eventsRes = await fetchJson<GitHubRawEvent[]>(eventsUrl, { headers });

        if (eventsRes.data && Array.isArray(eventsRes.data)) {
          for (const ev of eventsRes.data) {
            if (ev?.type === "PushEvent" && ev.repo?.name) {
              const commitMessage = ev.payload?.commits?.[0]?.message || "Pushed commits";
              const cleanMessage = commitMessage.split("\n")[0].trim().slice(0, 150);

              allPushEvents.push({
                repo: ev.repo.name,
                message: cleanMessage,
                time: ev.created_at,
              });
            }
          }
        }
      })
    );

    // Sort repositories by pushed_at descending, take top 8
    const sortedRepos = Array.from(allReposMap.values())
      .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
      .slice(0, 8);

    // Sort push events by time descending, take top 8
    const sortedEvents = allPushEvents
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);

    const responsePayload: GitHubApiResponse = {
      repos: sortedRepos,
      events: sortedEvents,
      updatedAt: new Date().toISOString(),
      error: null,
    };

    // Store as last-good data if we successfully obtained data
    if (sortedRepos.length > 0 || sortedEvents.length > 0) {
      lastGoodData = responsePayload;
    } else if (lastGoodData) {
      return NextResponse.json({
        ...lastGoodData,
        error: "Serving cached GitHub activity",
      });
    }

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error fetching GitHub data";

    if (lastGoodData) {
      return NextResponse.json({
        ...lastGoodData,
        error: errorMessage,
      });
    }

    return NextResponse.json({
      repos: [],
      events: [],
      error: errorMessage,
    });
  }
}
