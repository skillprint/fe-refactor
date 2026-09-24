'use client';

/**
 * The coach session, held in one place (SKI-213).
 *
 * Separate from `AuthContext` rather than a new `AuthStatus` on it. That
 * context models a *player* — guest, social, partner — and its statuses drive
 * the player shell and the player `AuthGuard`. Adding 'coach' to it would make
 * every player surface reason about a case that can never apply to it, and vice
 * versa.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearCoachSession,
  coachLogin,
  coachLogout,
  readCoachSession,
  writeCoachSession,
  type CoachSession,
} from './coachAuth';

interface CoachAuthValue {
  session: CoachSession | null;
  /** True until the stored session has been read — see the note below. */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /**
   * Record a session obtained some other way — set-password signs the coach in
   * directly (the API sets the cookie), so there is no password to sign in with.
   */
  adoptSession: (session: CoachSession) => void;
  /** This device, or with `everywhere` every device the coach is signed in on. */
  signOut: (everywhere?: boolean) => Promise<void>;
}

const CoachAuthContext = createContext<CoachAuthValue | undefined>(undefined);

export function CoachAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CoachSession | null>(null);

  // Starts true and is only cleared after the effect runs. localStorage is not
  // readable during server rendering, so the first client render always has
  // `session === null` — without this flag the shell would bounce a signed-in
  // coach to the sign-in screen on every page load.
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    setSession(readCoachSession());
    setIsRestoring(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await coachLogin(email, password);
    writeCoachSession(next);
    setSession(next);
  }, []);

  const adoptSession = useCallback((next: CoachSession) => {
    writeCoachSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async (everywhere = false) => {
    clearCoachSession();
    setSession(null);
    await coachLogout(everywhere);
  }, []);

  const value = useMemo(
    () => ({ session, isRestoring, signIn, adoptSession, signOut }),
    [session, isRestoring, signIn, adoptSession, signOut],
  );

  return <CoachAuthContext.Provider value={value}>{children}</CoachAuthContext.Provider>;
}

export function useCoachAuth(): CoachAuthValue {
  const context = useContext(CoachAuthContext);
  if (!context) {
    throw new Error('useCoachAuth must be used inside CoachAuthProvider');
  }
  return context;
}
