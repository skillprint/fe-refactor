'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { ProfileBadgesResponse, generateMockProfileBadges } from './ProfileBadges';
import { portalFetch } from './portalFetch';

/** Badges the signed-in player has earned, newest first, with collection totals. */
export function useProfileBadges(useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<ProfileBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockProfileBadges());
      setIsLoading(false);
      return;
    }
    if (!userToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<ProfileBadgesResponse>('/profile/badges/', userToken);
      setData(json);
    } catch (err: any) {
      console.error('Failed to fetch profile badges:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
