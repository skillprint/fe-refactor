'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveApi, type Pairing } from './liveApi';
import { WatchRtcLink } from './rtc';
import { applyRtcReading, emptyWatchState, WatchPoller, type WatchSample, type WatchState } from './watchFeed';

/** How readings are reaching the page right now. */
export type WatchTransport = 'direct' | 'server';

const POLL_MS = 2000;
// While WebRTC carries the readings, the server is asked for status only, now and then.
const STATUS_POLL_MS = 15000;
const RETRY_BASE_MS = 5000;
const RETRY_MAX_MS = 60000;
// Measurement times already passed to onSample, so a reading that arrives over
// both paths is recorded once. Bounded: an hour of one-a-second readings.
const RECORDED_CAP = 3600;

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
 *
 * Once a watch is paired, readings come straight from the iPhone app over a
 * WebRTC data channel (the backend only brokers the handshake). Whenever that
 * link is down, the page polls the backend, which the watch keeps uploading to,
 * and keeps retrying the direct link.
 */
export function useAppleWatch(enabled: boolean, apiBase: string, onSample?: WatchSampleListener) {
  const [state, setState] = useState<WatchState | null>(null);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [transport, setTransport] = useState<WatchTransport>('server');
  const [directIssue, setDirectIssue] = useState<string | null>(null);
  const sessionRef = useRef<StoredSession | null>(null);
  const sampleRef = useRef(onSample);
  useEffect(() => {
    sampleRef.current = onSample;
  }, [onSample]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let poller: WatchPoller | null = null;
    let link: WatchRtcLink | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
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
        const recorded = new Set<number>();
        let direct = false;

        const emit = (sample: WatchSample, current: WatchState) => {
          if (recorded.has(sample.t)) return;
          recorded.add(sample.t);
          if (recorded.size > RECORDED_CAP) recorded.delete(recorded.values().next().value as number);
          sampleRef.current?.(sample, current);
        };
        // The server's status can trail the direct link (or miss the watch entirely when
        // the watch can't reach it); while readings flow directly, the watch is live.
        const shown = (current: WatchState): WatchState =>
          direct && current.status !== 'ended' ? { ...current, status: 'live', error: null } : current;

        poller = new WatchPoller({
          fetchFeed: (cursor) => api.feed(liveSessionId, viewerToken, cursor, { samples: !direct }),
          intervalMs: () => (direct ? STATUS_POLL_MS : POLL_MS),
          onUpdate: (next, added) => {
            if (cancelled) return;
            setState(shown(next));
            for (const sample of added) emit(sample, next);
            if (next.paired && !link && retryTimer === null) startLink();
            // The live session ended (12 h), or the backend forgot it: start a new one.
            if ((next.status === 'error' || next.status === 'ended') && !poller?.running) {
              writeStored(null);
              setRestartKey((k) => k + 1);
            }
          },
        });

        let attempts = 0;
        const startLink = () => {
          if (cancelled || link || typeof RTCPeerConnection === 'undefined') return;
          const current = new WatchRtcLink({
            api,
            liveSessionId,
            viewerToken,
            onStatus: (status, detail) => {
              if (cancelled || link !== current) return;
              if (status === 'connected') {
                attempts = 0;
                direct = true;
                setTransport('direct');
                setDirectIssue(null);
              } else if (status === 'failed') {
                direct = false;
                link = null;
                setTransport('server');
                setDirectIssue(detail ?? null);
                poller?.pollNow();
                const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempts++);
                retryTimer = setTimeout(() => {
                  retryTimer = null;
                  startLink();
                }, delay);
              }
            },
            onReading: (reading) => {
              if (cancelled || !poller) return;
              const next = applyRtcReading(poller.state, reading);
              if (!next) return;
              poller.setState(next);
              setState(shown(next));
              const sample = next.samples.find((s) => s.t === reading.t);
              if (sample) emit(sample, next);
            },
          });
          link = current;
          void current.connect();
        };
        poller.start();
      } catch (e) {
        if (!cancelled) setSetupError(String((e as Error).message ?? e));
      }
    })();

    return () => {
      cancelled = true;
      poller?.stop();
      link?.close();
      if (retryTimer !== null) clearTimeout(retryTimer);
      setTransport('server');
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

  return { state, pairing, setupError, newCode, end, transport, directIssue };
}
