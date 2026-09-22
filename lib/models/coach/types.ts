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

// ─────────────────────────────────────────────────────────────────────────────
// Playbooks and assignment (SKI-225, SKI-226)
//
// ⚠️ **These types are a proposal, not a transcription.**
//
// Everything above this line was read off the `coach` app already merged on the
// marketplace `main` branch. Nothing below it exists on the backend yet —
// SKI-219, SKI-220, SKI-221 and SKI-223 are all still open. The shapes here
// were designed against the planned models in the spec and are mirrored into
// those tickets so the API is built to match.
//
// That makes the switch-over riskier than it was for the read surface: there,
// a mismatch was impossible; here, a backend that lands differently will break
// these screens. Whoever implements SKI-221/223 should either follow this or
// change it here in the same PR.
// ─────────────────────────────────────────────────────────────────────────────

/** A half-built playbook must not be assignable, hence two states. */
export type CoachPlaybookStatus = 'draft' | 'published';

export interface CoachPlaybookGame {
  slug: string;
  name: string;
  /** Order within the sequence; lower first. */
  position: number;
  /** From the catalogue; null when the game has never declared one. */
  suggestedDurationSeconds: number | null;
}

export interface CoachPlaybook {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: CoachPlaybookStatus;
  pillar: 'mood' | 'cognition' | 'personality';
  dimension: string;
  associatedSkills: string[];
  associatedMoods: string[];
  games: CoachPlaybookGame[];
  /**
   * Sum of the games' suggested durations, server-side.
   *
   * Computed rather than authored: a coach assigning a "10 minute warm-up"
   * needs to know when it is actually 25, and a hand-typed estimate drifts the
   * moment a game is added.
   */
  estimatedSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoachPlaybookList {
  playbooks: CoachPlaybook[];
}

/** What a playbook write sends. `games` is an ordered list of slugs. */
export interface CoachPlaybookInput {
  title: string;
  description?: string;
  pillar?: CoachPlaybook['pillar'];
  dimension?: string;
  associatedSkills?: string[];
  associatedMoods?: string[];
  games: string[];
  status?: CoachPlaybookStatus;
}

/**
 * Mirrors `coach.PlaybookAssignment.Cadence` as merged (marketplace PR #69).
 *
 * **No `match_day`.** The backend leaves it out deliberately: it implies a
 * match schedule the platform does not ingest in v1, and an enum value with no
 * behaviour behind it reads as supported in the API, the admin and the UI while
 * doing nothing. A coach wanting match days sets one-off dates by hand.
 *
 * Values are the TextChoices values, not lowercase slugs.
 */
export type CoachAssignmentCadence = 'OneOff' | 'Weekly';

/** Mirrors `coach.PlaybookAssignment.Status`. Cancelling is a status change, not a delete. */
export type CoachAssignmentStatus = 'Active' | 'Completed' | 'Cancelled';

/** Derived from sessions, not self-reported. */
export type CoachAssignmentPlayerStatus = 'not_started' | 'in_progress' | 'complete';

export interface CoachAssignmentTarget {
  type: 'team' | 'player';
  id: number;
  name: string;
}

export interface CoachAssignment {
  id: string;
  playbook: { id: string; title: string };
  target: CoachAssignmentTarget;
  assignedAt: string;
  dueAt: string | null;
  cadence: CoachAssignmentCadence;
  status: CoachAssignmentStatus;
  note: string;
  playerCount: number;
  completedCount: number;
}

export interface CoachAssignmentList {
  assignments: CoachAssignment[];
}

/**
 * One player's progress through an assignment.
 *
 * `userId` with no name, consistent with the roster (SKI-251). `playedGames` /
 * `totalGames` rather than a percentage, so the UI can say "3 of 5" — which is
 * what a coach chasing someone actually wants.
 */
export interface CoachAssignmentPlayer {
  userId: number;
  status: CoachAssignmentPlayerStatus;
  firstStartedAt: string | null;
  completedAt: string | null;
  playedGames: number;
  totalGames: number;
  /** Null when never reminded; drives the rate limit. */
  lastRemindedAt: string | null;
}

export interface CoachAssignmentDetail {
  assignment: CoachAssignment;
  players: CoachAssignmentPlayer[];
}

export interface CoachAssignmentInput {
  playbookId: string;
  targetType: 'team' | 'player';
  /** Team id, or the player user ids when assigning to a subset. */
  teamId?: number;
  userIds?: number[];
  dueAt?: string | null;
  cadence?: CoachAssignmentCadence;
  note?: string;
}

/**
 * The result of a remind.
 *
 * `skipped` carries the players who were *not* mailed because they were
 * reminded too recently. A coach who clicks remind twice should be told six
 * were skipped, not silently mail twenty teenagers again.
 */
export interface CoachRemindResult {
  remindedUserIds: number[];
  skipped: Array<{ userId: number; reason: string; nextAllowedAt: string }>;
}
