/**
 * Where an email link, or a bounced browser, is allowed to go next, and the
 * attribution an email carries into a game session (SKI-271).
 */

/**
 * `path` if it is a page on this site, else null.
 *
 * Only a relative path with one leading slash and no backslash: `//evil.test`
 * and `/\evil.test` are other hosts to a browser, and anything with a scheme
 * isn't a path. A `next` pointing back at `/start/` is refused too, so a link
 * can't bounce a browser round in a loop.
 */
export function safeNext(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null;
  if (path.startsWith('/start')) return null;
  return path;
}

/** `next` with the email's delivery id added, so the game session can say which email it came from. */
export function withDeliveryId(next: string, deliveryId: number | null | undefined): string {
  if (!deliveryId) return next;
  const url = new URL(next, 'https://portal.invalid');
  url.searchParams.set('nid', String(deliveryId));
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * What a game session records about how the player got there: `source`
 * (e.g. `email_daily_play`, `playbook`) and, from an email, the delivery id.
 * Sent as the session's `deviceContext`.
 */
export function sessionAttribution(params: URLSearchParams): Record<string, string | number> {
  const context: Record<string, string | number> = {};
  const source = params.get('source');
  if (source && /^[a-z0-9_:-]{1,64}$/i.test(source)) context.source = source;
  const nid = Number(params.get('nid'));
  if (Number.isInteger(nid) && nid > 0) context.notificationDeliveryId = nid;
  return context;
}
