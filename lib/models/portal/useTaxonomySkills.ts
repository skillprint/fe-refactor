'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { TaxonomySkillsResponse, generateMockTaxonomySkills } from './TaxonomySkills';
import { portalFetch } from './portalFetch';

/**
 * The official skill taxonomy grouped by pillar, with one featured skill per
 * pillar (SKI-133). The endpoint is public (SPA origin), so we fetch on mount
 * and only retry with the Knox token if the anonymous call was refused.
 */
export function useTaxonomySkills(useSyntheticData: boolean = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<TaxonomySkillsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setData(generateMockTaxonomySkills());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const json = await portalFetch<TaxonomySkillsResponse>('/taxonomy/skills/', userToken);
      setData(json);
    } catch (err: any) {
      console.error('Failed to fetch taxonomy skills:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData]);

  useEffect(() => {
    // First pass runs anonymously; a later token only triggers a retry when
    // the anonymous request failed.
    if (data && !error) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken, useSyntheticData]);

  return { data, isLoading, error, refetch: fetchData };
}
