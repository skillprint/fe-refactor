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
 * `displayName` is the only identity on a row, and it is never an email:
 * the name the school's partner sent, else a username the player chose, else
 * null. Label rows with `playerLabel`, not by hand. See SKI-251.
 */
export interface CoachRosterPlayer {
  userId: number;
  displayName: string | null;
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
  /**
   * Sessions that measured this dimension. Not `sessions`: that name is the
   * level-3 session list, and the backend's visibility gate stripped the
   * count along with it at level 2 (SKI-237).
   */
  sessionCount: number;
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
  /** Resolved as on the roster; null when the player has no name. */
  displayName: string | null;
  /** Null for a partner-provisioned account, whose address is a placeholder. */
  email: string | null;
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
// Transcribed from the backend, with one exception.
//
// These started as a proposal written ahead of the API. They now match
// `coach/playbook_views.py` (marketplace PR #74) and `coach/assignment_views.py`
// (PR #75), which were built to them and changed them in three places: no mood
// targets on a playbook, one assignment per player for "some players", and a
// `dismissed` player status.
//
// Remind (`POST /assignments/{id}/remind/`, `CoachRemindResult`) arrived with
// assignment email in marketplace PR #84 (SKI-232).
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
  /**
   * Always `cognition` for coach-authored playbooks, and there is no
   * `associatedMoods`: every coach response is held to "no mood dimension in
   * v1" (the backend's `coach.visibility`), so the API refuses mood targets
   * rather than returning them (marketplace PR #74).
   */
  pillar: 'cognition';
  /** A skill slug, or "". Never a mood. */
  dimension: string;
  associatedSkills: string[];
  /** The owning organisation's id. */
  organization: number;
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
  dimension?: string;
  associatedSkills?: string[];
  /** Required only for a coach of more than one organisation. */
  organization?: number;
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

/**
 * Derived from sessions since the assignment was made, not self-reported.
 *
 * `dismissed` is the player having dismissed it (`dismissed_at`). Nothing sets
 * that yet — there is no player-side dismiss — but the backend serves it as its
 * own status rather than folding it into `not_started`, so a coach is never
 * sent chasing someone who already answered.
 */
export type CoachAssignmentPlayerStatus = 'not_started' | 'in_progress' | 'complete' | 'dismissed';

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
 * What `POST /assignments/` returns: always a list.
 *
 * One item for a team. For "some players", one per player — the backend model
 * targets a team or exactly one member (a database constraint), so a picked
 * group is several independent assignments, each cancellable on its own.
 */
export interface CoachAssignmentCreated {
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
  displayName: string | null;
  status: CoachAssignmentPlayerStatus;
  firstStartedAt: string | null;
  completedAt: string | null;
  playedGames: number;
  totalGames: number;
  /**
   * The last reminder actually sent and not bounced; null when never reminded.
   * Read from the delivery log (SKI-230).
   */
  lastRemindedAt: string | null;
}

export interface CoachAssignmentDetail {
  assignment: CoachAssignment;
  players: CoachAssignmentPlayer[];
}

export interface CoachAssignmentInput {
  playbookId: string;
  targetType: 'team' | 'player';
  /** Team id, or the player user ids — one assignment each — for a subset. */
  teamId?: number;
  userIds?: number[];
  /** A bare date (`YYYY-MM-DD`) means the end of that day. Weekly needs one. */
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
  /** `nextAllowedAt` is null when waiting will not help (no address, finished). */
  skipped: Array<{
    userId: number;
    displayName: string | null;
    reason: string;
    nextAllowedAt: string | null;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invites (SKI-256)
//
// Transcribed, not proposed: read off `coach/invite_views.py` on marketplace
// `main` (PR #70, SKI-199), which is live on staging. The token is absent on
// purpose — the API never returns it, because an admin holding it could set a
// password in a teacher's name.
// ─────────────────────────────────────────────────────────────────────────────

export type CoachInviteRole = 'Coach' | 'Admin';

/** `Expired` is reissued in place by POSTing again; `Pending` cannot be resent. */
export type CoachInviteStatus = 'Pending' | 'Accepted' | 'Expired';

export interface CoachInvite {
  id: number;
  email: string;
  role: CoachInviteRole;
  status: CoachInviteStatus;
  expires: string;
  organization: { id: number; name: string };
  team: { id: number; name: string } | null;
}

export interface CoachInviteList {
  invites: CoachInvite[];
}

export interface CoachInviteInput {
  organization: number;
  email: string;
  /** Defaults to Coach server-side. Players are never invited — they arrive by roster sync. */
  role?: CoachInviteRole;
  team?: number | null;
}
