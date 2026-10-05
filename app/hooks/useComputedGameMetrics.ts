'use client';

import { useEffect, useRef } from 'react';
import { useSessionDetail } from '../../lib/models/portal/useSessionDetail';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 6;

/**
 * Session results for the post-game dialog (SKI-132).
 *
 * The backend returns `cognition: []` while scoring is still in flight and
 * only substitutes estimated scores once scoring has finished, so we poll a
 * few times while the array is empty rather than showing an empty chart.
 */
export function useComputedGameMetrics(sessionId?: string, useSyntheticData: boolean = false) {
  const { data, isLoading, error, refetch } = useSessionDetail(sessionId || '', useSyntheticData);
  const polls = useRef(0);

  useEffect(() => {
    polls.current = 0;
  }, [sessionId]);

  useEffect(() => {
    if (useSyntheticData || !sessionId || !data) return;
    const stillProcessing = data.cognition.length === 0 && data.endedAt === null;
    if (!stillProcessing || polls.current >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      polls.current += 1;
      refetch();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [data, sessionId, useSyntheticData, refetch]);

  if (!sessionId && !useSyntheticData) {
    return { data: null, isLoading: false, error: null, isProcessing: false, refetch: () => Promise.resolve(null) };
  }

  const isProcessing = !!data && data.cognition.length === 0 && data.endedAt === null && polls.current < MAX_POLLS;

  return { data, isLoading, error, isProcessing, refetch };
}
