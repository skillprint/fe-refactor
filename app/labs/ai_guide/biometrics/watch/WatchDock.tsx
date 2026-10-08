'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ConsoleIcon } from '@/components/LiveConsole/ConsoleIcon';
import { fmt } from '../labels';
import type { Pairing } from './liveApi';
import { qrSVG } from './qr';
import type { WatchTransport } from './useAppleWatch';
import { WINDOW_MS, ZONES, type WatchState } from './watchFeed';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export function watchBadge(state: WatchState | null, setupError: string | null): { tone: Tone; label: string } {
  if (setupError) return { tone: 'danger', label: "Couldn't start" };
  switch (state?.status) {
    case 'live': return { tone: 'success', label: 'Live' };
    case 'waiting': return { tone: 'warning', label: 'Waiting to pair' };
    case 'idle': return { tone: 'warning', label: 'Watch paused' };
    case 'error': return { tone: 'danger', label: 'Reconnecting' };
    case 'ended': return { tone: 'neutral', label: 'Ended' };
    default: return { tone: 'neutral', label: 'Connecting' };
  }
}

/** The last five minutes as one SVG line, with resting heart rate dashed. */
function Sparkline({ state }: { state: WatchState }) {
  const width = 260;
  const height = 44;
  const geometry = useMemo(() => {
    const samples = state.samples;
    if (samples.length < 2) return null;
    const end = samples[samples.length - 1].t;
    const start = end - WINDOW_MS;
    const values = samples.map((s) => s.bpm).concat(state.baselineBpm !== null ? [state.baselineBpm] : []);
    const lo = Math.min(...values) - 3;
    const hi = Math.max(Math.max(...values) + 3, lo + 20);
    const x = (t: number) => ((t - start) / WINDOW_MS) * width;
    const y = (bpm: number) => height - ((bpm - lo) / (hi - lo)) * height;
    return {
      points: samples.map((s) => `${x(s.t).toFixed(1)},${y(s.bpm).toFixed(1)}`).join(' '),
      baseline: state.baselineBpm !== null ? y(state.baselineBpm) : null,
    };
  }, [state.samples, state.baselineBpm]);
  if (!geometry) return null;
  return (
    <svg className="watch-dock__spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Watch heart rate over the last five minutes">
      {geometry.baseline !== null && <line x1="0" x2={width} y1={geometry.baseline} y2={geometry.baseline} className="watch-dock__spark-base" />}
      <polyline points={geometry.points} className="watch-dock__spark-line" />
    </svg>
  );
}

interface Props {
  state: WatchState | null;
  pairing: Pairing | null;
  setupError: string | null;
  sessionOpen: boolean;
  readingsSent: number;
  /** The webcam's heart rate, when it's on and reading, to compare against. */
  cameraBpm: number | null;
  /** Readings straight from the iPhone over WebRTC, or polled from the server. */
  transport: WatchTransport;
  /** Why the direct link isn't up, when it tried and failed. */
  directIssue: string | null;
  onNewCode: () => void;
  onTurnOff: () => void;
}

/** Apple Watch heart rate: the pairing QR code until a watch claims it, then the readings. */
export function WatchDock({ state, pairing, setupError, sessionOpen, readingsSent, cameraBpm, transport, directIssue, onNewCode, onTurnOff }: Props) {
  const badge = watchBadge(state, setupError);
  const paired = Boolean(state?.paired);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresIn = pairing ? Math.max(0, Math.round((Date.parse(pairing.expiresAt) - now) / 1000)) : null;
  // An unclaimed code that runs out is replaced, so the QR code on screen always works.
  useEffect(() => {
    if (!paired && pairing && expiresIn === 0) onNewCode();
  }, [paired, pairing, expiresIn, onNewCode]);

  const qr = useMemo(() => (pairing ? qrSVG(pairing.linkUrl, { title: 'Scan with Skillprint on your iPhone' }) : null), [pairing]);
  const zone = ZONES.find((z) => z.id === state?.zone);
  const age = state?.sampledAt ? Math.max(0, Math.round((now - state.sampledAt) / 1000)) : null;
  const vsCamera = cameraBpm !== null && state?.bpm != null ? Math.round(cameraBpm - state.bpm) : null;
  const message = setupError || state?.error;
  const note = message
    ? message
    : !paired
      ? null
      : transport === 'server' && directIssue
        ? `No direct link to the iPhone: ${directIssue} Readings come via the server meanwhile.`
        : sessionOpen
        ? `${readingsSent} ${readingsSent === 1 ? 'reading' : 'readings'} sent with the session as BIOMETRIC events.`
        : readingsSent > 0
          ? `${readingsSent} ${readingsSent === 1 ? 'reading was' : 'readings were'} sent with this session.`
          : 'Readings go out with the session once play starts.';

  return (
    <aside className="bio-dock watch-dock" aria-labelledby="watchDockTitle">
      <div className="bio-dock__head">
        <h2 className="bio-dock__title" id="watchDockTitle"><ConsoleIcon name="watch" />Apple Watch</h2>
        <span className="ui-badge ui-badge--pill ui-badge--leading" data-badge-tone={badge.tone} role="status">
          <span className="ui-badge__dot" aria-hidden="true" />
          <span>{badge.label}</span>
        </span>
        <button className="button button--tertiary button--icon-only button--xs" type="button" onClick={onTurnOff} aria-label="Disconnect the Apple Watch" title="Stop following the watch">
          <ConsoleIcon name="close" className="sp-icon--sm" />
        </button>
      </div>

      {!paired ? (
        <div className="watch-dock__pair">
          {qr ? (
            // Generated here from the backend's pairing link; no outside markup.
            <div className="watch-dock__qr" dangerouslySetInnerHTML={{ __html: qr }} />
          ) : (
            <div className="watch-dock__qr watch-dock__qr--empty">{message ? '' : 'Getting a code…'}</div>
          )}
          <p className="watch-dock__code">
            {pairing ? <>or enter <code>{pairing.displayCode}</code></> : ' '}
          </p>
          <p className="bio-dock__note">
            Scan with Skillprint on your iPhone. Your watch starts a Fitness Gaming workout and streams heart rate here.
            {expiresIn !== null && ` Code expires in ${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')}.`}
          </p>
          <button className="button button--secondary button--xs" type="button" onClick={onNewCode} disabled={!pairing}>
            New code
          </button>
        </div>
      ) : (
        <>
          <dl className="bio-dock__readings">
            <div className="bio-dock__hr">
              <dt>Heart rate</dt>
              <dd>
                <strong>{fmt(state?.bpm)}</strong><small>bpm</small>
              </dd>
              <dd className="bio-dock__hint">
                {age === null ? 'Waiting for the first reading' : age < 60 ? `${age}s ago` : `${Math.floor(age / 60)}m ago`}
                {transport === 'direct' ? ' · direct from iPhone' : ' · via server'}
              </dd>
            </div>
            <div>
              <dt>Resting</dt>
              <dd>{fmt(state?.baselineBpm)}<small>bpm</small></dd>
            </div>
            <div>
              <dt>{zone ? zone.label : 'Zone'}</dt>
              <dd>{state?.deltaBpm == null ? '—' : `${state.deltaBpm > 0 ? '+' : ''}${fmt(state.deltaBpm)}`}</dd>
            </div>
          </dl>
          {state && <Sparkline state={state} />}
          {vsCamera !== null && (
            <p className="watch-dock__compare">
              Camera reads <strong>{vsCamera === 0 ? 'the same' : `${Math.abs(vsCamera)} bpm ${vsCamera > 0 ? 'higher' : 'lower'}`}</strong>
            </p>
          )}
        </>
      )}

      {note && <p className="bio-dock__note">{note}</p>}
    </aside>
  );
}
