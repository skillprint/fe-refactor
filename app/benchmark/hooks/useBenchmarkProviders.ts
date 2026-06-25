'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../hooks/useUserSession';
import { get } from '../../api/api';
import { BenchmarkProvider } from '../models/types';

export function useBenchmarkProviders(useSyntheticData = false) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<BenchmarkProvider[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setIsLoading(true);
      // Simulate network delay and return realistic mock data matching BenchmarkProvider
      setTimeout(() => {
        const mockData: BenchmarkProvider[] = [
          { key: 'openai', displayName: 'OpenAI' },
          { key: 'anthropic', displayName: 'Anthropic' },
          { key: 'google', displayName: 'Google' },
          { key: 'meta', displayName: 'Meta' },
          { key: 'deepseek', displayName: 'DeepSeek' }
        ];
        setData(mockData);
        setIsLoading(false);
      }, 500);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: any = {};
      if (userToken) {
        headers['X-Auth-Token'] = `Token ${userToken}`;
      }
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
      if (apiKey) {
        headers['Authorization'] = `Api-Key ${apiKey}`;
      }

      const path = 'games/api/benchmark/providers/';
      const response = await get(path, false, headers);
      
      const results = Array.isArray(response)
        ? response
        : (response.results || response.data || []);
        
      setData(results);
      return results;
    } catch (err: any) {
      console.error('Failed to fetch benchmark providers:', err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, useSyntheticData]);

  useEffect(() => {
    if (useSyntheticData || userToken) {
      fetchData();
    }
  }, [useSyntheticData, userToken, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
