'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import {
  LeaderboardPeriod,
  LibraryGameLeaderboard,
  generateMockLibraryGameLeaderboard,
  normalizeLeaderboardBoard,
} from './LibraryGameLeaderboard';
import { PortalApiError, portalFetch } from './portalFetch';

function readCachedViewerName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem('userFirstName') ||
      window.localStorage.getItem('skillprint_display_name') ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * The top players on one game by its own score, and where the viewer stands
 * (marketplace #148). Needs the Knox token; 404 for an unknown game, and for
 * a backend that does not serve the board yet. Switching `period` keeps the
 * previous board on screen until the next one arrives.
 */
export function useLibraryGameLeaderboard(
  slug: string,
  period: LeaderboardPeriod = 'all',
  useSyntheticData: boolean = false,
  limit: number = 10,
) {
  const { userId, userToken } = useUserSession();
  const [data, setData] = useState<LibraryGameLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    const viewer = {
      name: readCachedViewerName(),
      playerId: userId,
    };
    if (useSyntheticData) {
      setData(generateMockLibraryGameLeaderboard(period, viewer));
      setIsLoading(false);
      return null;
    }
    if (!userToken || !slug) return null;

    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const query = new URLSearchParams({ period, limit: String(limit) });
      const json = await portalFetch<LibraryGameLeaderboard>(
        `/library/games/${encodeURIComponent(slug)}/leaderboard/?${query}`,
        userToken,
      );
      const normalized = normalizeLeaderboardBoard(json, viewer);
      setData(normalized);
      return normalized;
    } catch (err: any) {
      setData(null);
      if (err instanceof PortalApiError && err.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch game leaderboard:', err);
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userToken, useSyntheticData, slug, period, limit]);

  useEffect(() => {
    if (useSyntheticData || (userToken && slug)) fetchData();
  }, [useSyntheticData, userToken, slug, fetchData]);

  return { data, isLoading, error, notFound, refetch: fetchData };
}
