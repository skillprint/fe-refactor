'use client';

/**
 * The coach session (SKI-213, SKI-254).
 *
 * **The credential is an HttpOnly cookie the API sets** (marketplace PR #89).
 * Sign-in and set-password hand it to the browser and nothing else: no
 * response body carries the token, and nothing here stores one. Every coach
 * request goes with `credentials: 'include'`, and the API honours the cookie
 * only from this app's own origin.
 *
 * It used to live in `localStorage`, readable by any script on the page — one
 * injected script away from every roster the coach holds. What remains in
 * storage (`coach_profile`) is who is signed in and until when, for the header
 * and the guard; losing it costs a sign-in, not a roster.
 *
 * - Sign in: `POST /api/coach/auth/login/` — `{email, password}`, coach accounts
 *   only.
 * - Set password: `POST /api/coach/auth/set-password/` — `{token, password}`.
 *   One endpoint for both invite and reset links, told apart by the token's
 *   shape; success signs the coach in.
 * - Sign out: `POST /api/coach/auth/logout/` — this device, or `{everywhere:
 *   true}` for every one.
 */
import { COACH_BASE_URL, isCoachMocked } from './coachFetch';
import { CoachAuthError, readAuthError } from './authErrors';
import { mockCoachLogin, mockRequestPasswordReset, mockSetPassword } from './mocks/auth';

/** Who is signed in, for the header and the guard. Not a credential. */
const STORAGE_KEY = 'coach_profile';
/** Where the token itself used to be kept, before SKI-254. Cleared on sight. */
const LEGACY_TOKEN_KEY = 'coach_session';

export interface CoachSession {
  /** ISO-8601, or null when the session has no TTL. */
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
  // A token stored by an older build must not linger where scripts can read it.
  safeStorage.remove(LEGACY_TOKEN_KEY);
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as CoachSession;
    if (!session?.email) return null;
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
 * Sign in. The API sets the session cookie; the body says who and until when.
 *
 * Coach accounts only: a correct password on an account that coaches nothing
 * is refused with `not_a_coach`, rather than signing in to an empty app.
 */
export async function coachLogin(email: string, password: string): Promise<CoachSession> {
  if (isCoachMocked('auth')) return mockCoachLogin(email, password);

  const body = await postCoachAuth<{ expiry: string | null; user: { email: string } }>('login', {
    email,
    password,
  });
  const address = body?.user?.email ?? email;
  return { expiry: body?.expiry ?? null, email: address, displayName: address };
}

/**
 * End the session: this device, or every device the coach is signed in on.
 * The profile is cleared first — the coach asked to be signed out, and a
 * network failure should not leave the app looking signed in.
 */
export async function coachLogout(everywhere = false): Promise<void> {
  clearCoachSession();
  if (isCoachMocked('auth')) return;
  try {
    await fetch(`${COACH_BASE_URL}/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ everywhere }),
    });
  } catch {
    // Signed out here already; the cookie expires on its own.
  }
}

/** POST JSON to a coach auth endpoint; refusals become `CoachAuthError`. */
async function postCoachAuth<T>(path: string, body: unknown): Promise<T | null> {
  const response = await fetch(`${COACH_BASE_URL}/auth/${path}/`, {
    method: 'POST',
    // Sign-in and set-password answer with the session cookie; without this
    // the browser would drop it.
    credentials: 'include',
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
 * coach in (the API sets the cookie). Returns who is signed in.
 */
export async function setPassword(
  token: string,
  password: string,
): Promise<CoachSession & { via: 'invite' | 'reset' }> {
  if (isCoachMocked('auth')) return mockSetPassword(token, password);

  const body = await postCoachAuth<{
    expiry: string | null;
    via: 'invite' | 'reset';
    user: { email: string };
  }>('set-password', { token, password });

  if (!body?.user) throw new CoachAuthError('unknown', ['The server did not return a session.'], 200);
  return {
    expiry: body.expiry ?? null,
    email: body.user.email,
    // The response carries only the address; a name arrives when SKI-251 or
    // a profile endpoint gives one.
    displayName: body.user.email,
    via: body.via,
  };
}
