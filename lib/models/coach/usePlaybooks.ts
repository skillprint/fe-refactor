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
import { useEffect, useState } from 'react';
import { useCoachResource, type CoachResource } from './useCoachResource';
import { portalFetch } from '../portal/portalFetch';
import type { LibraryGame } from '../portal/LibraryGame';
import { coachFetch, isCoachMocked } from './coachFetch';
import type {
  CoachAssignment,
  CoachAssignmentCreated,
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
 * The catalogue the builder picks from.
 *
 * Mocked, it comes from the coach mock router like everything else. Live, it
 * is the public game library, `GET /api/portal/library/games/` — the same
 * list players browse, already folded to one record per game with the
 * canonical `slug`, which is exactly what `POST /api/coach/playbooks/`
 * resolves (marketplace PR #74). There is deliberately no coach-side copy of
 * the catalogue to drift from it.
 */
export function useCoachCatalogue(): CoachResource<CoachCatalogue> {
  const mocked = isCoachMocked('playbooks');
  const mock = useCoachResource<CoachCatalogue>(mocked ? '/catalogue/' : null);

  const [live, setLive] = useState<{ data: CoachCatalogue | null; error: Error | null; isLoading: boolean }>({
    data: null,
    error: null,
    isLoading: !mocked,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (mocked) return;
    let cancelled = false;
    setLive((current) => ({ ...current, isLoading: true, error: null }));
    // Public and origin-gated, so no token is needed.
    portalFetch<LibraryGame[] | { results: LibraryGame[] }>('/library/games/')
      .then((json) => {
        if (cancelled) return;
        const games = Array.isArray(json) ? json : json?.results ?? [];
        setLive({
          isLoading: false,
          error: null,
          data: {
            games: games.map((game) => ({
              slug: game.slug,
              name: game.name,
              suggestedDurationSeconds: game.suggestedDurationSeconds,
              skills: game.skills ?? [],
              moods: game.moods ?? [],
            })),
          },
        });
      })
      .catch((caught) => {
        if (!cancelled) {
          setLive({ data: null, isLoading: false, error: caught instanceof Error ? caught : new Error(String(caught)) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mocked, attempt]);

  if (mocked) return mock;
  return { ...live, refetch: () => setAttempt((n) => n + 1) };
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
  const write = <T,>(path: string, method: string, body?: unknown) =>
    coachFetch<T>(path, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  return {
    createPlaybook: (input: CoachPlaybookInput) =>
      write<CoachPlaybook>('/playbooks/', 'POST', input),

    updatePlaybook: (id: string, input: Partial<CoachPlaybookInput>) =>
      write<CoachPlaybook>(`/playbooks/${id}/`, 'PATCH', input),

    deletePlaybook: (id: string) => write<{ deleted: boolean }>(`/playbooks/${id}/`, 'DELETE'),

    /** Always a list: one per player when assigning to "some players". */
    createAssignment: (input: CoachAssignmentInput) =>
      write<CoachAssignmentCreated>('/assignments/', 'POST', input),

    /** Close or cancel. One way: a closed assignment is never reopened. */
    closeAssignment: (id: string, status: 'Completed' | 'Cancelled') =>
      write<CoachAssignment>(`/assignments/${id}/`, 'PATCH', { status }),

    /** `userIds` omitted reminds everyone who is not finished. */
    remind: (assignmentId: string, userIds?: number[]) =>
      write<CoachRemindResult>(`/assignments/${assignmentId}/remind/`, 'POST', { userIds }),
  };
}
