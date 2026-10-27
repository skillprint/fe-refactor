'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { HomeHighlights, generateMockHomeHighlights } from './HomeHighlights';
import { PortalApiError, portalFetch } from './portalFetch';

/**
 * The most played games of the last `days` days with their top scores
 * (marketplace #149). Needs the Knox token; `notFound` while the backend
 * does not serve the endpoint yet.
 */
export function useHomeHighlights(useSyntheticData: boolean = false, days: number = 7, limit: number = 6) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<HomeHighlights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockHomeHighlights());
      setIsLoading(false);
      return null;
    }
    if (!userToken) return null;

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const query = new URLSearchParams({ days: String(days), limit: String(limit) });
      const json = await portalFetch<HomeHighlights>(`/home/highlights/?${query}`, userToken);
      setData(json);
      return json;
    } catch (err: any) {
      setData(null);
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch home highlights:', err);
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, days, limit]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
