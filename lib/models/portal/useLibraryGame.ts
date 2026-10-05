'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LibraryGame, generateMockLibraryGames } from './LibraryGame';
import { portalFetch } from './portalFetch';

/**
 * The library games list (SKI-179): active, PWA-playable, publicly listed,
 * one record per base slug. Public for the SPA origin, so fetched on mount;
 * the Knox token is sent when we have one and only triggers a retry when the
 * anonymous request failed.
 */
export function useLibraryGame(useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<LibraryGame[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // A token arriving while the anonymous request is in flight must not start a second one.
  const inFlight = useRef(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockLibraryGames());
      setIsLoading(false);
      return null;
    }
    if (inFlight.current) return null;
    inFlight.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<LibraryGame[] | { results: LibraryGame[] }>('/library/games/', userToken);
      const games = Array.isArray(json) ? json : json?.results || [];
      setData(games);
      return games;
    } catch (err: any) {
      console.error('Failed to fetch library games:', err);
      setError(err);
      return null;
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData]);

  useEffect(() => {
    if (data && !error) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken, useSyntheticData]);

  return { data, isLoading, error, refetch: fetchData };
}
