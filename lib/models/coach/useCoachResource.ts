'use client';

/**
 * The one data-fetching primitive behind every coach hook (SKI-214).
 *
 * The portal's hooks each re-implement fetch/loading/error inline, which is why
 * the missing `portal/` prefix bug had to be fixed in thirty files. This
 * surface gets one implementation and thin wrappers over it.
 *
 * Two behaviours are deliberate:
 *
 * - **A `CoachApiError` is returned, not thrown.** A 403 here means "this
 *   player's consent grant does not reach that level", which is a state the UI
 *   renders rather than an exception it recovers from.
 * - **Requests are not issued until there is a token**, unless mocks are on, in
 *   which case there is nothing to authenticate against and waiting would hang
 *   every screen behind a token that never arrives.
 *
 * The token is the **coach** session (SKI-213), never the player one. They are
 * different credentials for different people: a player token is refused by
 * every `/api/coach/` endpoint, correctly, and reading it here was the bug
 * SKI-253 was filed for.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CoachApiError, coachFetch, isCoachMocked, type CoachFetchOptions } from './coachFetch';
import { areaForPath } from './mockAreas';
import { useCoachAuth } from './CoachAuthContext';

export interface CoachResource<T> {
  data: T | null;
  isLoading: boolean;
  error: CoachApiError | Error | null;
  refetch: () => void;
}

export function useCoachResource<T>(
  path: string | null,
  options: CoachFetchOptions = {},
): CoachResource<T> {
  const { session } = useCoachAuth();
  // Signed in, as far as this tab knows. The cookie is the credential; a
  // stale profile simply earns a 401, which the shell turns into sign-in.
  const signedIn = session !== null;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CoachApiError | Error | null>(null);

  // Serialised so an inline `params` object literal does not retrigger the
  // effect on every render.
  const optionsKey = JSON.stringify(options.params ?? {});

  // Guards against a slow first response overwriting a newer one when the
  // path changes mid-flight (switching teams quickly does exactly this).
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (path === null) return;
    // A live request waits for a session; a mocked one has nothing to
    // authenticate against and would otherwise wait forever.
    if (!isCoachMocked(areaForPath(path)) && !signedIn) return;

    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await coachFetch<T>(path, {
        ...options,
        params: JSON.parse(optionsKey),
      });
      if (id === requestId.current) setData(result);
    } catch (caught) {
      if (id === requestId.current) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setData(null);
      }
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
    // `options` is intentionally not a dependency — `optionsKey` stands in for
    // its only meaningful part, and including it would loop on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, optionsKey, signedIn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
