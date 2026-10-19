'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { MetricDistribution, generateMockMetricDistribution } from './MetricDistribution';
import { portalFetch } from './portalFetch';

export function useMetricDistribution(pillar: string, dimension: string, useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<MetricDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setIsLoading(true);
      setTimeout(() => {
        setData(generateMockMetricDistribution(pillar, dimension));
        setIsLoading(false);
      }, 500); // Simulate network delay
      return null;
    }
    if (!userToken || !pillar || !dimension) return null;

    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<MetricDistribution>(
        `/metrics/${encodeURIComponent(pillar)}/${encodeURIComponent(dimension)}/distribution/`,
        userToken,
      );
      setData(json);
      return json;
    } catch (err: any) {
      console.error('Failed to fetch metric distribution:', err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, pillar, dimension]);

  useEffect(() => {
    if (useSyntheticData || (userToken && pillar && dimension)) fetchData();
  }, [useSyntheticData, userToken, pillar, dimension, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
