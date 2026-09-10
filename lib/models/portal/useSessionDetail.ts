'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { SessionDetail, generateMockSessionDetail } from './SessionDetail';
import { portalFetch } from './portalFetch';

export function useSessionDetail(sessionId: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setIsLoading(true);
      setTimeout(() => {
        setData(generateMockSessionDetail());
        setIsLoading(false);
      }, 500);
      return null;
    }
    if (!userToken || !sessionId) return null;

    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<SessionDetail>(`/sessions/${encodeURIComponent(sessionId)}/`, userToken);
      setData(json);
      return json;
    } catch (err: any) {
      console.error('Failed to fetch session detail:', err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, sessionId]);

  useEffect(() => {
    if (useSyntheticData || (userToken && sessionId)) fetchData();
  }, [useSyntheticData, userToken, sessionId, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
