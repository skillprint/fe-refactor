'use client';

/**
 * Coach data hooks (SKI-214).
 *
 * One thin wrapper per endpoint on `/api/coach/`. Each names its path and its
 * query parameters and nothing else; everything about fetching, tokens, race
 * conditions and error shape lives in `useCoachResource`.
 *
 * Passing `null` as the id disables the request, so a screen can render its
 * shell before a route parameter resolves without a conditional hook call.
 */
import { useCoachResource, type CoachResource } from './useCoachResource';
import type {
  CoachContext,
  CoachPlayerDetail,
  CoachPlayerSessions,
  CoachPlayerTrends,
  CoachRoster,
  CoachTeamGames,
  CoachTeamList,
  CoachTeamTrends,
} from './types';

export * from './types';
export { CoachApiError, COACH_MOCKS_ENABLED, COACH_BASE_URL, coachFetch } from './coachFetch';
export { useCoachResource } from './useCoachResource';
export { CoachAuthProvider, useCoachAuth } from './CoachAuthContext';
export {
  clearCoachSession,
  coachLogin,
  coachLogout,
  readCoachSession,
  requestPasswordReset,
  setPassword,
  writeCoachSession,
} from './coachAuth';
export type { CoachSession } from './coachAuth';
export {
  useCoachAssignment,
  useCoachAssignments,
  useCoachCatalogue,
  useCoachPlaybook,
  useCoachPlaybooks,
  useCoachWrites,
} from './usePlaybooks';
export type { CoachCatalogue } from './usePlaybooks';
export type { CoachResource } from './useCoachResource';

/** Whether the caller coaches anything — asked before rendering `/coach`. */
export function useCoachContext(): CoachResource<CoachContext> {
  return useCoachResource<CoachContext>('/context/');
}

export function useCoachTeams(): CoachResource<CoachTeamList> {
  return useCoachResource<CoachTeamList>('/teams/');
}

export function useCoachRoster(teamId: number | null, days = 30): CoachResource<CoachRoster> {
  return useCoachResource<CoachRoster>(teamId === null ? null : `/teams/${teamId}/roster/`, {
    params: { days },
  });
}

export function useCoachTeamTrends(
  teamId: number | null,
  days = 90,
  bucket: 'day' | 'week' = 'week',
): CoachResource<CoachTeamTrends> {
  return useCoachResource<CoachTeamTrends>(teamId === null ? null : `/teams/${teamId}/trends/`, {
    params: { days, bucket },
  });
}

export function useCoachTeamGames(
  teamId: number | null,
  days = 30,
  sort: 'plays' | 'score' = 'plays',
): CoachResource<CoachTeamGames> {
  return useCoachResource<CoachTeamGames>(teamId === null ? null : `/teams/${teamId}/games/`, {
    params: { days, sort },
  });
}

export function useCoachPlayer(userId: number | null, days = 30): CoachResource<CoachPlayerDetail> {
  return useCoachResource<CoachPlayerDetail>(userId === null ? null : `/players/${userId}/`, {
    params: { days },
  });
}

/** Level-3 grant required; a 403 here is a consent gap, not a failure. */
export function useCoachPlayerSessions(
  userId: number | null,
  limit = 25,
): CoachResource<CoachPlayerSessions> {
  return useCoachResource<CoachPlayerSessions>(
    userId === null ? null : `/players/${userId}/sessions/`,
    { params: { limit } },
  );
}

/** Level-2 grant required. */
export function useCoachPlayerTrends(
  userId: number | null,
  days = 90,
): CoachResource<CoachPlayerTrends> {
  return useCoachResource<CoachPlayerTrends>(
    userId === null ? null : `/players/${userId}/trends/`,
    { params: { days } },
  );
}
