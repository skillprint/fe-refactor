'use client';

/** Coach challenges (SKI-218): list, one with its players, the leaderboard, and writes. */
import { coachFetch } from './coachFetch';
import { useCoachResource, type CoachResource } from './useCoachResource';
import type {
  CoachChallenge,
  CoachChallengeDetail,
  CoachChallengeInput,
  CoachChallengeLeaderboard,
  CoachChallengeList,
  CoachLeaderboardScope,
} from './types';

export function useCoachChallenges(): CoachResource<CoachChallengeList> {
  return useCoachResource<CoachChallengeList>('/challenges/');
}

export function useCoachChallenge(id: number | null): CoachResource<CoachChallengeDetail> {
  return useCoachResource<CoachChallengeDetail>(id === null ? null : `/challenges/${id}/`);
}

export function useCoachChallengeLeaderboard(
  id: number | null,
  scope: CoachLeaderboardScope,
): CoachResource<CoachChallengeLeaderboard> {
  return useCoachResource<CoachChallengeLeaderboard>(id === null ? null : `/challenges/${id}/leaderboard/`, {
    params: { scope },
  });
}

export function useCoachChallengeWrites() {
  const write = <T,>(path: string, method: string, body: unknown) =>
    coachFetch<T>(path, { method, body: JSON.stringify(body) });
  return {
    createChallenge: (input: CoachChallengeInput) => write<CoachChallenge>('/challenges/', 'POST', input),
    cancelChallenge: (id: number) => write<CoachChallenge>(`/challenges/${id}/`, 'PATCH', { status: 'Cancelled' }),
  };
}
