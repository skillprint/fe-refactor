/**
 * Where the portal lives on the public internet.
 *
 * Shared links and Open Graph tags must be absolute, so the server needs to
 * know its own origin. In the browser the real origin is always right (it is
 * what the visitor typed); on the server it comes from the environment, with
 * the production domain as the fallback.
 */

/** The production portal. Also the Origin the server presents to the backend's public endpoints. */
export const PRODUCTION_SITE_URL = 'https://portal.skillprint.co';

/** The absolute origin of this deployment, with no trailing slash. */
export function siteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return PRODUCTION_SITE_URL;
}

/** An absolute URL on this deployment for a site path such as `/games/`. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl()}/`).toString();
}
