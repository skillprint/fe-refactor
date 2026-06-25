'use client';

import { useCallback, useState } from 'react';
import { useUserSession } from '../../hooks/useUserSession';
import { post } from '../../api/api';
import { BenchmarkSurveyCreate, BenchmarkSurveyResponse } from '../models/types';

export function useSubmitBenchmarkSurvey() {
  const { userToken } = useUserSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitSurvey = useCallback(
    async (surveyData: BenchmarkSurveyCreate): Promise<BenchmarkSurveyResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (userToken) {
          headers['X-Auth-Token'] = `Token ${userToken}`;
        }
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
        if (apiKey) {
          headers['Authorization'] = `Api-Key ${apiKey}`;
        }

        const path = 'games/api/benchmark/surveys/';
        const response = await post(path, surveyData, headers);

        setIsLoading(false);
        return response;
      } catch (err: any) {
        console.error('Failed to submit benchmark survey:', err);
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [userToken]
  );

  return {
    submitSurvey,
    isLoading,
    error,
  };
}
