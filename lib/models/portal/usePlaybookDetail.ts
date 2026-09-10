'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { PlaybookDetail, generateMockPlaybookDetail, normalizePlaybookDetail } from './Playbooks';
import { PortalApiError, portalFetch } from './portalFetch';

/** Hydrated playbook: ordered games, target skills and the player's progress. */
export function usePlaybookDetail(slug: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<PlaybookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockPlaybookDetail(slug));
      setIsLoading(false);
      return;
    }
    if (!userToken || !slug) return;
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const json = await portalFetch<PlaybookDetail>(`/playbooks/${encodeURIComponent(slug)}/`, userToken);
      setData(normalizePlaybookDetail(json));
    } catch (err: any) {
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch playbook:', err);
        setError(err);
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, slug]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
