/**
 * Live integrations whitelist and external links configuration.
 * Contains whitelists for real-time portfolio data sources (Vercel, Netlify)
 * and verified personal links.
 */

/**
 * Whitelist array of personal Vercel project identifiers / names.
 * Only projects listed here will be surfaced from Vercel APIs.
 */
export const vercelProjects: string[] = [
  "portfolio",
  "animeproject",
  "conversiq",
  "prompt-playground-forge",
  "portvia",
  "eduava",
  "ranitraders",
  "vikashportfolio",
  "injuryconnect",
  "voxmetric",
  "kronos",
  "synapse",
];

/**
 * Whitelist array of personal Netlify site names or site IDs.
 * Strictly personal projects only.
 */
export const netlifySites: string[] = [
  "promptanalysis",
  "eduava",
  "portvia",
  "abhirent",
  "voteguide",
  "skillsparkhub",
  "amalabioceuticals",
  "dsapractise",
  "sudoportfolio",
  "journey0700",
];

import { CONTACT_DATA } from "./contact";

/**
 * Verified personal LinkedIn profile URL.
 */
export const linkedinUrl: string = CONTACT_DATA.linkedinUrl;

/**
 * Relative or absolute path to the downloadable resume asset.
 */
export const resumePath: string = "/resume.pdf";

export interface LiveConfig {
  vercelProjects: string[];
  netlifySites: string[];
  linkedinUrl: string;
  resumePath: string;
}

export const liveConfig: LiveConfig = {
  vercelProjects,
  netlifySites,
  linkedinUrl,
  resumePath,
};

export default liveConfig;
