/**
 * Mock challenges (SKI-218), mirroring coach/challenge_views.py.
 *
 * Figures come from the roster fixtures so a challenge reads like the team it
 * belongs to. Skill figures honour each mock player's grant: below the
 * profile level they're absent, exactly as the backend's field gate leaves
 * them. The PlayVS-wide board adds anonymous rows from a fixed seed.
 */
import { CoachApiError } from '../coachFetch';
import { CoachVisibilityScope } from '../types';
import type {
  CoachChallenge,
  CoachChallengeInput,
  CoachChallengePlayer,
  CoachLeaderboardRow,
} from '../types';
import { MOCK_TEAMS, isoDaysAgo, playersForTeam, type MockPlayer } from './fixtures';
import type { MockRequest } from './router';

const FLOOR = 5;
const today = () => isoDaysAgo(0);

function stateOf(c: Pick<CoachChallenge, 'startsOn' | 'endsOn'>, cancelled = false): CoachChallenge['state'] {
  if (cancelled) return 'cancelled';
  const now = today();
  if (now < c.startsOn) return 'upcoming';
  return now <= c.endsOn ? 'active' : 'ended';
}

let nextId = 3;
const store: CoachChallenge[] = [
  {
    id: 1, title: 'Ten sessions before the scrim', description: 'Any game counts. Warm up properly.',
    kind: 'Play', metric: 'Sessions', dimension: null, games: [], goal: 10,
    startsOn: isoDaysAgo(6), endsOn: isoDaysAgo(-1), state: 'active',
    team: { id: MOCK_TEAMS[0].id, name: MOCK_TEAMS[0].name },
  },
  {
    id: 2, title: 'Sharpen reaction time', description: '',
    kind: 'Skill', metric: null, dimension: 'reaction-time', games: [], goal: 4,
    startsOn: isoDaysAgo(20), endsOn: isoDaysAgo(3), state: 'ended',
    team: { id: MOCK_TEAMS[0].id, name: MOCK_TEAMS[0].name },
  },
];
const cancelled = new Set<number>();

function refuse(code: string, message: string, status = 400): never {
  throw new CoachApiError(status, message, { code, detail: [message] });
}

function withState(c: CoachChallenge): CoachChallenge {
  return { ...c, state: stateOf(c, cancelled.has(c.id)) };
}

function find(id: number): CoachChallenge {
  const c = store.find((x) => x.id === id);
  if (!c) refuse('not_found', 'Not found.', 404);
  return c;
}

/** A player's figure: sessions, minutes, or points of improvement (null = no baseline). */
function figure(c: CoachChallenge, p: MockPlayer): number | null {
  if (c.kind === 'Play') {
    return c.metric === 'Minutes' ? Math.round(p.minutesInRange * 0.4 * 10) / 10 : Math.round(p.sessionsInRange * 0.4);
  }
  if (p.measuredDimensions === 0) return null;
  return Math.round(((p.userId * 37) % 110) / 10 - 3);
}

function playerRow(c: CoachChallenge, p: MockPlayer): CoachChallengePlayer {
  const f = figure(c, p);
  const progress = f === null ? null : Math.max(0, Math.min(1, Math.round((f / c.goal) * 1000) / 1000));
  const met = f !== null && f >= c.goal;
  const row: CoachChallengePlayer = { userId: p.userId, displayName: p.displayName };
  if (c.kind === 'Play') return { ...row, value: f ?? 0, progress, met };
  if (p.scope >= CoachVisibilityScope.PROFILE) row.skillProgress = { improvement: f, progress, met };
  return row;
}

function rank<T extends { figure: number }>(rows: T[]): Array<T & { rank: number }> {
  const sorted = [...rows].sort((a, b) => b.figure - a.figure);
  let rankNow = 0;
  let previous: number | undefined;
  return sorted.map((row, index) => {
    if (row.figure !== previous) {
      rankNow = index + 1;
      previous = row.figure;
    }
    return { ...row, rank: rankNow };
  });
}

function detail(c: CoachChallenge) {
  const roster = playersForTeam(c.team.id);
  const figures = roster.map((p) => figure(c, p));
  const measured = figures.filter((f): f is number => f !== null);
  const met = measured.filter((f) => f >= c.goal).length;
  const teamTotal =
    c.kind === 'Play'
      ? { value: Math.round(measured.reduce((a, b) => a + b, 0) * 10) / 10, goal: c.goal * roster.length, players: roster.length, playersMet: met }
      : measured.length < FLOOR
        ? { players: roster.length, measuredPlayers: measured.length, suppressed: true,
            suppressionReason: `Team aggregates need at least ${FLOOR} players; this one has ${measured.length} measured.` }
        : { players: roster.length, measuredPlayers: measured.length, suppressed: false,
            averageImprovement: Math.round((measured.reduce((a, b) => a + b, 0) / measured.length) * 10) / 10, playersMet: met };
  return { challenge: withState(c), teamTotal, players: roster.map((p) => playerRow(c, p)) };
}

function leaderboard(c: CoachChallenge, scope: string) {
  if (scope !== 'team' && scope !== 'playvs') refuse('invalid_scope', "scope is 'team' or 'playvs'.");
  const roster = playersForTeam(c.team.id);
  const nameable = roster.filter((p) => c.kind === 'Play' || p.scope >= CoachVisibilityScope.PROFILE);
  const own = nameable
    .map((p) => ({ player: p, figure: figure(c, p) }))
    .filter((r): r is { player: MockPlayer; figure: number } => r.figure !== null);

  const named = (r: { player: MockPlayer; figure: number; rank: number }): CoachLeaderboardRow => ({
    rank: r.rank, own: true, userId: r.player.userId, displayName: r.player.displayName,
    ...(c.kind === 'Play' ? { value: r.figure } : { skillProgress: { improvement: r.figure } }),
  });

  const base = { challenge: withState(c), scope: scope as 'team' | 'playvs' };
  if (scope === 'team') {
    const ranked = rank(own);
    return { ...base, rows: ranked.map(named), hiddenPlayers: roster.length - nameable.length, rankedPlayers: ranked.length };
  }
  // Everyone else at a coaching school: anonymous figures from a fixed seed.
  const others = Array.from({ length: 40 }, (_, i) => ({
    player: null, figure: c.kind === 'Play' ? ((i * 7919) % 17) : ((i * 31) % 13) - 4,
  }));
  const ranked = rank([...own.map((r) => ({ ...r })), ...others]);
  const rows = ranked.map((r, index): CoachLeaderboardRow | null =>
    r.player ? named(r as { player: MockPlayer; figure: number; rank: number }) : index < 50 ? { rank: r.rank, own: false, value: r.figure } : null,
  ).filter((r): r is CoachLeaderboardRow => r !== null);
  return { ...base, suppressed: false, rows, rankedPlayers: ranked.length };
}

function create(input: CoachChallengeInput): CoachChallenge {
  const team = MOCK_TEAMS.find((t) => t.id === Number(input?.team));
  if (!team) refuse('unknown_team', 'No such team.', 404);
  const title = (input.title ?? '').trim();
  if (!title) refuse('title_required', 'Give the challenge a title.');
  if (input.kind !== 'Play' && input.kind !== 'Skill') refuse('invalid_kind', 'Choose a play goal or a skill improvement.');
  if (!(Number(input.goal) >= 1)) refuse('invalid_goal', 'Set a goal of at least 1.');
  if (!input.startsOn || !input.endsOn) refuse('invalid_dates', 'Give a start and an end date.');
  if (input.endsOn < input.startsOn) refuse('invalid_dates', 'The end date is before the start date.');
  if (input.kind === 'Play' && input.metric !== 'Sessions' && input.metric !== 'Minutes') refuse('invalid_metric', 'Count sessions or minutes.');
  if (input.kind === 'Skill' && !input.dimension) refuse('unknown_dimension', 'Choose a skill to improve.');
  const challenge: CoachChallenge = {
    id: nextId++, title, description: (input.description ?? '').trim(), kind: input.kind,
    metric: input.kind === 'Play' ? (input.metric as CoachChallenge['metric']) : null,
    dimension: input.kind === 'Skill' ? (input.dimension as string) : null,
    games: (input.games ?? []).map((slug) => ({ slug, name: slug.replace(/-/g, ' ') })),
    goal: Number(input.goal), startsOn: input.startsOn, endsOn: input.endsOn, state: 'active',
    team: { id: team.id, name: team.name },
  };
  store.unshift(challenge);
  return withState(challenge);
}

export function challengeRoutes(path: string, params: URLSearchParams, request: MockRequest): unknown | undefined {
  if (path === '/challenges/') {
    if (request.method === 'POST') return create(request.body as CoachChallengeInput);
    return { challenges: store.map(withState) };
  }
  const one = path.match(/^\/challenges\/(\d+)\/$/);
  if (one) {
    const c = find(Number(one[1]));
    if (request.method === 'PATCH') {
      if (request.body?.status !== 'Cancelled') refuse('invalid_status', 'A challenge can only be cancelled.');
      cancelled.add(c.id);
      return withState(c);
    }
    return detail(c);
  }
  const board = path.match(/^\/challenges\/(\d+)\/leaderboard\/$/);
  if (board) return leaderboard(find(Number(board[1])), params.get('scope') ?? 'team');
  return undefined;
}
