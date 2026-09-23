/**
 * Which parts of the coach surface are mocked (SKI-252).
 *
 * The mock switch used to be one boolean for everything. That was right while
 * nothing existed on the backend, and wrong the moment part of it did: sign-in
 * and the read screens are live on staging, playbooks and assignments are not
 * (SKI-221, SKI-223), and one switch could only offer "all fake" or "half
 * broken". So the switch now names areas.
 *
 * `NEXT_PUBLIC_COACH_MOCKS` accepts:
 *
 * | value                    | mocked                                   |
 * |--------------------------|------------------------------------------|
 * | unset                    | everything outside production, nothing in it |
 * | `true` / `all`           | everything                               |
 * | `false` / `none`         | nothing                                  |
 * | `playbooks`              | playbooks and assignments only           |
 * | any comma list of areas  | exactly those                            |
 *
 * **One rule is enforced rather than documented:** if sign-in is mocked,
 * everything is. A mock session carries a token no live endpoint accepts, so
 * "auth mocked, reads live" would be a dashboard of 401s. Better to refuse the
 * combination than to let it look like an outage.
 *
 * Pure — no imports — so it can be tested without a browser or a build.
 */

export type CoachMockArea = 'reads' | 'auth' | 'playbooks';

export const COACH_MOCK_AREAS: readonly CoachMockArea[] = ['reads', 'auth', 'playbooks'];

/** How each area is described to the person looking at the screen. */
export const COACH_MOCK_AREA_LABELS: Record<CoachMockArea, string> = {
  reads: 'teams and players',
  auth: 'sign-in',
  playbooks: 'playbooks and assignments',
};

export function parseCoachMocks(
  raw: string | undefined,
  nodeEnv: string | undefined,
): ReadonlySet<CoachMockArea> {
  const value = (raw ?? '').trim().toLowerCase();

  // Production builds default to live, so a forgotten variable cannot ship
  // fake rosters to a real coach.
  if (value === '') return new Set(nodeEnv === 'production' ? [] : COACH_MOCK_AREAS);
  if (value === 'true' || value === 'all') return new Set(COACH_MOCK_AREAS);
  if (value === 'false' || value === 'none') return new Set();

  const areas = new Set<CoachMockArea>();
  for (const part of value.split(',').map((p) => p.trim()).filter(Boolean)) {
    if ((COACH_MOCK_AREAS as readonly string[]).includes(part)) areas.add(part as CoachMockArea);
    // An unknown name is ignored rather than fatal: a typo should not take the
    // sandbox down, and the banner shows what actually took effect.
  }

  if (areas.has('auth')) return new Set(COACH_MOCK_AREAS);
  return areas;
}

/** The area a `/api/coach/…` path belongs to. `path` is relative to `/api/coach`. */
export function areaForPath(path: string): CoachMockArea {
  const bare = path.split('?')[0];
  if (bare.startsWith('/auth/')) return 'auth';
  if (
    bare.startsWith('/playbooks') ||
    bare.startsWith('/assignments') ||
    bare.startsWith('/catalogue')
  ) {
    return 'playbooks';
  }
  return 'reads';
}
