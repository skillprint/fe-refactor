/**
 * Wire types for the `/api/coach/` surface.
 *
 * Transcribed from the Django views on `main` (`api_backend/coach/`), which
 * render through `CamelCaseJSONRenderer` — so every key here is the camelCase
 * form of the snake_case name in the Python payload.
 *
 * These types describe the *real* API. The mock layer in `./mocks` satisfies
 * them exactly rather than inventing a friendlier shape, because the whole
 * point of mocking against the published contract is that switching over is a
 * flag flip, not a refactor. Where a field the UI wants does not exist yet
 * (see `CoachRosterPlayer`), it is absent here too.
 */

// ── /api/coach/context/ ──────────────────────────────────────────────────────

export type CoachOrgRole = 'Admin' | 'Coach';

export interface CoachOrganization {
  id: number;
  name: string;
  slug: string;
  role: CoachOrgRole;
}

export interface CoachContext {
  isCoach: boolean;
  teamCount: number;
  organizations: CoachOrganization[];
}

// ── shared ───────────────────────────────────────────────────────────────────

export interface CoachRange {
  start: string;
  end: string;
  days: number;
  bucket?: 'day' | 'week';
}

export interface CoachTeamRef {
  id: number;
  name: string;
  slug: string;
}

/**
 * An aggregate dimension value.
 *
 * `value`, never `score`: the backend reserves `score` for a raw session
 * score, which sits at visibility level 3, and names aggregates `value` so a
 * level-2 payload cannot leak one by naming collision.
 */
export interface CoachDimensionValue {
  slug: string;
  value: number;
}

/**
 * Team aggregates are withheld below `minimumRoster` players, because an
 * average over three people is three people's data. Responses that can be
 * suppressed carry this union rather than an empty list, so the UI can say
 * *why* it is empty.
 */
export type CoachSuppression =
  | { suppressed: false }
  | {
      suppressed: true;
      suppressionReason: string;
      minimumRoster: number;
      rosterSize: number;
    };

// ── /api/coach/teams/ ────────────────────────────────────────────────────────

export interface CoachTeamSummary {
  id: number;
  name: string;
  slug: string;
  season: string | null;
  isActive: boolean;
  playerCount: number;
  activePlayers: number;
  lapsedPlayers: number;
  sessionsThisWeek: number;
  medianMinutes: number;
}

export interface CoachTeamList {
  teams: CoachTeamSummary[];
}

// ── /api/coach/teams/{id}/roster/ ────────────────────────────────────────────

/**
 * One roster row.
 *
 * `topDimension` / `bottomDimension` are **optional by design**, in two
 * independent ways the UI has to handle separately:
 *
 * 1. They are omitted when the player has fewer than two measured dimensions —
 *    a single dimension is both best and worst, which reads as a finding and
 *    is not one.
 * 2. They are stripped per row for players whose consent grant stops at
 *    ENGAGEMENT (level 1), so a roster mixes rows with and without them.
 *
 * There is no name or email here. The roster payload carries `userId` only;
 * identity lives on the player-detail endpoint. See SKI-251.
 */
export interface CoachRosterPlayer {
  userId: number;
  lastPlayed: string | null;
  sessionsInRange: number;
  minutesInRange: number;
  topDimension?: CoachDimensionValue;
  bottomDimension?: CoachDimensionValue;
}

export interface CoachRoster {
  team: CoachTeamRef;
  range: CoachRange;
  players: CoachRosterPlayer[];
}

// ── /api/coach/teams/{id}/trends/ ────────────────────────────────────────────

export interface CoachTeamSeriesPoint {
  date: string;
  value: number;
  /** How many players stand behind this point. */
  players: number;
}

export interface CoachTeamSeries {
  slug: string;
  points: CoachTeamSeriesPoint[];
}

export type CoachTeamTrends = {
  team: CoachTeamRef;
  range: CoachRange;
  /** `teamSeries`, not `series` — a team aggregate and a per-player series are
   *  protected by different rules and deliberately do not share a key. */
  teamSeries: CoachTeamSeries[];
} & CoachSuppression;

// ── /api/coach/teams/{id}/games/ ─────────────────────────────────────────────

export interface CoachGameSkill {
  slug: string;
  name: string;
}

export interface CoachTeamGame {
  slug: string;
  name: string;
  plays: number;
  players: number;
  averageScore: number | null;
  skills: CoachGameSkill[];
}

export type CoachTeamGames = {
  team: CoachTeamRef;
  range: CoachRange;
  sort: 'plays' | 'score';
  games: CoachTeamGame[];
} & CoachSuppression;

// ── /api/coach/players/{id}/ ─────────────────────────────────────────────────

export interface CoachSkillProfileEntry {
  slug: string;
  value: number;
  sessions: number;
}

export interface CoachSessionLink {
  sessionId: string;
  gameSlug: string | null;
  gameName: string | null;
  playedAt: string;
  durationMinutes: number;
}

/**
 * The player payload layers by consent grant: `skillProfile` appears only at
 * PROFILE (2) or above, `sessions` only at SESSIONS (3).
 *
 * Absent, not null — the backend builds the layers rather than nulling them,
 * so `'skillProfile' in player` is the honest check and `player.skillProfile
 * === null` never happens.
 *
 * Individual mood is excluded at *every* level in v1, pending SKI-192/SKI-237.
 * Assignment history is likewise absent until SKI-222 exists.
 */
export interface CoachPlayer {
  userId: number;
  email: string;
  username: string;
  lastPlayed: string | null;
  totalSessions: number;
  sessionsInRange: number;
  minutesInRange: number;
  skillProfile?: CoachSkillProfileEntry[];
  sessions?: CoachSessionLink[];
}

export interface CoachPlayerDetail {
  player: CoachPlayer;
  range: CoachRange;
}

// ── /api/coach/players/{id}/sessions/ ────────────────────────────────────────

export interface CoachPaginated<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CoachPlayerSessions = CoachPaginated<CoachSessionLink>;

// ── /api/coach/players/{id}/trends/ ──────────────────────────────────────────

export interface CoachPlayerSeriesPoint {
  date: string;
  value: number;
}

export interface CoachPlayerSeries {
  slug: string;
  points: CoachPlayerSeriesPoint[];
}

export interface CoachPlayerTrends {
  range: CoachRange;
  series: CoachPlayerSeries[];
}

/** Visibility levels, mirroring `organizations.CoachVisibilityScope`. */
export enum CoachVisibilityScope {
  ENGAGEMENT = 1,
  PROFILE = 2,
  SESSIONS = 3,
}
