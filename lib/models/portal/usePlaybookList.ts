'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { PlaybookListResponse, PlaybookSummary, generateMockPlaybookList, normalizePlaybookSummary } from './Playbooks';
import { portalFetch } from './portalFetch';

/** Authored playbooks first, then the player's generated weak-dimension playbooks. */
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
      setData((json.playbooks || []).map(normalizePlaybookSummary));
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
