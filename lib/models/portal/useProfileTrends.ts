'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { ProfileTrendPeriod, ProfileTrendsResponse, generateMockProfileTrends } from './ProfileTrends';
import { portalFetch } from './portalFetch';

/** Pillar-level time series for the profile performance chart, oldest bucket first. */
export function useProfileTrends(
  useSyntheticData: boolean = false,
  period: ProfileTrendPeriod = 'weekly',
  points: number = 12
) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<ProfileTrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockProfileTrends());
      setIsLoading(false);
      return;
    }
    if (!userToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ period, points: String(points) });
      const json = await portalFetch<ProfileTrendsResponse>(`/profile/trends/?${query.toString()}`, userToken);
      setData(json);
    } catch (err: any) {
      console.error('Failed to fetch profile trends:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, period, points]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
