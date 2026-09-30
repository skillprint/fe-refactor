/**
 * Team and roster writes: create a team; add, rename and remove players (SKI-202).
 *
 * Coaches build their own rosters. The screen refetches the roster after each
 * write rather than patching it locally, so what it shows is always what the
 * server now holds.
 */
import { coachFetch } from './coachFetch';
import type { RosterEntry } from './rosterInput';
import type { CoachAddPlayersResult, CoachRosterRef, CoachTeamInput, CoachTeamSummary } from './types';

export function useCoachRosterWrites() {
  const write = <T,>(path: string, method: string, body?: unknown) =>
    coachFetch<T>(path, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  return {
    /** A coach who creates a team is put on it as its coach. */
    createTeam: (input: CoachTeamInput) => write<CoachTeamSummary>('/teams/', 'POST', input),

    addPlayers: (teamId: number, players: RosterEntry[]) =>
      write<CoachAddPlayersResult>(`/teams/${teamId}/players/`, 'POST', { players }),

    renamePlayer: (teamId: number, userId: number, displayName: string) =>
      write<{ player: CoachRosterRef }>(`/teams/${teamId}/players/${userId}/`, 'PATCH', { displayName }),

    removePlayer: (teamId: number, userId: number) =>
      write<null>(`/teams/${teamId}/players/${userId}/`, 'DELETE'),
  };
}
