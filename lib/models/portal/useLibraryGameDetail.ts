'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LibraryGameDetail, generateMockLibraryGameDetail } from './LibraryGameDetail';
import { PortalApiError, portalFetch } from './portalFetch';

/**
 * One game's library record (SKI-179). The endpoint is public for the SPA
 * origin, so it is fetched as soon as there is a slug; the Knox token is sent
 * when we have one and only triggers a retry when the anonymous request
 * failed. `notFound` is true for a slug the catalog does not know.
 */
export function useLibraryGameDetail(slug: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<LibraryGameDetail | null>(null);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockLibraryGameDetail());
      setFetchedFor(slug);
      setIsLoading(false);
      return null;
    }
    if (!slug) {
      setData(null);
      setNotFound(true);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const json = await portalFetch<LibraryGameDetail>(`/library/games/${encodeURIComponent(slug)}/`, userToken);
      setData(json);
      setFetchedFor(slug);
      return json;
    } catch (err: any) {
      setData(null);
      setFetchedFor(slug);
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch library game detail:', err);
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, slug]);

  useEffect(() => {
    if (fetchedFor === slug && !error) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, userToken, useSyntheticData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
