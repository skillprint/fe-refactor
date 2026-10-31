'use client';

import { useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { isGameReviewer } from './gameReviewApi';

/**
 * True once the backend has accepted this player as a game reviewer
 * (Skillprint staff). False while checking, for everyone else, and on a
 * backend without game reviews. Reads the URL through useUserSession, so a
 * static page needs a Suspense boundary above it.
 */
export function useGameReviewer(): boolean {
  const { userToken } = useUserSession();
  const [reviewer, setReviewer] = useState(false);

  useEffect(() => {
    if (!userToken) {
      setReviewer(false);
      return;
    }
    let live = true;
    isGameReviewer(userToken).then((ok) => {
      if (live) setReviewer(ok);
    });
    return () => {
      live = false;
    };
  }, [userToken]);

  return reviewer;
}
