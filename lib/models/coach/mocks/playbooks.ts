/**
 * Mock playbooks, assignments and the catalogue the builder picks from
 * (SKI-225, SKI-226). Retired with the rest by SKI-252.
 *
 * Unlike the read fixtures, this module holds a **mutable store**. A builder
 * whose Save button does nothing is not worth building — the whole question a
 * coach-facing builder has to answer is whether the flow hangs together, and
 * that needs create, edit, reorder and publish to actually stick.
 *
 * The store lives in module scope, so it resets on reload. That is honest about
 * what it is: nothing here is persisted, and the sandbox banner says so.
 */
import { COACH_BASE_URL, CoachApiError } from '../coachFetch';
import { readCoachSession } from '../coachAuth';
import type {
  CoachAssignment,
  CoachAssignmentCreated,
  CoachAssignmentDetail,
  CoachAssignmentInput,
  CoachAssignmentPlayer,
  CoachPlaybook,
  CoachPlaybookGame,
  CoachPlaybookInput,
  CoachRemindResult,
} from '../types';
import { MOCK_TEAMS, findPlayer, isoDaysAgo, playersForTeam } from './fixtures';
import type { MockRequest } from './router';

/** A slice of the public game catalogue, enough for the picker. */
export interface CatalogueGame {
  slug: string;
  name: string;
  suggestedDurationSeconds: number | null;
  skills: string[];
  moods: string[];
}

export const MOCK_CATALOGUE: CatalogueGame[] = [
  { slug: 'reaction-time',  name: 'Reaction Time',  suggestedDurationSeconds: 120, skills: ['processing-speed'], moods: ['focus'] },
  { slug: 'stroop-test',    name: 'Stroop Test',    suggestedDurationSeconds: 180, skills: ['inhibition', 'attention'], moods: ['focus'] },
  { slug: 'simon-says',     name: 'Simon Says',     suggestedDurationSeconds: 240, skills: ['working-memory'], moods: ['focus', 'grit'] },
  { slug: 'hextris',        name: 'Hextris',        suggestedDurationSeconds: 300, skills: ['planning', 'task-switching'], moods: ['grit'] },
  { slug: 'dungeon-runner', name: 'Dungeon Runner', suggestedDurationSeconds: 420, skills: ['attention', 'planning'], moods: ['grit'] },
  { slug: 'order-rush',     name: 'Order Rush',     suggestedDurationSeconds: 360, skills: ['task-switching', 'planning'], moods: ['focus'] },
  { slug: 'typing-speed',   name: 'Typing Speed',   suggestedDurationSeconds: 150, skills: ['processing-speed'], moods: ['relax'] },
  { slug: 'breathe',        name: 'Breathe',        suggestedDurationSeconds: 300, skills: [], moods: ['relax'] },
];

/** Refuse the way the real endpoint does: `{code, detail: [message]}`. */
function refuse(status: number, code: string, message: string): never {
  throw new CoachApiError(status, message, { code, detail: [message] });
}

function catalogueGame(slug: string): CatalogueGame {
  const game = MOCK_CATALOGUE.find((entry) => entry.slug === slug);
  if (!game) {
    refuse(400, 'unknown_game', `Not in the catalogue: ${slug}.`);
  }
  return game;
}

function toPlaybookGames(slugs: string[]): CoachPlaybookGame[] {
  const repeated = [...new Set(slugs.filter((slug, i) => slugs.indexOf(slug) !== i))];
  if (repeated.length) {
    refuse(400, 'duplicate_game', `Each game can appear once; listed twice: ${repeated.join(', ')}.`);
  }
  return slugs.map((slug, index) => {
    const game = catalogueGame(slug);
    return {
      slug: game.slug,
      name: game.name,
      position: index,
      suggestedDurationSeconds: game.suggestedDurationSeconds,
    };
  });
}

const estimate = (games: CoachPlaybookGame[]) =>
  games.reduce((total, game) => total + (game.suggestedDurationSeconds ?? 0), 0);

// ── store ────────────────────────────────────────────────────────────────────

let nextId = 3;
const now = () => new Date().toISOString();

const playbooks: CoachPlaybook[] = [
  {
    id: 'pb-1',
    slug: 'match-day-warm-up',
    title: 'Match-day warm-up',
    description: 'Ten minutes before first serve. Wakes up reaction time and attention without burning focus.',
    status: 'published',
    pillar: 'cognition',
    dimension: 'attention',
    associatedSkills: ['processing-speed', 'attention'],
    organization: 77,
    games: toPlaybookGames(['reaction-time', 'stroop-test', 'simon-says']),
    estimatedSeconds: 540,
    createdAt: isoDaysAgo(24),
    updatedAt: isoDaysAgo(6),
  },
  {
    id: 'pb-2',
    slug: 'post-scrim-winddown',
    title: 'Post-scrim wind-down',
    description: 'After a long practice. Deliberately low-pressure.',
    status: 'draft',
    pillar: 'cognition',
    dimension: '',
    associatedSkills: [],
    organization: 77,
    games: toPlaybookGames(['breathe', 'typing-speed']),
    estimatedSeconds: 450,
    createdAt: isoDaysAgo(9),
    updatedAt: isoDaysAgo(9),
  },
];

interface StoredAssignment extends CoachAssignment {
  players: CoachAssignmentPlayer[];
}

const assignments: StoredAssignment[] = [
  (() => {
    const team = MOCK_TEAMS[0];
    const roster = playersForTeam(team.id);
    const playbook = playbooks[0];
    const players: CoachAssignmentPlayer[] = roster.map((player, index) => {
      // Spread across the three states so the status screen has all of them.
      const played = index % 3 === 0 ? playbook.games.length : index % 3 === 1 ? 1 : 0;
      const status =
        played >= playbook.games.length ? 'complete' : played > 0 ? 'in_progress' : 'not_started';
      return {
        userId: player.userId,
        status,
        firstStartedAt: played > 0 ? isoDaysAgo(4) : null,
        completedAt: status === 'complete' ? isoDaysAgo(2) : null,
        playedGames: played,
        totalGames: playbook.games.length,
        lastRemindedAt: null,
      };
    });
    return {
      id: 'as-1',
      playbook: { id: playbook.id, title: playbook.title },
      target: { type: 'team' as const, id: team.id, name: team.name },
      assignedAt: isoDaysAgo(7),
      dueAt: isoDaysAgo(-3),
      cadence: 'Weekly' as const,
      status: 'Active' as const,
      note: 'Before Tuesday’s match. Ten minutes, no excuses.',
      playerCount: players.length,
      completedCount: players.filter((p) => p.status === 'complete').length,
      players,
    };
  })(),
];

const summary = ({ players, ...rest }: StoredAssignment): CoachAssignment => rest;

// ── remind rate limit ────────────────────────────────────────────────────────

/**
 * How long before the same player can be reminded again.
 *
 * SKI-226 asks for this explicitly: a coach must not be able to mail a
 * teenager six times in an afternoon. Enforced here *and* owed on the server —
 * a client-side limit is a courtesy, not a control, and the ticket for the real
 * one is SKI-232.
 */
export const REMIND_COOLDOWN_HOURS = 24;

// ── routes ───────────────────────────────────────────────────────────────────

/**
 * Returns `undefined` when the path is not ours, so the caller falls through to
 * the read routes.
 */
export function playbookRoutes(
  path: string,
  params: URLSearchParams,
  request: MockRequest,
): unknown | undefined {
  const { method, body } = request;

  if (path === '/catalogue/') {
    return { games: MOCK_CATALOGUE };
  }

  if (path === '/playbooks/') {
    if (method === 'GET') {
      const status = params.get('status');
      return {
        playbooks: playbooks.filter((p) => !status || p.status === status),
      };
    }
    if (method === 'POST') return createPlaybook(body as CoachPlaybookInput);
  }

  const playbookMatch = path.match(/^\/playbooks\/([\w-]+)\/$/);
  if (playbookMatch) {
    const playbook = playbooks.find((p) => p.id === playbookMatch[1]);
    if (!playbook) throw new CoachApiError(404, 'Not found.');
    if (method === 'GET') return playbook;
    if (method === 'PATCH') return updatePlaybook(playbook, body as Partial<CoachPlaybookInput>);
    if (method === 'DELETE') {
      if (assignments.some((a) => a.playbook.id === playbook.id)) {
        // Deleting a playbook out from under a live assignment would leave
        // players holding a link to nothing.
        refuse(409, 'playbook_assigned', "This playbook has been assigned and can't be deleted.");
      }
      playbooks.splice(playbooks.indexOf(playbook), 1);
      return { deleted: true };
    }
  }

  if (path === '/assignments/') {
    if (method === 'GET') return { assignments: assignments.map(summary) };
    if (method === 'POST') return createAssignment(body as CoachAssignmentInput);
  }

  const assignmentMatch = path.match(/^\/assignments\/([\w-]+)\/$/);
  if (assignmentMatch && (method === 'GET' || method === 'PATCH')) {
    const found = assignments.find((a) => a.id === assignmentMatch[1]);
    if (!found) refuse(404, 'not_found', 'No such assignment.');
    if (method === 'PATCH') return closeAssignment(found, body?.status);
    return { assignment: summary(found), players: found.players } as CoachAssignmentDetail;
  }

  const remindMatch = path.match(/^\/assignments\/([\w-]+)\/remind\/$/);
  if (remindMatch && method === 'POST') {
    const found = assignments.find((a) => a.id === remindMatch[1]);
    if (!found) throw new CoachApiError(404, 'Not found.');
    return remind(found, (body?.userIds as number[] | undefined) ?? null);
  }

  return undefined;
}

function createPlaybook(input: CoachPlaybookInput): CoachPlaybook {
  if (!input?.title?.trim()) {
    refuse(400, 'title_required', 'A playbook needs a title.');
  }
  const games = toPlaybookGames(input.games ?? []);

  // A published playbook with no games is assignable and does nothing, so the
  // rule lives on publish rather than on save.
  if (input.status === 'published' && games.length === 0) {
    refuse(400, 'playbook_empty', 'Add at least one game before publishing.');
  }

  const playbook: CoachPlaybook = {
    id: `pb-${nextId++}`,
    slug: input.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title: input.title.trim(),
    description: input.description ?? '',
    status: input.status ?? 'draft',
    pillar: 'cognition',
    dimension: input.dimension ?? '',
    associatedSkills: input.associatedSkills ?? [],
    organization: 77,
    games,
    estimatedSeconds: estimate(games),
    createdAt: now(),
    updatedAt: now(),
  };
  playbooks.unshift(playbook);
  return playbook;
}

function updatePlaybook(playbook: CoachPlaybook, input: Partial<CoachPlaybookInput>): CoachPlaybook {
  // Validate everything before changing anything, as the real endpoint's
  // transaction does — a refused save must not leave half the edit applied.
  const games = input.games ? toPlaybookGames(input.games) : playbook.games;
  const status = input.status ?? playbook.status;
  if (input.title !== undefined && !input.title.trim()) {
    refuse(400, 'title_required', 'A playbook needs a title.');
  }
  if (status === 'published' && games.length === 0) {
    refuse(400, 'playbook_empty', 'Add at least one game before publishing.');
  }
  if (
    status === 'draft' &&
    playbook.status === 'published' &&
    assignments.some((a) => a.playbook.id === playbook.id)
  ) {
    refuse(409, 'playbook_assigned', "This playbook has been assigned, so it can't go back to being a draft.");
  }

  playbook.games = games;
  playbook.estimatedSeconds = estimate(games);
  if (input.title !== undefined) playbook.title = input.title.trim();
  if (input.description !== undefined) playbook.description = input.description;
  if (input.status !== undefined) playbook.status = input.status;
  if (input.dimension !== undefined) playbook.dimension = input.dimension;
  if (input.associatedSkills !== undefined) playbook.associatedSkills = input.associatedSkills;
  playbook.updatedAt = now();
  return playbook;
}

/**
 * A live team's roster, for mixed mode. Fails the way the create would if the
 * team were not the coach's: the live endpoint 404s, and so does this.
 */
async function liveRoster(teamId: number | undefined): Promise<{ name: string; userIds: number[] }> {
  if (teamId === undefined) {
    throw new CoachApiError(400, 'Choose a team.', { teamId: ['This field is required.'] });
  }
  const session = readCoachSession();
  const response = await fetch(`${COACH_BASE_URL}/teams/${teamId}/roster/`, {
    headers: session ? { Authorization: `Token ${session.token}` } : {},
  });
  if (!response.ok) {
    throw new CoachApiError(response.status === 404 ? 400 : response.status, 'Choose a team.', {
      teamId: ['Unknown team.'],
    });
  }
  const body = (await response.json()) as { team: { name: string }; players: Array<{ userId: number }> };
  return { name: body.team.name, userIds: body.players.map((player) => player.userId) };
}

/** `dueAt` as the server reads it: a bare date means the end of that day. */
function parseDue(value: string | null | undefined): string | null {
  if (!value) return null;
  const moment = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T23:59:59.999`)
    : new Date(value);
  if (Number.isNaN(moment.getTime())) {
    refuse(400, 'invalid_due', 'dueAt must be a date or a datetime.');
  }
  if (moment.getTime() < Date.now()) {
    refuse(400, 'due_in_past', 'The due date has already passed.');
  }
  return moment.toISOString();
}

/**
 * Mirrors `POST /api/coach/assignments/` (marketplace PR #75).
 *
 * **"Some players" is one assignment per player.** The backend model targets a
 * team or exactly one member — a database constraint — so a hand-picked group
 * becomes several assignments, and the response is always a list.
 */
async function createAssignment(input: CoachAssignmentInput): Promise<CoachAssignmentCreated> {
  const playbook = playbooks.find((p) => p.id === input?.playbookId);
  if (!playbook) {
    refuse(400, 'unknown_playbook', 'Choose one of your playbooks.');
  }
  if (playbook.status !== 'published') {
    // The reason draft exists at all.
    refuse(400, 'playbook_draft', 'That playbook is still a draft — publish it first.');
  }

  const cadence = input.cadence ?? 'OneOff';
  if (cadence !== 'OneOff' && cadence !== 'Weekly') {
    refuse(400, 'invalid_cadence', 'cadence must be OneOff or Weekly.');
  }
  const dueAt = parseDue(input.dueAt);
  if (cadence === 'Weekly' && dueAt === null) {
    refuse(400, 'due_required', 'A weekly assignment needs a due date.');
  }
  const note = input.note ?? '';
  if (note.length > 2000) {
    refuse(400, 'note_too_long', 'Keep the note under 2000 characters.');
  }

  const targets: Array<{ target: CoachAssignment['target']; userIds: number[] }> = [];

  if (input.targetType === 'team') {
    const team = MOCK_TEAMS.find((t) => t.id === input.teamId);
    if (team) {
      targets.push({
        target: { type: 'team', id: team.id, name: team.name },
        userIds: playersForTeam(team.id).map((p) => p.userId),
      });
    } else {
      // Mixed mode: teams are live but assignments are not, so the team the
      // coach picked is a real one this store has never heard of. Rather than
      // refuse it, read its roster from the live API and fan out to the real
      // players — the one place a mocked area reaches into a live one.
      const live = await liveRoster(input.teamId);
      targets.push({
        target: { type: 'team', id: input.teamId as number, name: live.name },
        userIds: live.userIds,
      });
    }
  } else if (input.targetType === 'player') {
    const userIds = [...new Set(input.userIds ?? [])];
    if (userIds.length === 0) {
      refuse(400, 'players_required', 'Choose at least one player.');
    }
    for (const userId of userIds) {
      targets.push({ target: { type: 'player', id: userId, name: `Player ${userId}` }, userIds: [userId] });
    }
  } else {
    refuse(400, 'invalid_target', "targetType must be 'team' or 'player'.");
  }

  const created = targets.map(({ target, userIds }) => {
    // Fanned out per player at creation, mirroring PlaybookAssignmentPlayer
    // (SKI-220) — so a roster change later cannot rewrite who was assigned.
    const players: CoachAssignmentPlayer[] = userIds.map((userId) => ({
      userId,
      status: 'not_started',
      firstStartedAt: null,
      completedAt: null,
      playedGames: 0,
      totalGames: playbook.games.length,
      lastRemindedAt: null,
    }));
    const assignment: StoredAssignment = {
      id: `as-${nextId++}`,
      playbook: { id: playbook.id, title: playbook.title },
      target,
      assignedAt: now(),
      dueAt,
      cadence,
      status: 'Active',
      note,
      playerCount: players.length,
      completedCount: 0,
      players,
    };
    return assignment;
  });
  assignments.unshift(...created);
  return { assignments: created.map(summary) };
}

/** Close or cancel: one way, and only from Active — as the server allows. */
function closeAssignment(assignment: StoredAssignment, wanted: unknown): CoachAssignment {
  if (wanted !== 'Completed' && wanted !== 'Cancelled') {
    refuse(400, 'invalid_status', 'status must be Completed or Cancelled.');
  }
  if (assignment.status !== 'Active') {
    refuse(409, 'assignment_closed', 'This assignment is already closed.');
  }
  assignment.status = wanted;
  return summary(assignment);
}

function remind(assignment: StoredAssignment, userIds: number[] | null): CoachRemindResult {
  const cutoff = Date.now() - REMIND_COOLDOWN_HOURS * 3600 * 1000;
  const reminded: number[] = [];
  const skipped: CoachRemindResult['skipped'] = [];

  for (const player of assignment.players) {
    if (userIds && !userIds.includes(player.userId)) continue;

    // Nobody is chased for something they have finished.
    if (player.status === 'complete') continue;

    const last = player.lastRemindedAt ? new Date(player.lastRemindedAt).getTime() : null;
    if (last !== null && last > cutoff) {
      skipped.push({
        userId: player.userId,
        reason: `Reminded in the last ${REMIND_COOLDOWN_HOURS} hours.`,
        nextAllowedAt: new Date(last + REMIND_COOLDOWN_HOURS * 3600 * 1000).toISOString(),
      });
      continue;
    }

    // Emailing needs a real address, which partner-provisioned players may not
    // have (SKI-228). Surfaced rather than silently dropped.
    const known = findPlayer(player.userId);
    if (!known) {
      skipped.push({
        userId: player.userId,
        reason: 'No email address on file.',
        nextAllowedAt: now(),
      });
      continue;
    }

    player.lastRemindedAt = now();
    reminded.push(player.userId);
  }

  return { remindedUserIds: reminded, skipped };
}
