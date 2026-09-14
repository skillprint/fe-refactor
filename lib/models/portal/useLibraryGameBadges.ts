'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LibraryGameBadgesResponse, generateMockLibraryGameBadges } from './LibraryGameBadges';
import { PortalApiError, portalFetch } from './portalFetch';

/** The badges a game works toward and the player's standing on each (SKI-182). Needs the Knox token; 404 for an unknown game. */
export function useLibraryGameBadges(slug: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<LibraryGameBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockLibraryGameBadges());
      setIsLoading(false);
      return null;
    }
    if (!userToken || !slug) return null;

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const json = await portalFetch<LibraryGameBadgesResponse>(`/library/games/${encodeURIComponent(slug)}/badges/`, userToken);
      setData(json);
      return json;
    } catch (err: any) {
      setData(null);
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch library game badges:', err);
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
