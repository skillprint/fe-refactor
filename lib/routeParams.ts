/** The names of the `[param]` segments in a route pattern such as `/profile/stats/[type]/[slug]`. */
export type RouteParamNames<P extends string> = P extends `${string}[${infer Name}]${infer Rest}`
  ? Name | RouteParamNames<Rest>
  : never;

/**
 * A route's params, read from a pathname: `('/game/[slug]', '/game/hextris/')`
 * is `{ slug: 'hextris' }`. Values are as the path has them, still
 * percent-encoded, like Next's own `params`, so code that decoded `params`
 * decodes these the same way. A param the path is too short to have is an
 * empty string.
 */
export function routeParamsFromPath<P extends string>(pattern: P, pathname: string): Record<RouteParamNames<P>, string> {
  const want = pattern.split('/').filter(Boolean);
  const have = pathname.split('?')[0].split('/').filter(Boolean);
  const params: Record<string, string> = {};
  want.forEach((segment, i) => {
    const name = segment.match(/^\[(.+)\]$/)?.[1];
    if (!name) return;
    params[name] = have[i] ?? '';
  });
  return params as Record<RouteParamNames<P>, string>;
}
