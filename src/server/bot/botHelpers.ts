import { env } from '../platform/config/env';

/**
 * Returns a formatted, clickable HTML link to the configured frontend website.
 * Uses env.FRONTEND_URL so it automatically matches the active environment
 * (e.g., localhost in dev, preview domain in preview, custom domain in prod).
 */
export function getWebsiteHtmlLink(): string {
  const urlStr = env.FRONTEND_URL;
  try {
    const parsed = new URL(urlStr);
    return `<a href="${urlStr}">${parsed.host}</a>`;
  } catch {
    return `<a href="${urlStr}">${urlStr}</a>`;
  }
}

/**
 * Returns the raw frontend website URL from the environment configuration.
 */
export function getWebsiteUrl(): string {
  return env.FRONTEND_URL;
}

