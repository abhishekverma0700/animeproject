import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";
import { CERTIFICATIONS } from "@/data/certifications";

export const revalidate = 3600;

export interface NormalizedBadge {
  title: string;
  issuer: string;
  image: string;
  issuedAt: string;
  url: string;
}

export interface BadgesApiResponse {
  badges: NormalizedBadge[];
  updatedAt?: string;
  source?: "credly" | "manual" | "merged";
  error?: string | null;
}

interface CredlyEntity {
  label?: string;
  primary?: boolean;
  entity?: {
    name?: string;
  };
}

interface CredlyBadgeTemplate {
  name?: string;
  description?: string;
  image_url?: string;
  image?: {
    url?: string;
  };
  url?: string;
  issuer?: {
    summary?: string;
    entities?: CredlyEntity[];
  };
}

interface CredlyRawBadge {
  id: string;
  issued_at?: string;
  issued_at_date?: string;
  created_at?: string;
  name?: string;
  title?: string;
  image_url?: string;
  url?: string;
  badge_template?: CredlyBadgeTemplate;
}

interface CredlyResponse {
  data?: CredlyRawBadge[];
}

function normalizeTitleKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getManualBadges(): NormalizedBadge[] {
  return CERTIFICATIONS.map((cert) => {
    // Format year as an ISO date string for consistent sorting
    const yearNumber = parseInt(cert.year, 10);
    const issuedDate = !isNaN(yearNumber)
      ? new Date(Date.UTC(yearNumber, 0, 1)).toISOString()
      : new Date().toISOString();

    return {
      title: cert.title,
      issuer: cert.issuer,
      image: "",
      issuedAt: issuedDate,
      url: cert.verifyUrl,
    };
  });
}

// In-memory cache for last-good merged badges
let lastGoodData: NormalizedBadge[] | null = null;

export async function GET() {
  const manualBadges = getManualBadges();

  try {
    const credlyUsername = env.CREDLY_USERNAME;

    // If no CREDLY_USERNAME is configured, return manual fallback entries
    if (!credlyUsername) {
      const sortedManual = [...manualBadges].sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      );
      lastGoodData = sortedManual;
      return NextResponse.json({
        badges: sortedManual,
        source: "manual",
        updatedAt: new Date().toISOString(),
        error: null,
      });
    }

    const credlyUrl = `https://www.credly.com/users/${encodeURIComponent(credlyUsername)}/badges.json`;
    const res = await fetchJson<CredlyResponse>(credlyUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const credlyRawList = res.data?.data;
    const credlyBadges: NormalizedBadge[] = [];

    if (credlyRawList && Array.isArray(credlyRawList)) {
      for (const item of credlyRawList) {
        if (!item) continue;
        const template = item.badge_template;
        const title = template?.name || item.name || item.title || "Certification";

        // Determine issuer name
        const issuer =
          template?.issuer?.entities?.[0]?.entity?.name ||
          template?.issuer?.summary ||
          "Credly";

        // Determine image URL
        const image =
          template?.image_url ||
          template?.image?.url ||
          item.image_url ||
          "";

        // Determine issue date
        const issuedAt =
          item.issued_at ||
          item.issued_at_date ||
          item.created_at ||
          new Date().toISOString();

        // Verification link
        const url = item.id
          ? `https://www.credly.com/badges/${item.id}`
          : item.url || template?.url || "https://www.credly.com";

        credlyBadges.push({
          title,
          issuer,
          image,
          issuedAt,
          url,
        });
      }
    }

    // Merge: Credly badges take precedence, manual entries fill in remaining ones
    const seenTitles = new Set<string>();
    const mergedList: NormalizedBadge[] = [];

    for (const badge of credlyBadges) {
      const key = normalizeTitleKey(badge.title);
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        mergedList.push(badge);
      }
    }

    for (const manual of manualBadges) {
      const key = normalizeTitleKey(manual.title);
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        mergedList.push(manual);
      }
    }

    // Sort newest first
    mergedList.sort(
      (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );

    lastGoodData = mergedList;

    return NextResponse.json({
      badges: mergedList,
      source: credlyBadges.length > 0 ? "merged" : "manual",
      updatedAt: new Date().toISOString(),
      error: res.error ?? null,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error fetching Credly badges";

    const fallback =
      lastGoodData ||
      [...manualBadges].sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      );

    return NextResponse.json({
      badges: fallback,
      source: "manual",
      updatedAt: new Date().toISOString(),
      error: errorMessage,
    });
  }
}
