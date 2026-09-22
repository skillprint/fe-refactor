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
 * ## Mocks
 *
 * Every call here mirrors `coachFetch`: one switch, `COACH_MOCKS_ENABLED`,
 * decides whether credentials go to the API or to `./mocks/auth`.
 *
 * ## Errors
 *
 * The credential endpoints (SKI-200) answer every refusal with
 * `{ code, detail: string[] }`. The messages are written for a coach to read,
 * so they are shown as they come; `code` rides along on `CoachApiError.detail`
 * for a screen that wants to branch on it — `invite_expired`,
 * `invite_already_accepted`, `reset_invalid`, `password_invalid`, …
 */
import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
import { COACH_MOCKS_ENABLED, CoachApiError } from './coachFetch';
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
  if (COACH_MOCKS_ENABLED) return mockCoachLogin(email, password);

  const response = await fetch(`${API_BASE_URL}users/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      /* not JSON */
    }
    throw new CoachApiError(
      response.status,
      response.status === 400 || response.status === 401
        ? 'Those credentials were not recognised.'
        : `Sign-in failed (${response.status}).`,
      detail,
    );
  }

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
  if (!token || COACH_MOCKS_ENABLED) return;
  try {
    await fetch(`${API_BASE_URL}users/api/auth/logout/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
    });
  } catch {
    // The local session is already gone, which is what the coach asked for.
  }
}

/** A credential endpoint's refusal, as a coach-readable `CoachApiError`. */
async function credentialError(response: Response, fallback: string): Promise<CoachApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    /* not JSON */
  }

  if (response.status === 429) {
    return new CoachApiError(429, 'Too many attempts. Wait a few minutes and try again.', body);
  }

  const detail = (body as { detail?: unknown } | undefined)?.detail;
  const message = Array.isArray(detail)
    ? detail.filter((line): line is string => typeof line === 'string').join(' ')
    : typeof detail === 'string'
      ? detail
      : '';
  return new CoachApiError(response.status, message || fallback, body);
}

async function postCredential(path: string, payload: Record<string, string>) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Start a password reset.
 *
 * Always resolves, even for an address with no account: telling an anonymous
 * caller which email addresses are coaches is an enumeration oracle, and the
 * screen says "if that address has an account" for the same reason. The API
 * holds the same line from its side — it answers 202 for every well-formed
 * address and does no account lookup on the request path at all, so not even
 * response time differs. Only a malformed address or a rate limit is refused.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (COACH_MOCKS_ENABLED) return mockRequestPasswordReset(email);

  const response = await postCredential('api/coach/auth/forgot-password/', { email });
  if (!response.ok) {
    throw await credentialError(response, `Could not send a reset link (${response.status}).`);
  }
}

/**
 * Redeem an invite or reset token and set a password.
 *
 * One endpoint takes both kinds of token, as this screen serves both links;
 * the API tells them apart by shape. It also returns a signed-in session,
 * which this deliberately ignores for now: the screen's success state sends
 * the coach to sign in, and changing that journey is a separate decision from
 * wiring the endpoint.
 */
export async function setPassword(token: string, password: string): Promise<void> {
  if (COACH_MOCKS_ENABLED) return mockSetPassword(token, password);

  const response = await postCredential('api/coach/auth/set-password/', { token, password });
  if (!response.ok) {
    throw await credentialError(response, `Could not set the password (${response.status}).`);
  }
}
