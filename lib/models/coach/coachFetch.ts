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
 * is flipping `NEXT_PUBLIC_COACH_MOCKS` and deleting `./mocks` — see SKI-252.
 *
 * The switch is per area, so part of the surface can go live while the rest
 * waits for its endpoints. The decision is made here, per request, from the
 * path — nothing above this layer needs to know which half it is talking to.
 *
 * Mocks are **on by default** in development and **off in production builds**,
 * so a forgotten env var cannot ship fake rosters to a real coach.
 */
import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
import { mockCoachResponse } from './mocks/router';
import { areaForPath, parseCoachMocks, type CoachMockArea } from './mockAreas';

export const COACH_BASE_URL = `${API_BASE_URL}api/coach`;

/**
 * Which areas of the coach surface are served from `./mocks` — see
 * `./mockAreas` for the values `NEXT_PUBLIC_COACH_MOCKS` accepts and the one
 * combination it refuses.
 *
 * Read here, literally, because Next only inlines `NEXT_PUBLIC_*` variables
 * that appear by name in the source.
 */
export const COACH_MOCKED_AREAS: ReadonlySet<CoachMockArea> = parseCoachMocks(
  process.env.NEXT_PUBLIC_COACH_MOCKS,
  process.env.NODE_ENV,
);

export function isCoachMocked(area: CoachMockArea): boolean {
  return COACH_MOCKED_AREAS.has(area);
}

/** True when any area is mocked. Drives the on-screen banner. */
export const COACH_ANY_MOCKED: boolean = COACH_MOCKED_AREAS.size > 0;

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

  if (isCoachMocked(areaForPath(target))) {
    // Writes are mocked too, against a mutable in-memory store, so the builder
    // and assign flows actually work in the sandbox rather than being read-only
    // screens with dead buttons.
    return mockCoachResponse<T>(target, {
      method: (init.method ?? 'GET').toUpperCase(),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
    });
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
