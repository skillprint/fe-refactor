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
import { CoachApiError } from '../coachFetch';
import type {
  CoachAssignment,
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

function catalogueGame(slug: string): CatalogueGame {
  const game = MOCK_CATALOGUE.find((entry) => entry.slug === slug);
  if (!game) {
    throw new CoachApiError(400, `Unknown game: ${slug}`, {
      games: [`"${slug}" is not in the catalogue.`],
    });
  }
  return game;
}

function toPlaybookGames(slugs: string[]): CoachPlaybookGame[] {
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
    associatedMoods: ['focus'],
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
    pillar: 'mood',
    dimension: '',
    associatedSkills: [],
    associatedMoods: ['relax'],
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
      cadence: 'weekly' as const,
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
        throw new CoachApiError(409, 'This playbook has been assigned and cannot be deleted.', {
          detail: 'Unassign it first, or archive it instead.',
        });
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
  if (assignmentMatch && method === 'GET') {
    const found = assignments.find((a) => a.id === assignmentMatch[1]);
    if (!found) throw new CoachApiError(404, 'Not found.');
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
    throw new CoachApiError(400, 'A playbook needs a title.', {
      title: ['This field is required.'],
    });
  }
  const games = toPlaybookGames(input.games ?? []);

  // A published playbook with no games is assignable and does nothing, so the
  // rule lives on publish rather than on save.
  if (input.status === 'published' && games.length === 0) {
    throw new CoachApiError(400, 'Add at least one game before publishing.', {
      games: ['A published playbook needs at least one game.'],
    });
  }

  const playbook: CoachPlaybook = {
    id: `pb-${nextId++}`,
    slug: input.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title: input.title.trim(),
    description: input.description ?? '',
    status: input.status ?? 'draft',
    pillar: input.pillar ?? 'cognition',
    dimension: input.dimension ?? '',
    associatedSkills: input.associatedSkills ?? [],
    associatedMoods: input.associatedMoods ?? [],
    games,
    estimatedSeconds: estimate(games),
    createdAt: now(),
    updatedAt: now(),
  };
  playbooks.unshift(playbook);
  return playbook;
}

function updatePlaybook(playbook: CoachPlaybook, input: Partial<CoachPlaybookInput>): CoachPlaybook {
  if (input.games) {
    playbook.games = toPlaybookGames(input.games);
    playbook.estimatedSeconds = estimate(playbook.games);
  }
  if (input.status === 'published' && playbook.games.length === 0) {
    throw new CoachApiError(400, 'Add at least one game before publishing.', {
      games: ['A published playbook needs at least one game.'],
    });
  }
  if (input.title !== undefined) playbook.title = input.title.trim();
  if (input.description !== undefined) playbook.description = input.description;
  if (input.status !== undefined) playbook.status = input.status;
  if (input.pillar !== undefined) playbook.pillar = input.pillar;
  if (input.dimension !== undefined) playbook.dimension = input.dimension;
  if (input.associatedSkills !== undefined) playbook.associatedSkills = input.associatedSkills;
  if (input.associatedMoods !== undefined) playbook.associatedMoods = input.associatedMoods;
  playbook.updatedAt = now();
  return playbook;
}

function createAssignment(input: CoachAssignmentInput): CoachAssignment {
  const playbook = playbooks.find((p) => p.id === input?.playbookId);
  if (!playbook) {
    throw new CoachApiError(400, 'Choose a playbook.', { playbookId: ['Unknown playbook.'] });
  }
  if (playbook.status !== 'published') {
    // The reason draft exists at all.
    throw new CoachApiError(400, 'That playbook is still a draft.', {
      playbookId: ['Publish it before assigning it.'],
    });
  }

  let userIds: number[];
  let target: CoachAssignment['target'];

  if (input.targetType === 'team') {
    const team = MOCK_TEAMS.find((t) => t.id === input.teamId);
    if (!team) throw new CoachApiError(400, 'Choose a team.', { teamId: ['Unknown team.'] });
    userIds = playersForTeam(team.id).map((p) => p.userId);
    target = { type: 'team', id: team.id, name: team.name };
  } else {
    userIds = input.userIds ?? [];
    if (userIds.length === 0) {
      throw new CoachApiError(400, 'Choose at least one player.', {
        userIds: ['Select someone to assign this to.'],
      });
    }
    target =
      userIds.length === 1
        ? { type: 'player', id: userIds[0], name: `Player ${userIds[0]}` }
        : { type: 'player', id: userIds[0], name: `${userIds.length} players` };
  }

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
    dueAt: input.dueAt ?? null,
    cadence: input.cadence ?? 'once',
    note: input.note ?? '',
    playerCount: players.length,
    completedCount: 0,
    players,
  };
  assignments.unshift(assignment);
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
