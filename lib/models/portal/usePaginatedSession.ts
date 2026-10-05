'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { PaginatedSession, SessionListQuery, generateMockPaginatedSession } from './PaginatedSession';
import { portalFetch } from './portalFetch';

export function usePaginatedSession(useSyntheticData: boolean = false, query: SessionListQuery = {}) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<PaginatedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { limit, cursor, gameSlug, mood } = query;

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockPaginatedSession());
      setIsLoading(false);
      return;
    }
    if (!userToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      if (cursor) params.set('cursor', cursor);
      if (gameSlug) params.set('game_slug', gameSlug);
      if (mood) params.set('mood', mood);
      const qs = params.toString();
      const json = await portalFetch<PaginatedSession>(`/sessions/${qs ? `?${qs}` : ''}`, userToken);
      setData(json);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, limit, cursor, gameSlug, mood]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
