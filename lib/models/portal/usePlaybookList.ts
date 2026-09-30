'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { PlaybookListResponse, PlaybookSummary, generateMockPlaybookList, normalizePlaybookSummary } from './Playbooks';
import { portalFetch } from './portalFetch';

/**
 * Authored playbooks first, then the player's generated weak-dimension playbooks.
 *
 * Coach-assigned entries (SKI-224) are dropped here. The API lists them first,
 * and the home widget features the first playbook in this list, so passing them
 * through would quietly change what every existing surface shows. They have
 * their own hook, `useAssignedPlaybooks`, and their own section on the home.
 */
export function usePlaybookList(useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<PlaybookSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockPlaybookList().playbooks);
      setIsLoading(false);
      return;
    }
    if (!userToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<PlaybookListResponse>('/playbooks/', userToken);
      setData(
        (json.playbooks || [])
          .filter((raw) => raw.source !== 'assigned')
          .map(normalizePlaybookSummary),
      );
    } catch (err: any) {
      console.error('Failed to fetch playbooks:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
