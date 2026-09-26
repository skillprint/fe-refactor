/**
 * Mock roster writes (SKI-202), against the same fixtures the roster reads.
 *
 * Mirrors the backend's per-line rules closely enough to exercise every
 * state the screen shows: added, already on the team, and each refusal. One
 * address stands in for "has a Skillprint account elsewhere" so the
 * `needs_support` path can be seen without a live backend.
 */
import { CoachApiError } from '../coachFetch';
import { CoachVisibilityScope } from '../types';
import type { CoachAddPlayerResult } from '../types';
import { MOCK_PLAYERS, MOCK_TEAMS, type MockPlayer } from './fixtures';
import type { MockRequest } from './router';

/** Typing this shows the refusal a real account at another school gets. */
export const MOCK_ELSEWHERE_EMAIL = 'taken@elsewhere.test';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireTeam(teamId: number) {
  if (!MOCK_TEAMS.some((team) => team.id === teamId)) {
    throw new CoachApiError(404, 'Not found.');
  }
}

function ref(player: MockPlayer) {
  return { userId: player.userId, displayName: player.displayName };
}

function refused(email: string | null, code: string, detail: string): CoachAddPlayerResult {
  return { email, status: 'refused', code, detail, player: null };
}

function addOne(teamId: number, entry: unknown, index: number, seen: Set<string>): CoachAddPlayerResult {
  if (!entry || typeof entry !== 'object') {
    return refused(null, 'invalid_entry', `Entry ${index + 1} isn't a player.`);
  }
  const { email: rawEmail, displayName } = entry as { email?: unknown; displayName?: unknown };
  const email = String(rawEmail ?? '').trim().toLowerCase();
  if (!EMAIL.test(email)) return refused(email, 'invalid_email', "That isn't an email address.");
  if (seen.has(email)) return refused(email, 'duplicate', 'This address is already in the list.');
  seen.add(email);
  if (displayName !== undefined && (typeof displayName !== 'string' || displayName.trim().length > 150)) {
    return refused(email, 'invalid_name', 'Names must be text, at most 150 characters.');
  }
  if (email === MOCK_ELSEWHERE_EMAIL) {
    return refused(email, 'needs_support', "This address can't be added from here. Skillprint support can add it for you.");
  }
  const name = typeof displayName === 'string' ? displayName.trim() || null : undefined;

  const existing = MOCK_PLAYERS.filter((player) => player.email === email);
  for (const record of existing) if (name !== undefined) record.displayName = name;
  const onTeam = existing.find((player) => player.teamId === teamId);
  if (onTeam) return { email, status: 'already_on_team', code: null, detail: null, player: ref(onTeam) };

  // A player on another team keeps their user id; a new address gets one.
  const userId = existing[0]?.userId ?? Math.max(...MOCK_PLAYERS.map((p) => p.userId)) + 1;
  const player: MockPlayer = {
    userId,
    email,
    username: '',
    displayName: name ?? existing[0]?.displayName ?? null,
    teamId,
    scope: existing[0]?.scope ?? CoachVisibilityScope.ENGAGEMENT,
    lastPlayedDaysAgo: existing[0]?.lastPlayedDaysAgo ?? null,
    sessionsInRange: existing[0]?.sessionsInRange ?? 0,
    minutesInRange: existing[0]?.minutesInRange ?? 0,
    totalSessions: existing[0]?.totalSessions ?? 0,
    measuredDimensions: existing[0]?.measuredDimensions ?? 0,
  };
  MOCK_PLAYERS.push(player);
  return { email, status: 'added', code: null, detail: null, player: ref(player) };
}

export function rosterRoutes(path: string, request: MockRequest): unknown | undefined {
  const add = path.match(/^\/teams\/(\d+)\/players\/$/);
  if (add && request.method === 'POST') {
    const teamId = Number(add[1]);
    requireTeam(teamId);
    const players = request.body?.players;
    if (!Array.isArray(players) || players.length === 0) {
      throw new CoachApiError(400, 'Send a list of players, each with an email.', { code: 'players_required' });
    }
    if (players.length > 60) {
      throw new CoachApiError(400, 'Add at most 60 players at a time.', { code: 'too_many_players' });
    }
    const seen = new Set<string>();
    return { results: players.map((entry: unknown, index: number) => addOne(teamId, entry, index, seen)) };
  }

  const one = path.match(/^\/teams\/(\d+)\/players\/(\d+)\/$/);
  if (one && (request.method === 'PATCH' || request.method === 'DELETE')) {
    const [teamId, userId] = [Number(one[1]), Number(one[2])];
    requireTeam(teamId);
    const index = MOCK_PLAYERS.findIndex((p) => p.teamId === teamId && p.userId === userId);
    if (index < 0) throw new CoachApiError(404, "That player isn't on this team.", { code: 'not_on_team' });
    if (request.method === 'DELETE') {
      MOCK_PLAYERS.splice(index, 1);
      return null;
    }
    const name = request.body?.displayName;
    if (typeof name !== 'string') {
      throw new CoachApiError(400, "Send the player's new displayName.", { code: 'display_name_required' });
    }
    for (const record of MOCK_PLAYERS) if (record.userId === userId) record.displayName = name.trim() || null;
    return { player: ref(MOCK_PLAYERS[index]) };
  }
  return undefined;
}
