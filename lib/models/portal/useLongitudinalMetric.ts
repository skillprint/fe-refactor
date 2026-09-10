'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LongitudinalMetric, MetricRange, generateMockLongitudinalMetric } from './LongitudinalMetric';
import { PortalApiError, portalFetch } from './portalFetch';

/** Time-bucketed detail for one dimension, plus comparison, stats and percentile. */
export function useLongitudinalMetric(
  pillar: string,
  dimension: string,
  useSyntheticData: boolean = false,
  range: MetricRange = 'W'
) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<LongitudinalMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockLongitudinalMetric());
      setIsLoading(false);
      return;
    }
    if (!userToken || !pillar || !dimension) return;
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const json = await portalFetch<LongitudinalMetric>(
        `/metrics/${encodeURIComponent(pillar)}/${encodeURIComponent(dimension)}/?range=${encodeURIComponent(range)}`,
        userToken
      );
      setData(json);
    } catch (err: any) {
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch longitudinal metric:', err);
        setError(err);
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData, pillar, dimension, range]);

  useEffect(() => {
    if (useSyntheticData || userToken) fetchData();
  }, [useSyntheticData, userToken, fetchData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
