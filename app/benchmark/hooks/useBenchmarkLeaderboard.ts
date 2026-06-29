'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../hooks/useUserSession';
import { get } from '../../api/api';
import { BenchmarkLeaderboardEntry } from '../models/types';

export function useBenchmarkLeaderboard(
  game?: string,
  mood?: string,
  useSyntheticData = false
) {
  const { userToken } = useUserSession();
  const [data, setData] = useState<BenchmarkLeaderboardEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (useSyntheticData) {
      setIsLoading(true);
      // Simulate network delay and return realistic mock data matching BenchmarkLeaderboardEntry
      setTimeout(() => {
        const mockData: BenchmarkLeaderboardEntry[] = [
          {
            providerKey: 'openai',
            providerDisplayName: 'OpenAI (o1-pro)',
            totalSessions: 42,
            avgMoodRating: 4.8,
            bayesianAvgMoodRating: 4.65,
          },
          {
            providerKey: 'anthropic',
            providerDisplayName: 'Anthropic (Claude 3.7 Sonnet)',
            totalSessions: 38,
            avgMoodRating: 4.6,
            bayesianAvgMoodRating: 4.48,
          },
          {
            providerKey: 'google',
            providerDisplayName: 'Google (Gemini 1.5 Pro)',
            totalSessions: 24,
            avgMoodRating: 4.3,
            bayesianAvgMoodRating: 4.15,
          },
          {
            providerKey: 'meta',
            providerDisplayName: 'Meta (Llama 3.1 70B)',
            totalSessions: 19,
            avgMoodRating: 3.9,
            bayesianAvgMoodRating: 3.95,
          },
          {
            providerKey: 'deepseek',
            providerDisplayName: 'DeepSeek (R1)',
            totalSessions: 31,
            avgMoodRating: 4.5,
            bayesianAvgMoodRating: 4.38,
          },
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

      const params = new URLSearchParams();
      if (game && game !== 'all') {
        params.append('game', game);
      }
      if (mood && mood !== 'all') {
        params.append('mood', mood);
      }
      const queryString = params.toString();
      const path = `games/api/benchmark/leaderboard/${queryString ? `?${queryString}` : ''}`;

      const response = await get(path, false, headers);
      
      const results = Array.isArray(response)
        ? response
        : (response.results || response.data || []);
        
      setData(results);
      return results;
    } catch (err: any) {
      console.error('Failed to fetch benchmark leaderboard:', err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userToken, game, mood, useSyntheticData]);

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
