'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveApi, type Pairing } from './liveApi';
import { emptyWatchState, WatchPoller, type WatchSample, type WatchState } from './watchFeed';

const STORAGE_KEY = 'aa-watch-session';

interface StoredSession {
  apiBase: string;
  liveSessionId: string;
  viewerToken: string;
  pairing: Pairing;
}

// Session storage: the pairing survives a reload of this tab (the watch keeps
// streaming), but not a new tab or a closed browser. Blocked storage just means
// a fresh pairing each time.
function readStored(apiBase: string): StoredSession | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as StoredSession | null;
    return stored?.apiBase === apiBase && stored.liveSessionId && stored.viewerToken ? stored : null;
  } catch {
    return null;
  }
}

function writeStored(session: StoredSession | null) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked; nothing to keep.
  }
}

export type WatchSampleListener = (sample: WatchSample, state: WatchState) => void;

/**
 * Pairs an Apple Watch with this page while `enabled` is true, through a live
 * session on the marketplace API (`apiBase`), and calls `onSample` once for
 * every new heart-rate reading. Turning it off with `end()` closes the live
 * session; unmounting only stops polling, so a reload picks the pairing back up.
 */
export function useAppleWatch(enabled: boolean, apiBase: string, onSample?: WatchSampleListener) {
  const [state, setState] = useState<WatchState | null>(null);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const sessionRef = useRef<StoredSession | null>(null);
  const sampleRef = useRef(onSample);
  useEffect(() => {
    sampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let poller: WatchPoller | null = null;
    const api = new LiveApi(apiBase);
    setSetupError(null);
    setState(emptyWatchState());

    (async () => {
      try {
        let session = readStored(api.apiBase);
        if (!session) {
          const created = await api.createSession('AI Guide');
          session = { apiBase: api.apiBase, liveSessionId: created.liveSessionId, viewerToken: created.viewerToken, pairing: created.pairing };
          writeStored(session);
        }
        if (cancelled) return;
        sessionRef.current = session;
        setPairing(session.pairing);
        const { liveSessionId, viewerToken } = session;
        poller = new WatchPoller({
          fetchFeed: (cursor) => api.feed(liveSessionId, viewerToken, cursor),
          onUpdate: (next, added) => {
            if (cancelled) return;
            setState(next);
            for (const sample of added) sampleRef.current?.(sample, next);
            // The live session ended (12 h), or the backend forgot it: start a new one.
            if ((next.status === 'error' || next.status === 'ended') && !poller?.running) {
              writeStored(null);
              setRestartKey((k) => k + 1);
            }
          },
        });
        poller.start();
      } catch (e) {
        if (!cancelled) setSetupError(String((e as Error).message ?? e));
      }
    })();

    return () => {
      cancelled = true;
      poller?.stop();
    };
  }, [enabled, apiBase, restartKey]);

  /** A fresh pairing code; they last ten minutes. */
  const newCode = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      const next = await new LiveApi(session.apiBase).newPairing(session.liveSessionId, session.viewerToken);
      session.pairing = next;
      writeStored(session);
      setPairing(next);
    } catch (e) {
      setSetupError(`Couldn't get a new code: ${(e as Error).message}`);
    }
  }, []);

  /** Closes the live session, so the watch stops streaming here. */
  const end = useCallback(async () => {
    const session = sessionRef.current;
    sessionRef.current = null;
    writeStored(null);
    setPairing(null);
    setState(null);
    if (session) {
      await new LiveApi(session.apiBase).endSession(session.liveSessionId, session.viewerToken).catch(() => {});
    }
  }, []);

  return { state, pairing, setupError, newCode, end };
}
