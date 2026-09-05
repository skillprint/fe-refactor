'use client';

import { useSessionDetail } from '../../lib/models/portal/useSessionDetail';

export function useComputedGameMetrics(sessionId?: string, useSyntheticData: boolean = false) {
    const { data, isLoading, error, refetch } = useSessionDetail(sessionId || 'skip-fetch', useSyntheticData);

    if (!sessionId && !useSyntheticData) {
        return {
            data: null,
            isLoading: false,
            error: null,
            refetch: () => Promise.resolve(null)
        };
    }

    return {
        data,
        isLoading,
        error,
        refetch
    };
}
