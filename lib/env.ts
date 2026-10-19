/**
 * Environment variables configuration and validation.
 * Missing or empty environment variables return undefined, never throw.
 */

function cleanEnvVar(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface Env {
  GITHUB_TOKEN: string | undefined;
  GITHUB_USERNAMES: string | undefined;
  GITHUB_HEATMAP_USER: string | undefined;
  VERCEL_TOKEN: string | undefined;
  VERCEL_TEAM_ID: string | undefined;
  NETLIFY_TOKEN: string | undefined;
  CREDLY_USERNAME: string | undefined;
  WAKATIME_API_KEY: string | undefined;
}

/**
 * Returns a snapshot of validated environment variables.
 * Missing or empty values evaluate to undefined; never throws.
 */
export function getEnv(): Env {
  return {
    GITHUB_TOKEN: cleanEnvVar(process.env.GITHUB_TOKEN),
    GITHUB_USERNAMES: cleanEnvVar(process.env.GITHUB_USERNAMES),
    GITHUB_HEATMAP_USER: cleanEnvVar(process.env.GITHUB_HEATMAP_USER),
    VERCEL_TOKEN: cleanEnvVar(process.env.VERCEL_TOKEN),
    VERCEL_TEAM_ID: cleanEnvVar(process.env.VERCEL_TEAM_ID),
    NETLIFY_TOKEN: cleanEnvVar(process.env.NETLIFY_TOKEN),
    CREDLY_USERNAME: cleanEnvVar(process.env.CREDLY_USERNAME),
    WAKATIME_API_KEY: cleanEnvVar(process.env.WAKATIME_API_KEY),
  };
}

/**
 * Live accessor object for validated environment variables.
 * Reading properties returns string or undefined, never throws.
 */
export const env = {
  get GITHUB_TOKEN(): string | undefined {
    return cleanEnvVar(process.env.GITHUB_TOKEN);
  },
  get GITHUB_USERNAMES(): string | undefined {
    return cleanEnvVar(process.env.GITHUB_USERNAMES);
  },
  get GITHUB_HEATMAP_USER(): string | undefined {
    return cleanEnvVar(process.env.GITHUB_HEATMAP_USER);
  },
  get VERCEL_TOKEN(): string | undefined {
    return cleanEnvVar(process.env.VERCEL_TOKEN);
  },
  get VERCEL_TEAM_ID(): string | undefined {
    return cleanEnvVar(process.env.VERCEL_TEAM_ID);
  },
  get NETLIFY_TOKEN(): string | undefined {
    return cleanEnvVar(process.env.NETLIFY_TOKEN);
  },
  get CREDLY_USERNAME(): string | undefined {
    return cleanEnvVar(process.env.CREDLY_USERNAME);
  },
  get WAKATIME_API_KEY(): string | undefined {
    return cleanEnvVar(process.env.WAKATIME_API_KEY);
  },
  /**
   * Helper to parse GITHUB_USERNAMES into an array of trimmed usernames.
   * Returns undefined if GITHUB_USERNAMES is missing or empty.
   */
  get githubUsernames(): string[] | undefined {
    const raw = cleanEnvVar(process.env.GITHUB_USERNAMES);
    if (!raw) return undefined;
    const list = raw
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    return list.length > 0 ? list : undefined;
  },
};

export default env;
