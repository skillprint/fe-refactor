'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { routeParamsFromPath, type RouteParamNames } from './routeParams';

/**
 * A dynamic route's params, read from the address bar:
 * `useRouteParams('/game/[slug]')` is `{ slug: 'hextris' }` on `/game/hextris/`.
 *
 * Pages use this rather than `params` or `useParams()`. The static export
 * builds each dynamic route once, as a shell for the value `_`
 * (lib/staticExport.ts), and serves it for every value, so those two say `_`
 * there. The address bar always has the real value, on Vercel too.
 *
 * It calls `useSearchParams()` on purpose. While the shell is prerendered,
 * that renders the nearest Suspense fallback in place of the page, so the page
 * first renders in the browser, with the real URL, and never hydrates against
 * HTML built for `_`. So, as with `useSearchParams()`, a caller needs a
 * Suspense boundary above it; each dynamic segment's layout or page has one.
 */
export function useRouteParams<P extends string>(pattern: P): Record<RouteParamNames<P>, string> {
  useSearchParams();
  return routeParamsFromPath(pattern, usePathname() || '/');
}
