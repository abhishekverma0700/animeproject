import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";

export const revalidate = 300;

export interface HeatmapDay {
  date: string;
  count: number;
  level?: string;
  color?: string;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export interface HeatmapApiResponse {
  total: number;
  totalContributions: number;
  weeks: HeatmapWeek[];
  days: HeatmapDay[];
  user?: string;
  updatedAt?: string;
  error?: string | null;
}

interface GraphQLContributionDay {
  date: string;
  contributionCount: number;
  color?: string;
  contributionLevel?: string;
}

interface GraphQLContributionWeek {
  contributionDays: GraphQLContributionDay[];
}

interface GraphQLContributionData {
  user?: {
    contributionsCollection?: {
      contributionCalendar?: {
        totalContributions: number;
        weeks: GraphQLContributionWeek[];
      };
    };
  } | null;
}

interface GraphQLResponse {
  data?: GraphQLContributionData;
  errors?: Array<{ message: string }>;
}

const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// In-memory cache for last-good response
let lastGoodData: HeatmapApiResponse | null = null;

// Helper to generate a baseline 52-week calendar (364 days) ending today
function generateFallbackCalendar(): { weeks: HeatmapWeek[]; days: HeatmapDay[] } {
  const weeks: HeatmapWeek[] = [];
  const allDays: HeatmapDay[] = [];
  const now = new Date();
  const totalDays = 52 * 7;
  const startDate = new Date(now.getTime() - totalDays * 24 * 60 * 60 * 1000);

  for (let w = 0; w < 52; w++) {
    const weekDays: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const current = new Date(startDate.getTime() + (w * 7 + d) * 24 * 60 * 60 * 1000);
      const dateStr = current.toISOString().slice(0, 10);
      const day: HeatmapDay = {
        date: dateStr,
        count: 0,
        level: "0",
        color: "#181818",
      };
      weekDays.push(day);
      allDays.push(day);
    }
    weeks.push({ days: weekDays });
  }

  return { weeks, days: allDays };
}

// Scrape public GitHub contribution calendar HTML
function parsePublicContributionsHtml(html: string): {
  total: number;
  weeks: HeatmapWeek[];
  days: HeatmapDay[];
} | null {
  try {
    // 1. Total contributions
    const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in/i);
    const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

    // 2. Parse td day cells: data-date & data-level
    const tdRegex = /<td\b([^>]*)>/gi;
    const days: HeatmapDay[] = [];
    let match: RegExpExecArray | null;

    while ((match = tdRegex.exec(html)) !== null) {
      const attrs = match[1];
      const dateMatch = attrs.match(/data-date="(\d{4}-\d{2}-\d{2})"/i);
      if (!dateMatch) continue;

      const date = dateMatch[1];
      const levelMatch = attrs.match(/data-level="(\d+)"/i);
      const level = levelMatch ? levelMatch[1] : "0";

      let count = 0;
      if (level === "1") count = 1;
      else if (level === "2") count = 3;
      else if (level === "3") count = 6;
      else if (level === "4") count = 10;

      days.push({
        date,
        count,
        level,
        color:
          level === "4"
            ? "#34d399"
            : level === "3"
            ? "#10b981"
            : level === "2"
            ? "#059669"
            : level === "1"
            ? "#064e3b"
            : "#181818",
      });
    }

    if (days.length === 0) return null;

    // Sort days chronologically
    days.sort((a, b) => a.date.localeCompare(b.date));

    // Group into 7-day weeks
    const weeks: HeatmapWeek[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push({
        days: days.slice(i, i + 7),
      });
    }

    return { total, weeks, days };
  } catch {
    return null;
  }
}

export async function GET() {
  const fallback = generateFallbackCalendar();
  const heatmapUser =
    env.GITHUB_HEATMAP_USER ||
    env.githubUsernames?.[0] ||
    (env.GITHUB_USERNAMES ? env.GITHUB_USERNAMES.split(",")[0].trim() : "abhishekverma0700");

  try {
    const token = env.GITHUB_TOKEN;

    // 1. If GITHUB_TOKEN is available, use GraphQL API
    if (token) {
      const res = await fetchJson<GraphQLResponse>("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "portfolio-github-heatmap",
        },
        body: JSON.stringify({
          query: CONTRIBUTIONS_QUERY,
          variables: { login: heatmapUser },
        }),
      });

      if (!res.error && !res.data?.errors?.length && res.data?.data?.user?.contributionsCollection?.contributionCalendar) {
        const calendar = res.data.data.user.contributionsCollection.contributionCalendar;
        const weeks: HeatmapWeek[] = (calendar.weeks || []).map((w) => ({
          days: (w.contributionDays || []).map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: d.contributionLevel,
            color: d.color,
          })),
        }));

        if (weeks.length > 0) {
          const allDays: HeatmapDay[] = weeks.flatMap((w) => w.days);
          const total = calendar.totalContributions || 0;

          const responsePayload: HeatmapApiResponse = {
            total,
            totalContributions: total,
            weeks,
            days: allDays,
            user: heatmapUser,
            updatedAt: new Date().toISOString(),
            error: null,
          };

          lastGoodData = responsePayload;
          return NextResponse.json(responsePayload);
        }
      }
    }

    // 2. Fallback to public GitHub profile contributions page
    try {
      const publicUrl = `https://github.com/users/${encodeURIComponent(heatmapUser)}/contributions`;
      const htmlRes = await fetch(publicUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PortfolioBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        next: { revalidate: 300 },
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const parsed = parsePublicContributionsHtml(html);

        if (parsed && parsed.weeks.length > 0) {
          const responsePayload: HeatmapApiResponse = {
            total: parsed.total,
            totalContributions: parsed.total,
            weeks: parsed.weeks,
            days: parsed.days,
            user: heatmapUser,
            updatedAt: new Date().toISOString(),
            error: null,
          };

          lastGoodData = responsePayload;
          return NextResponse.json(responsePayload);
        }
      }
    } catch {
      // Public fetch failed or rate-limited; proceed to cached/baseline fallback
    }

    // 3. Return last-good data if available
    if (lastGoodData && lastGoodData.weeks.length > 0) {
      return NextResponse.json({
        ...lastGoodData,
        error: "Serving cached contribution calendar",
      });
    }

    // 4. Return generated baseline 52-week calendar so UI grid never renders blank
    return NextResponse.json({
      total: 0,
      totalContributions: 0,
      weeks: fallback.weeks,
      days: fallback.days,
      user: heatmapUser,
      updatedAt: new Date().toISOString(),
      error: token ? "Live contributions temporarily unavailable" : "GITHUB_TOKEN not configured; showing baseline grid",
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error fetching contribution heatmap";

    if (lastGoodData && lastGoodData.weeks.length > 0) {
      return NextResponse.json({
        ...lastGoodData,
        error: errorMessage,
      });
    }

    return NextResponse.json({
      total: 0,
      totalContributions: 0,
      weeks: fallback.weeks,
      days: fallback.days,
      user: heatmapUser,
      updatedAt: new Date().toISOString(),
      error: errorMessage,
    });
  }
}
