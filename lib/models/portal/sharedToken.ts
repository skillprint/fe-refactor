/**
 * One in-flight token request per identity, shared across hook instances.
 *
 * `useUserSession` mounts in many components at once, and each would
 * otherwise ask the SDK for a token on first render. So the request is shared
 * at module level. It must be shared per identity, not globally: a player
 * session from an assignment link and a guest are different accounts, and
 * after the player signs out (which does not reload the page) the next
 * resolution must not reuse the player's token. A shared device -- a school
 * computer -- would otherwise carry on as the player who just left.
 */
type TokenPromise = Promise<string | null>;

let held: { identity: string; promise: TokenPromise } | null = null;

/**
 * The shared token request for `identity`, starting one with `create` if
 * there is none for it. A different identity replaces whatever was held.
 */
export function sharedToken(identity: string, create: () => TokenPromise): TokenPromise {
  if (held?.identity !== identity) {
    held = { identity, promise: create() };
  }
  return held.promise;
}

/** Hold an already-known token for `identity` (a player session, a login). */
export function holdToken(identity: string, token: string): void {
  held = { identity, promise: Promise.resolve(token) };
}

/** Drop the held request, so the next call starts a fresh one. */
export function forgetToken(identity?: string): void {
  if (identity === undefined || held?.identity === identity) held = null;
}
