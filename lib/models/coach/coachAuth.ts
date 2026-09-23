'use client';

/**
 * Coach credentials and session (SKI-213).
 *
 * A coach is not a player, and this is the module that makes that true in the
 * frontend. The player path (`app/hooks/useUserSession.ts`) mints an anonymous
 * UUID and trades it for a Knox token with no credential at all; that token
 * authenticates *a player* and will be refused by every `/api/coach/` endpoint.
 *
 * ## Storage, and why it differs from the player path
 *
 * The player token is deliberately **not** cached (`USE_TOKEN_CACHING = false`)
 * — it is disposable and re-minted on demand. A coach signs in with a real
 * password, so re-minting is not possible and a session that evaporates on
 * refresh is unusable. The token is therefore persisted.
 *
 * It is persisted in `localStorage`, which means it is readable by any script
 * on the origin. That is the standard trade-off and it is the same exposure the
 * rest of this app already carries, but it is a heavier one here because the
 * token reads children's records. Moving it to an httpOnly cookie needs a
 * server-side route to set it and is tracked separately — see SKI-254.
 *
 * ## Endpoints
 *
 * - Sign-in: the existing `users/api/auth/login/` — `{email, password}` in,
 *   Knox's `{token, expiry}` out. Reused rather than duplicated (SKI-200).
 * - Set password: `POST /api/coach/auth/set-password/` — `{token, password}`.
 *   One endpoint for both invite and reset links, told apart by the token's
 *   shape. **Success signs the coach straight in**; there is no second
 *   "now type it again" step.
 * - Forgot password: `POST /api/coach/auth/forgot-password/` — `{email}`.
 *   Always 202 with the same body whether or not the address has an account,
 *   so it cannot be used to learn which teachers are coaches.
 *
 * Every refusal is a `CoachAuthError` carrying the API's code — see
 * `./authErrors`, and the set-password screen for why the codes matter.
 *
 * ## Mocks
 *
 * The `auth` mock area (see `./mockAreas`) sends all three to `./mocks/auth`, which
 * reproduces the same codes, the same success shape and the same throttle.
 */
import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
import { COACH_BASE_URL, isCoachMocked } from './coachFetch';
import { CoachAuthError, readAuthError } from './authErrors';
import { mockCoachLogin, mockRequestPasswordReset, mockSetPassword } from './mocks/auth';

const STORAGE_KEY = 'coach_session';

export interface CoachSession {
  token: string;
  /** ISO-8601, or null when the token has no TTL. */
  expiry: string | null;
  email: string;
  displayName: string;
}

/** Storage can throw in private mode; a failure to persist is not fatal. */
const safeStorage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      /* non-fatal: the session simply will not survive a refresh */
    }
  },
  remove(key: string) {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch {
      /* non-fatal */
    }
  },
};

/**
 * The stored session, or null.
 *
 * An expired token is treated as absent and cleared, so a coach returning the
 * next morning sees the sign-in screen rather than a dashboard that 401s panel
 * by panel.
 */
export function readCoachSession(): CoachSession | null {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as CoachSession;
    if (!session?.token) return null;
    if (session.expiry && new Date(session.expiry).getTime() <= Date.now()) {
      safeStorage.remove(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    // Corrupt entry — drop it rather than wedging every load.
    safeStorage.remove(STORAGE_KEY);
    return null;
  }
}

export function writeCoachSession(session: CoachSession) {
  safeStorage.set(STORAGE_KEY, JSON.stringify(session));
}

export function clearCoachSession() {
  safeStorage.remove(STORAGE_KEY);
}

/**
 * Exchange credentials for a Knox token.
 *
 * Hits the existing `users/api/auth/login/`, which takes `{email, password}`
 * and returns `{token, expiry, user}`. It does **not** check that the user is a
 * coach — that is `/api/coach/context/`'s job, and the shell asks it after
 * sign-in. Conflating the two here would mean a coach with a valid password but
 * no team could not be told apart from a bad password.
 */
export async function coachLogin(email: string, password: string): Promise<CoachSession> {
  if (isCoachMocked('auth')) return mockCoachLogin(email, password);

  const response = await fetch(`${API_BASE_URL}users/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw await readAuthError(response);

  const body = (await response.json()) as {
    token: string;
    expiry?: string | null;
    user?: { email?: string; username?: string; firstName?: string };
  };

  return {
    token: body.token,
    expiry: body.expiry ?? null,
    email: body.user?.email ?? email,
    displayName: body.user?.firstName || body.user?.username || body.user?.email || email,
  };
}

/** Knox revokes the presented token; a failure still clears the local one. */
export async function coachLogout(token: string | null): Promise<void> {
  clearCoachSession();
  if (!token || isCoachMocked('auth')) return;
  try {
    await fetch(`${API_BASE_URL}users/api/auth/logout/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
    });
  } catch {
    // The local session is already gone, which is what the coach asked for.
  }
}

/** POST JSON to a coach auth endpoint; refusals become `CoachAuthError`. */
async function postCoachAuth<T>(path: string, body: unknown): Promise<T | null> {
  const response = await fetch(`${COACH_BASE_URL}/auth/${path}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await readAuthError(response);
  // 202 from forgot-password carries a body too, but nothing the caller needs.
  return response.status === 204 ? null : ((await response.json()) as T);
}

/**
 * Ask for a reset link.
 *
 * Resolves for any well-formed address, including ones with no account; only
 * a malformed address (`invalid_email`) or the 5-an-hour throttle refuses. The
 * link works once and lasts two hours.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (isCoachMocked('auth')) return mockRequestPasswordReset(email);
  await postCoachAuth('forgot-password', { email });
}

/** Which kind of link a token came from, by the same rule the server uses. */
export function tokenKind(token: string): 'reset' | 'invite' {
  return token.startsWith('r.') ? 'reset' : 'invite';
}

/**
 * Redeem an invite or reset token and set a password — which also signs the
 * coach in. Returns the session; the caller stores it.
 */
export async function setPassword(
  token: string,
  password: string,
): Promise<CoachSession & { via: 'invite' | 'reset' }> {
  if (isCoachMocked('auth')) return mockSetPassword(token, password);

  const body = await postCoachAuth<{
    token: string;
    expiry: string | null;
    via: 'invite' | 'reset';
    user: { email: string };
  }>('set-password', { token, password });

  if (!body?.token) throw new CoachAuthError('unknown', ['The server did not return a session.'], 200);
  return {
    token: body.token,
    expiry: body.expiry ?? null,
    email: body.user.email,
    // The response carries only the address; a name arrives when SKI-251 or
    // a profile endpoint gives one.
    displayName: body.user.email,
    via: body.via,
  };
}
