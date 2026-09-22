/**
 * The single door to the `/api/coach/` surface.
 *
 * Mirrors `lib/models/portal/portalFetch.ts` deliberately — same shape, same
 * error type, same token handling — but stays a separate module rather than a
 * parameter on the portal one. The two surfaces answer different questions
 * ("my data" versus "my players' data") and are authorised differently; a
 * shared client is where that distinction quietly erodes.
 *
 * ## The mock switch
 *
 * While the backend lands, every call can be served from `./mocks`. This is a
 * single boolean read in a single place: `coachFetch` either resolves from the
 * mock router or does a real `fetch`, and nothing above it knows which. The
 * hooks, the types and the screens are identical either way, so switching over
 * is flipping `NEXT_PUBLIC_COACH_MOCKS` and deleting `./mocks` — see SKI-246.
 *
 * Mocks are **on by default** in development and **off in production builds**,
 * so a forgotten env var cannot ship fake rosters to a real coach.
 */
import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
import { mockCoachResponse } from './mocks/router';

export const COACH_BASE_URL = `${API_BASE_URL}api/coach`;

/**
 * Whether coach data comes from `./mocks` instead of the API.
 *
 * Explicit opt-out wins (`NEXT_PUBLIC_COACH_MOCKS=false`); otherwise mocks are
 * used outside production. Exported so the UI can say so on screen — mock data
 * that looks real is worse than no data.
 */
export const COACH_MOCKS_ENABLED: boolean =
  process.env.NEXT_PUBLIC_COACH_MOCKS === 'false'
    ? false
    : process.env.NEXT_PUBLIC_COACH_MOCKS === 'true'
      ? true
      : process.env.NODE_ENV !== 'production';

export class CoachApiError extends Error {
  status: number;
  /** Parsed body when the API sent one — DRF puts the useful part here. */
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = 'CoachApiError';
    this.status = status;
    this.detail = detail;
  }

  /**
   * A 403 on this surface means "you may see this player, but not at this
   * level" — a consent grant is missing, which is a thing a coach can act on.
   * A 404 means the player is not theirs at all, and is deliberately
   * indistinguishable from a player who does not exist.
   */
  get isConsentGap(): boolean {
    return this.status === 403;
  }
}

export interface CoachFetchOptions extends RequestInit {
  /** Query parameters; `undefined` values are dropped rather than serialised. */
  params?: Record<string, string | number | undefined>;
}

function withQuery(path: string, params?: CoachFetchOptions['params']): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Fetch a coach endpoint. `path` is relative to `/api/coach` and starts with a
 * slash, e.g. `/teams/12/roster/`.
 */
export async function coachFetch<T>(
  path: string,
  token?: string | null,
  options: CoachFetchOptions = {},
): Promise<T> {
  const { params, ...init } = options;
  const target = withQuery(path, params);

  if (COACH_MOCKS_ENABLED) {
    return mockCoachResponse<T>(target);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const response = await fetch(`${COACH_BASE_URL}${target}`, { ...init, headers });

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      // A proxy error page is not JSON; the status still carries the meaning.
    }
    throw new CoachApiError(
      response.status,
      `Coach request failed (${response.status}): ${target}`,
      detail,
    );
  }

  return (await response.json()) as T;
}
