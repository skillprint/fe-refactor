'use client';

/**
 * The player's assignments (SKI-227).
 *
 * Reads `/api/portal/playbooks/` and keeps the `assigned` ones — a filter, not
 * a new endpoint, because SKI-224 adds assignment as a third `source` on the
 * list the portal already fetches.
 *
 * **Behaviour before SKI-224 lands.** Gated on the same sandbox flag as the
 * coach surface: on `playvs` it serves fixtures, and anywhere else it filters a
 * real response that currently contains no assigned playbooks — so the section
 * renders nothing rather than anything false. That is deliberate: this is the
 * *player* portal, and a fake assignment from a fake coach reaching a real
 * player is a worse failure than the feature simply not appearing yet.
 *
 * Dismissal is optimistic and local for now; SKI-224 should give it an
 * endpoint, since the coach is meant to see that it happened.
 */
import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { isCoachMocked } from '../coach/coachFetch';
import { portalFetch } from './portalFetch';
import { AssignedPlaybook, generateMockAssignedPlaybooks } from './AssignedPlaybook';

interface AssignedListResponse {
  playbooks?: Array<AssignedPlaybook & { source?: string }>;
}

export function useAssignedPlaybooks() {
  const { userToken } = useUserSession();
  const [data, setData] = useState<AssignedPlaybook[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (isCoachMocked('playbooks')) {
      setData(generateMockAssignedPlaybooks().filter((row) => row.dismissedAt === null));
      setIsLoading(false);
      return;
    }

    if (!userToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<AssignedListResponse>('/playbooks/', userToken);
      setData(
        (json.playbooks || [])
          .filter((row) => row.source === 'assigned' && row.dismissedAt === null)
          .map(({ source, ...row }) => row),
      );
    } catch (err: any) {
      // A failure here must not break the home page — an assignment section
      // that cannot load is less bad than a home page that will not render.
      console.error('Failed to fetch assigned playbooks:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dismiss = useCallback((assignmentId: string) => {
    setData((current) => (current ?? []).filter((row) => row.assignmentId !== assignmentId));
    // TODO(SKI-224): POST the dismissal so the coach sees it.
  }, []);

  return { data, isLoading, error, refetch: fetchData, dismiss };
}
