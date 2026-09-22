/**
 * Serves `/api/coach/` paths from fixtures (SKI-214).
 *
 * This module is the *only* thing that knows mocks exist, besides the one
 * boolean in `coachFetch`. It matches on the same paths the Django `urls.py`
 * registers and returns the same shapes the views build, including the failure
 * modes — a 404 for an unknown player, a 403 when the consent grant does not
 * reach the level the endpoint needs, and aggregate suppression on a small
 * roster.
 *
 * Reproducing the *errors* matters more than reproducing the happy path. The
 * screens have to handle a 403 on a player the coach can legitimately open,
 * and if the mock never produces one, that branch ships untested.
 *
 * Deleting this directory and flipping `NEXT_PUBLIC_COACH_MOCKS=false` is the
 * whole switch-over (SKI-252).
 */
import { CoachApiError } from '../coachFetch';
import type { CoachRange } from '../types';
import { CoachVisibilityScope } from '../types';
import {
  MIN_ROSTER_FOR_AGGREGATE,
  MOCK_CONTEXT,
  MOCK_TEAMS,
  findPlayer,
  gamesForTeam,
  isoDaysAgo,
  mockSessions,
  playerPayload,
  playersForTeam,
  rosterRow,
  seriesPoints,
  teamSummary,
  DIMENSIONS,
} from './fixtures';

/** Simulated latency, so loading states are visible while developing. */
const LATENCY_MS = 260;

function range(days: number, bucket?: 'day' | 'week'): CoachRange {
  return {
    start: isoDaysAgo(days - 1),
    end: isoDaysAgo(0),
    days,
    ...(bucket ? { bucket } : {}),
  };
}

function suppression(rosterSize: number) {
  if (rosterSize >= MIN_ROSTER_FOR_AGGREGATE) return { suppressed: false as const };
  return {
    suppressed: true as const,
    suppressionReason:
      `Team aggregates need at least ${MIN_ROSTER_FOR_AGGREGATE} players on the ` +
      `roster; this team has ${rosterSize}. Below that, a team average is ` +
      `effectively one player's data.`,
    minimumRoster: MIN_ROSTER_FOR_AGGREGATE,
    rosterSize,
  };
}

function teamRef(id: number) {
  const team = MOCK_TEAMS.find((t) => t.id === id);
  if (!team) throw new CoachApiError(404, 'Not found.');
  return { id: team.id, name: team.name, slug: team.slug };
}

function numberParam(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new CoachApiError(400, `Invalid ${key}.`, { [key]: ['Must be a positive integer.'] });
  }
  return Math.min(parsed, 365);
}

/** Resolve a player the coach may open, or throw exactly as the API would. */
function requirePlayer(userId: number, requires: CoachVisibilityScope) {
  const player = findPlayer(userId);
  // Not on the coach's roster is indistinguishable from not existing — the
  // backend is explicit about this and the UI must not imply otherwise.
  if (!player) throw new CoachApiError(404, 'Not found.');

  if (player.scope < requires) {
    const needed =
      requires === CoachVisibilityScope.SESSIONS ? 'full session detail' : 'aggregate skill profile';
    throw new CoachApiError(403, `Consent grant does not cover ${needed}.`, {
      detail: `This player's visibility grant does not cover ${needed}.`,
      requiredScope: requires,
      grantedScope: player.scope,
    });
  }
  return player;
}

type Handler = (match: RegExpMatchArray, params: URLSearchParams) => unknown;

const ROUTES: Array<[RegExp, Handler]> = [
  [/^\/context\/$/, () => MOCK_CONTEXT],

  [
    /^\/teams\/$/,
    () => ({ teams: MOCK_TEAMS.map(teamSummary) }),
  ],

  [
    /^\/teams\/(\d+)\/roster\/$/,
    (match, params) => {
      const team = teamRef(Number(match[1]));
      const days = numberParam(params, 'days', 30);
      return {
        team,
        range: range(days),
        players: playersForTeam(team.id)
          .map(rosterRow)
          .sort((a, b) => a.userId - b.userId),
      };
    },
  ],

  [
    /^\/teams\/(\d+)\/trends\/$/,
    (match, params) => {
      const team = teamRef(Number(match[1]));
      const days = numberParam(params, 'days', 90);
      const bucket = (params.get('bucket') ?? 'day') as 'day' | 'week';
      if (bucket !== 'day' && bucket !== 'week') {
        throw new CoachApiError(400, 'Invalid bucket.', { bucket: ["Must be 'day' or 'week'."] });
      }

      const roster = playersForTeam(team.id);
      const notice = suppression(roster.length);
      const base = { team, range: range(days, bucket) };
      if (notice.suppressed) return { ...base, ...notice, teamSeries: [] };

      const step = bucket === 'week' ? 7 : 1;
      return {
        ...base,
        ...notice,
        teamSeries: DIMENSIONS.slice(0, 4).map((slug, index) => ({
          slug,
          points: seriesPoints(team.id * 100 + index, days, step).map((point) => ({
            ...point,
            players: Math.max(2, roster.length - (index % 3)),
          })),
        })),
      };
    },
  ],

  [
    /^\/teams\/(\d+)\/games\/$/,
    (match, params) => {
      const team = teamRef(Number(match[1]));
      const days = numberParam(params, 'days', 30);
      const sort = (params.get('sort') ?? 'plays') as 'plays' | 'score';
      if (sort !== 'plays' && sort !== 'score') {
        throw new CoachApiError(400, 'Invalid sort.', { sort: ["Must be 'plays' or 'score'."] });
      }

      const roster = playersForTeam(team.id);
      const notice = suppression(roster.length);
      const base = { team, range: range(days), sort };
      if (notice.suppressed) return { ...base, ...notice, games: [] };

      const games = gamesForTeam(team.id).sort((a, b) =>
        sort === 'plays' ? b.plays - a.plays : (b.averageScore ?? 0) - (a.averageScore ?? 0),
      );
      return { ...base, ...notice, games };
    },
  ],

  [
    /^\/players\/(\d+)\/$/,
    (match, params) => {
      const days = numberParam(params, 'days', 30);
      const player = requirePlayer(Number(match[1]), CoachVisibilityScope.ENGAGEMENT);
      return { player: playerPayload(player, days), range: range(days) };
    },
  ],

  [
    /^\/players\/(\d+)\/sessions\/$/,
    (match, params) => {
      const player = requirePlayer(Number(match[1]), CoachVisibilityScope.SESSIONS);
      const limit = numberParam(params, 'limit', 25);
      const results = mockSessions(player, 30, limit) ?? [];
      // One page only: the fixtures never exceed a page, and a fake cursor
      // that 404s on the next click would be worse than no pagination.
      return { next: null, previous: null, results };
    },
  ],

  [
    /^\/players\/(\d+)\/trends\/$/,
    (match, params) => {
      const player = requirePlayer(Number(match[1]), CoachVisibilityScope.PROFILE);
      const days = numberParam(params, 'days', 90);
      return {
        range: range(days),
        series: DIMENSIONS.slice(0, player.measuredDimensions).map((slug, index) => ({
          slug,
          points: seriesPoints(player.userId + index * 17, days, 3),
        })),
      };
    },
  ],
];

export async function mockCoachResponse<T>(target: string): Promise<T> {
  const [path, query = ''] = target.split('?');
  const params = new URLSearchParams(query);

  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  for (const [pattern, handler] of ROUTES) {
    const match = path.match(pattern);
    if (match) return handler(match, params) as T;
  }

  throw new CoachApiError(404, `No mock handler for ${path}`);
}
