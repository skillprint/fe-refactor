'use client';

/**
 * Playbook and assignment hooks, plus the writes (SKI-225, SKI-226).
 *
 * Reads reuse `useCoachResource`. Writes are plain async functions rather than
 * hooks: a save happens in an event handler, not during render, and wrapping it
 * in a hook would only add state the caller already has.
 *
 * Every write takes the caller's token explicitly, so nothing here has to reach
 * into context and the functions stay testable.
 */
import { useCoachResource, type CoachResource } from './useCoachResource';
import { coachFetch } from './coachFetch';
import { useCoachAuth } from './CoachAuthContext';
import type {
  CoachAssignment,
  CoachAssignmentDetail,
  CoachAssignmentInput,
  CoachAssignmentList,
  CoachPlaybook,
  CoachPlaybookInput,
  CoachPlaybookList,
  CoachRemindResult,
} from './types';

/** The catalogue the builder picks from — public reference data. */
export interface CoachCatalogue {
  games: Array<{
    slug: string;
    name: string;
    suggestedDurationSeconds: number | null;
    skills: string[];
    moods: string[];
  }>;
}

/**
 * Deliberately served from the coach surface rather than reusing the portal's
 * `useLibraryGame`. The catalogue is the same public data either way, but
 * routing it through `coachFetch` means the builder runs on fixtures with
 * everything else instead of being the one screen that needs a live backend.
 * SKI-252 should point this at `/api/portal/library/games/`.
 */
export function useCoachCatalogue(): CoachResource<CoachCatalogue> {
  return useCoachResource<CoachCatalogue>('/catalogue/');
}

export function useCoachPlaybooks(status?: 'draft' | 'published'): CoachResource<CoachPlaybookList> {
  return useCoachResource<CoachPlaybookList>('/playbooks/', { params: { status } });
}

export function useCoachPlaybook(id: string | null): CoachResource<CoachPlaybook> {
  return useCoachResource<CoachPlaybook>(id ? `/playbooks/${id}/` : null);
}

export function useCoachAssignments(): CoachResource<CoachAssignmentList> {
  return useCoachResource<CoachAssignmentList>('/assignments/');
}

export function useCoachAssignment(id: string | null): CoachResource<CoachAssignmentDetail> {
  return useCoachResource<CoachAssignmentDetail>(id ? `/assignments/${id}/` : null);
}

/** The write helpers, bound to the current coach session. */
export function useCoachWrites() {
  const { session } = useCoachAuth();
  const token = session?.token ?? null;

  const write = <T,>(path: string, method: string, body?: unknown) =>
    coachFetch<T>(path, token, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  return {
    createPlaybook: (input: CoachPlaybookInput) =>
      write<CoachPlaybook>('/playbooks/', 'POST', input),

    updatePlaybook: (id: string, input: Partial<CoachPlaybookInput>) =>
      write<CoachPlaybook>(`/playbooks/${id}/`, 'PATCH', input),

    deletePlaybook: (id: string) => write<{ deleted: boolean }>(`/playbooks/${id}/`, 'DELETE'),

    createAssignment: (input: CoachAssignmentInput) =>
      write<CoachAssignment>('/assignments/', 'POST', input),

    /** `userIds` omitted reminds everyone who is not finished. */
    remind: (assignmentId: string, userIds?: number[]) =>
      write<CoachRemindResult>(`/assignments/${assignmentId}/remind/`, 'POST', { userIds }),
  };
}
