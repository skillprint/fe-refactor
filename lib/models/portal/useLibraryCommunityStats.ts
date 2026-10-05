'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LibraryCommunityStats, generateMockLibraryCommunityStats } from './LibraryCommunityStats';
import { PortalApiError, portalFetch } from './portalFetch';

/** Everyone's play on one game (SKI-181). Needs the Knox token; 404 for an unknown game. */
export function useLibraryCommunityStats(slug: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<LibraryCommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockLibraryCommunityStats());
      setIsLoading(false);
      return null;
    }
    if (!userToken || !slug) return null;

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const json = await portalFetch<LibraryCommunityStats>(`/library/community-stats/${encodeURIComponent(slug)}/`, userToken);
      setData(json);
      return json;
    } catch (err: any) {
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch library community stats:', err);
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, slug]);

  useEffect(() => {
    if (useSyntheticData || (userToken && slug)) fetchData();
  }, [useSyntheticData, userToken, slug, fetchData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
