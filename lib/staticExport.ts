/**
 * The static export: `pnpm run build:export` builds the portal as plain files
 * for S3 + CloudFront (`STATIC_EXPORT=1`, see next.config.ts). Vercel and
 * `next dev` build without it, and render on the server as they always have.
 *
 * Server code only: the flag is not inlined into client bundles.
 */
export const STATIC_EXPORT = process.env.STATIC_EXPORT === '1';

/**
 * The value a dynamic segment is built with in the export. Each page under a
 * dynamic segment is built once, as a shell (`/game/_/`, `/game/_/review/`),
 * and CloudFront serves that shell for every real value
 * (`scripts/static-export/viewer-request.template.js`). The page reads the
 * real value from the address bar with `useRouteParams`.
 */
export const SHELL_PARAM = '_';

/**
 * `generateStaticParams` for a dynamic segment's layout, which covers every
 * page below it. In the export: one shell per page. Elsewhere: none, so the
 * route keeps rendering on demand (Next skips an export that isn't a function).
 */
export function shellParams<K extends string>(...names: K[]): (() => Record<K, string>[]) | undefined {
  if (!STATIC_EXPORT) return undefined;
  const shell = Object.fromEntries(names.map((name) => [name, SHELL_PARAM])) as Record<K, string>;
  return () => [shell];
}

/**
 * A route handler that needs a server: share cards, bot profiles, Island
 * Coach. `export const GET = serverOnly(handleGet)`. In the export the route
 * exports no handler, so Next leaves it out of `out/`; Vercel and `next dev`
 * get the handler. (The share Lambda serves what the export needs.)
 */
export function serverOnly<H>(handler: H): H | undefined {
  return STATIC_EXPORT ? undefined : handler;
}
