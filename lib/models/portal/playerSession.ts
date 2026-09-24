/**
 * A player session from an assignment email's one-time link (SKI-233).
 *
 * The portal normally identifies a player by an opaque `userId` in
 * localStorage, and the SDK trades that and the site's public API key for a
 * token — creating a guest account if needed. A PlayVS player is not that
 * guest: they are a specific account under their school, and the link's
 * redeem endpoint hands back a session for exactly that account. While one is
 * held and unexpired, `useUserSession` uses it instead of the SDK flow, and
 * mirrors its token to `localStorage.userToken` so every SDK path — including
 * starting a game session — acts as the player rather than a guest.
 */
export interface PlayerSession {
  token: string;
  /** ISO-8601, or null when the token has no TTL. */
  expiry: string | null;
  userId: number;
}

const KEY = 'player_session';

export function readPlayerSession(): PlayerSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PlayerSession;
    if (!session?.token) return null;
    if (session.expiry && new Date(session.expiry).getTime() <= Date.now()) {
      clearPlayerSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function writePlayerSession(session: PlayerSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
    localStorage.setItem('userToken', session.token);
  } catch {
    // Storage can throw in private mode; the redirect still works this once.
  }
}

export function clearPlayerSession(): void {
  try {
    const held = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    // Only drop the mirrored token if it was ours, not a guest's.
    if (held && localStorage.getItem('userToken') === (JSON.parse(held) as PlayerSession).token) {
      localStorage.removeItem('userToken');
    }
  } catch {
    // Nothing to clear.
  }
}
