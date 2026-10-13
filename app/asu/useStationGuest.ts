'use client';

import { useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearPlayedGames } from '@/lib/asuStation';

/**
 * A station PC is always signed in: a signed-out browser becomes a guest as
 * soon as the page loads, so the host never sees the welcome screen.
 * `nextVisitor` forgets this visitor's guest identity and reloads, so the next
 * person's sessions and scores go to a new guest of their own.
 */
export function useStationGuest() {
  const { status, isLoading, loginAsGuest, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && status === 'loggedOut') loginAsGuest();
  }, [isLoading, status, loginAsGuest]);

  const nextVisitor = useCallback(() => {
    logout();
    clearPlayedGames();
    window.location.assign('/asu/');
  }, [logout]);

  return { ready: !isLoading && status !== 'loggedOut', nextVisitor };
}
