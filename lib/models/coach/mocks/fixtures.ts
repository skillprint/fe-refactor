/**
 * The mock dataset behind the coach screens (SKI-214).
 *
 * Built to exercise the states the *real* API can produce, not to look tidy.
 * A fixture set where every player has full data teaches the UI nothing, and
 * the bugs it hides all surface on the day the backend is wired up. So:
 *
 * - **Thunder** is a healthy 8-player roster, above the suppression floor.
 * - **JV Rocket League** has 3 players, which is *below* the floor of 5, so
 *   its trends and games come back suppressed. That is a real screen a coach
 *   will see in week one, and it must not look like an error.
 * - Consent levels are mixed within Thunder: most players are at ENGAGEMENT
 *   (no dimensions on their roster row), a few at PROFILE, one at SESSIONS.
 * - One player has never played; one lapsed three weeks ago; one has exactly
 *   one measured dimension, so both extremes are correctly omitted.
 *
 * Values are generated from a seeded PRNG so a reload does not reshuffle the
 * roster under the person reading it.
 */
import type {
  CoachContext,
  CoachDimensionValue,
  CoachGameSkill,
  CoachPlayer,
  CoachRosterPlayer,
  CoachTeamGame,
  CoachTeamSummary,
} from '../types';
import { CoachVisibilityScope } from '../types';

/** Mulberry32 — small, deterministic, good enough for fixture noise. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `days` ago as an ISO date, relative to a fixed clock read once per load. */
const TODAY = new Date();
export function isoDaysAgo(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const DIMENSIONS = [
  'attention',
  'working-memory',
  'processing-speed',
  'task-switching',
  'inhibition',
  'planning',
] as const;

export const MIN_ROSTER_FOR_AGGREGATE = 5;

// ── players ──────────────────────────────────────────────────────────────────

export interface MockPlayer {
  userId: number;
  email: string;
  username: string;
  teamId: number;
  /** What this player's coach has been granted. Drives layering everywhere. */
  scope: CoachVisibilityScope;
  lastPlayedDaysAgo: number | null;
  sessionsInRange: number;
  minutesInRange: number;
  totalSessions: number;
  /** How many dimensions are measured — 1 means no top/bottom is reported. */
  measuredDimensions: number;
}

export const MOCK_PLAYERS: MockPlayer[] = [
  { userId: 4821, email: 'a.okafor@northgate.edu',  username: 'Voltage',   teamId: 1, scope: CoachVisibilityScope.SESSIONS,   lastPlayedDaysAgo: 0,    sessionsInRange: 31, minutesInRange: 214.5, totalSessions: 142, measuredDimensions: 6 },
  { userId: 4822, email: 'm.delgado@northgate.edu', username: 'Mirage',    teamId: 1, scope: CoachVisibilityScope.PROFILE,    lastPlayedDaysAgo: 1,    sessionsInRange: 24, minutesInRange: 168.0, totalSessions: 97,  measuredDimensions: 5 },
  { userId: 4823, email: 'j.whitlock@northgate.edu',username: 'Fenrir',    teamId: 1, scope: CoachVisibilityScope.PROFILE,    lastPlayedDaysAgo: 2,    sessionsInRange: 19, minutesInRange: 133.5, totalSessions: 88,  measuredDimensions: 4 },
  { userId: 4824, email: 's.parvin@northgate.edu',  username: 'Nyx',       teamId: 1, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: 3,    sessionsInRange: 17, minutesInRange: 120.0, totalSessions: 64,  measuredDimensions: 5 },
  { userId: 4825, email: 'r.ibarra@northgate.edu',  username: 'Cinder',    teamId: 1, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: 6,    sessionsInRange: 11, minutesInRange: 77.5,  totalSessions: 41,  measuredDimensions: 3 },
  // Exactly one measured dimension: both extremes must be omitted.
  { userId: 4826, email: 't.nakamura@northgate.edu',username: 'Lumen',     teamId: 1, scope: CoachVisibilityScope.PROFILE,    lastPlayedDaysAgo: 9,    sessionsInRange: 4,  minutesInRange: 26.0,  totalSessions: 12,  measuredDimensions: 1 },
  // Lapsed: past LAPSED_AFTER_DAYS (14).
  { userId: 4827, email: 'd.abara@northgate.edu',   username: 'Static',    teamId: 1, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: 22,   sessionsInRange: 1,  minutesInRange: 6.5,   totalSessions: 19,  measuredDimensions: 2 },
  // Never played — lastPlayed null, everything zero.
  { userId: 4828, email: 'k.brennan@northgate.edu', username: 'Rook',      teamId: 1, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: null, sessionsInRange: 0,  minutesInRange: 0.0,   totalSessions: 0,   measuredDimensions: 0 },

  // JV squad — three players, below the aggregate floor.
  { userId: 4901, email: 'p.oyelaran@northgate.edu',username: 'Tinder',    teamId: 2, scope: CoachVisibilityScope.PROFILE,    lastPlayedDaysAgo: 1,    sessionsInRange: 9,  minutesInRange: 61.0,  totalSessions: 23,  measuredDimensions: 4 },
  { userId: 4902, email: 'l.castillo@northgate.edu',username: 'Ember',     teamId: 2, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: 4,    sessionsInRange: 6,  minutesInRange: 40.5,  totalSessions: 15,  measuredDimensions: 3 },
  { userId: 4903, email: 'h.sørensen@northgate.edu',username: 'Drift',     teamId: 2, scope: CoachVisibilityScope.ENGAGEMENT, lastPlayedDaysAgo: 11,   sessionsInRange: 2,  minutesInRange: 13.0,  totalSessions: 8,   measuredDimensions: 2 },
];

export function playersForTeam(teamId: number): MockPlayer[] {
  return MOCK_PLAYERS.filter((p) => p.teamId === teamId);
}

export function findPlayer(userId: number): MockPlayer | undefined {
  return MOCK_PLAYERS.find((p) => p.userId === userId);
}

// ── dimensions ───────────────────────────────────────────────────────────────

/** Stable per-player dimension values, highest first. */
export function dimensionsFor(player: MockPlayer): CoachDimensionValue[] {
  const rand = seeded(player.userId);
  return DIMENSIONS.slice(0, player.measuredDimensions)
    .map((slug) => ({ slug, value: Math.round((38 + rand() * 54) * 10) / 10 }))
    .sort((a, b) => b.value - a.value);
}

// ── teams ────────────────────────────────────────────────────────────────────

export interface MockTeam {
  id: number;
  name: string;
  slug: string;
  season: string | null;
  isActive: boolean;
}

export const MOCK_TEAMS: MockTeam[] = [
  { id: 1, name: 'Northgate Thunder — Varsity', slug: 'northgate-thunder-varsity', season: 'Fall 2026', isActive: true },
  { id: 2, name: 'Northgate JV — Rocket League', slug: 'northgate-jv-rocket-league', season: 'Fall 2026', isActive: true },
];

const ACTIVE_WITHIN_DAYS = 7;
const LAPSED_AFTER_DAYS = 14;

export function teamSummary(team: MockTeam): CoachTeamSummary {
  const roster = playersForTeam(team.id);
  const played = roster.filter((p) => p.lastPlayedDaysAgo !== null);

  // Mirrors coach/engagement.py: active and lapsed are NOT complements, so a
  // player last seen 9 days ago is neither. The gap is intentional.
  const active = played.filter((p) => (p.lastPlayedDaysAgo as number) <= ACTIVE_WITHIN_DAYS);
  const lapsed = roster.filter(
    (p) => p.lastPlayedDaysAgo === null || (p.lastPlayedDaysAgo as number) >= LAPSED_AFTER_DAYS,
  );

  const minutes = roster.map((p) => p.minutesInRange).sort((a, b) => a - b);
  const median = minutes.length
    ? minutes.length % 2
      ? minutes[(minutes.length - 1) / 2]
      : (minutes[minutes.length / 2 - 1] + minutes[minutes.length / 2]) / 2
    : 0;

  return {
    ...team,
    playerCount: roster.length,
    activePlayers: active.length,
    lapsedPlayers: lapsed.length,
    sessionsThisWeek: roster.reduce(
      (sum, p) =>
        sum +
        (p.lastPlayedDaysAgo !== null && p.lastPlayedDaysAgo <= 7
          ? Math.round(p.sessionsInRange / 4)
          : 0),
      0,
    ),
    medianMinutes: Math.round(median * 10) / 10,
  };
}

// ── roster rows ──────────────────────────────────────────────────────────────

export function rosterRow(player: MockPlayer): CoachRosterPlayer {
  const row: CoachRosterPlayer = {
    userId: player.userId,
    lastPlayed: player.lastPlayedDaysAgo === null ? null : isoDaysAgo(player.lastPlayedDaysAgo),
    sessionsInRange: player.sessionsInRange,
    minutesInRange: player.minutesInRange,
  };

  // Two independent reasons the extremes are absent, both real:
  //   1. fewer than two measured dimensions — nothing to compare;
  //   2. the grant stops at ENGAGEMENT — stripped per row on the way out.
  const dims = dimensionsFor(player);
  if (dims.length >= 2 && player.scope >= CoachVisibilityScope.PROFILE) {
    row.topDimension = dims[0];
    row.bottomDimension = dims[dims.length - 1];
  }
  return row;
}

// ── games ────────────────────────────────────────────────────────────────────

const SKILLS: Record<string, CoachGameSkill[]> = {
  'reaction-time': [{ slug: 'processing-speed', name: 'Processing speed' }],
  'stroop-test': [
    { slug: 'inhibition', name: 'Inhibition' },
    { slug: 'attention', name: 'Attention' },
  ],
  'simon-says': [{ slug: 'working-memory', name: 'Working memory' }],
  hextris: [
    { slug: 'planning', name: 'Planning' },
    { slug: 'task-switching', name: 'Task switching' },
  ],
  'dungeon-runner': [
    { slug: 'attention', name: 'Attention' },
    { slug: 'planning', name: 'Planning' },
  ],
};

export function gamesForTeam(teamId: number): CoachTeamGame[] {
  const roster = playersForTeam(teamId);
  const rand = seeded(teamId * 977);
  return Object.entries(SKILLS).map(([slug, skills]) => {
    const players = Math.max(1, Math.round(roster.length * (0.45 + rand() * 0.55)));
    return {
      slug,
      name: slug
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' '),
      plays: Math.round(8 + rand() * 60),
      players,
      averageScore: Math.round((45 + rand() * 45) * 10) / 10,
      skills,
    };
  });
}

// ── series ───────────────────────────────────────────────────────────────────

/** A dimension's values over `days`, drifting gently around a baseline. */
export function seriesPoints(
  seed: number,
  days: number,
  step: number,
): Array<{ date: string; value: number }> {
  const rand = seeded(seed);
  const baseline = 44 + rand() * 40;
  const points: Array<{ date: string; value: number }> = [];
  let value = baseline;
  for (let day = days - 1; day >= 0; day -= step) {
    value = Math.min(97, Math.max(12, value + (rand() - 0.45) * 6));
    points.push({ date: isoDaysAgo(day), value: Math.round(value * 10) / 10 });
  }
  return points;
}

// ── player detail ────────────────────────────────────────────────────────────

export function playerPayload(player: MockPlayer, days: number): CoachPlayer {
  const payload: CoachPlayer = {
    userId: player.userId,
    email: player.email,
    username: player.username,
    lastPlayed: player.lastPlayedDaysAgo === null ? null : isoDaysAgo(player.lastPlayedDaysAgo),
    totalSessions: player.totalSessions,
    sessionsInRange: player.sessionsInRange,
    minutesInRange: player.minutesInRange,
  };

  // Layered, not filtered — matching coach/player.py. A key that is absent
  // means "not granted"; it is never present-and-null.
  if (player.scope >= CoachVisibilityScope.PROFILE) {
    payload.skillProfile = dimensionsFor(player).map((d) => ({
      slug: d.slug,
      value: d.value,
      sessions: Math.max(1, Math.round(player.sessionsInRange / 3)),
    }));
  }

  if (player.scope >= CoachVisibilityScope.SESSIONS) {
    payload.sessions = mockSessions(player, days, 12);
  }

  return payload;
}

export function mockSessions(
  player: MockPlayer,
  days: number,
  limit: number,
): CoachPlayer['sessions'] {
  const rand = seeded(player.userId * 31);
  const slugs = Object.keys(SKILLS);
  const count = Math.min(limit, player.sessionsInRange);
  return Array.from({ length: count }, (_, index) => {
    const slug = slugs[Math.floor(rand() * slugs.length)];
    return {
      sessionId: `${player.userId}-mock-${String(index).padStart(4, '0')}`,
      gameSlug: slug,
      gameName: slug
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' '),
      playedAt: isoDaysAgo(Math.min(days - 1, Math.floor(index * (days / Math.max(count, 1))))),
      durationMinutes: Math.round((3 + rand() * 11) * 10) / 10,
    };
  });
}

// ── context ──────────────────────────────────────────────────────────────────

export const MOCK_CONTEXT: CoachContext = {
  isCoach: true,
  teamCount: MOCK_TEAMS.length,
  organizations: [
    { id: 77, name: 'PlayVS — Northgate High', slug: 'playvs-northgate-high', role: 'Coach' },
  ],
};
