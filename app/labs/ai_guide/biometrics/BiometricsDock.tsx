'use client';

import React from 'react';
import { ConsoleIcon } from '@/components/LiveConsole/ConsoleIcon';
import type { BiometricEngine, Snapshot } from './engine/BiometricEngine';
import { BiometricsView } from './BiometricsView';
import { METHOD_LABELS, fmt } from './labels';

export interface BiometricsState {
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  label: string;
}

/** One status for the whole feature, shared by the dock and the full panel. */
export function biometricsState(snapshot: Snapshot | null, loadError: string | null): BiometricsState {
  if (loadError) return { tone: 'danger', label: "Couldn't start" };
  if (!snapshot || /loading/.test(snapshot.status.face) || /loading/.test(snapshot.status.me)) return { tone: 'neutral', label: 'Loading models' };
  if (snapshot.error) return { tone: 'danger', label: 'Needs attention' };
  if (snapshot.source === 'idle') return { tone: 'neutral', label: 'Camera off' };
  const a = snapshot.analysis;
  if (!a) return { tone: 'neutral', label: 'Warming up' };
  if (a.quality.facePresent < 0.8) return { tone: 'warning', label: 'Face not in view' };
  if (snapshot.signals?.quality.usable) return { tone: 'success', label: 'Reading' };
  return { tone: 'warning', label: 'Low signal' };
}

interface DockProps {
  snapshot: Snapshot | null;
  engine: BiometricEngine | null;
  loadError: string | null;
  sessionOpen: boolean;
  readingsSent: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onTurnOff: () => void;
}

/** The small always-visible preview: the annotated camera and the headline readings. */
export function BiometricsDock({ snapshot, engine, loadError, sessionOpen, readingsSent, expanded, onToggleExpanded, onTurnOff }: DockProps) {
  const state = biometricsState(snapshot, loadError);
  const s = snapshot?.signals;
  const method = snapshot?.primaryMethod;
  const message = loadError || snapshot?.error;

  return (
    // With the full panel open the dock shrinks to one line, since the panel has the large view.
    <aside className="bio-dock" data-compact={expanded || undefined} aria-labelledby="bioDockTitle">
      <div className="bio-dock__head">
        <h2 className="bio-dock__title" id="bioDockTitle"><ConsoleIcon name="camera" />Biometrics</h2>
        {expanded && <span className="bio-dock__inline">{fmt(s?.heart_rate_bpm)} bpm</span>}
        <span className="ui-badge ui-badge--pill ui-badge--leading" data-badge-tone={state.tone} role="status">
          <span className="ui-badge__dot" aria-hidden="true" />
          <span>{state.label}</span>
        </span>
        <button
          className="button button--tertiary button--icon-only button--xs"
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-controls="biometricsPanel"
          aria-label={expanded ? 'Hide the full biometrics panel' : 'Show the full biometrics panel'}
          title={expanded ? 'Hide details' : 'All readings and settings'}
        >
          <ConsoleIcon name={expanded ? 'chevron-down' : 'layout-grid'} className="sp-icon--sm" />
        </button>
        <button className="button button--tertiary button--icon-only button--xs" type="button" onClick={onTurnOff} aria-label="Turn biometrics off" title="Turn off and release the camera">
          <ConsoleIcon name="close" className="sp-icon--sm" />
        </button>
      </div>

      <div className="bio-dock__stage">
        <BiometricsView engine={engine} label="Your camera, with the skin regions being read outlined" />
        {(!snapshot || snapshot.source === 'idle') && (
          <p className="bio-dock__veil">{message || (state.label === 'Loading models' ? 'Loading face tracking and the pulse model…' : 'Camera off')}</p>
        )}
      </div>

      <dl className="bio-dock__readings">
        <div className="bio-dock__hr">
          <dt>Heart rate</dt>
          <dd>
            <strong>{fmt(s?.heart_rate_bpm)}</strong><small>bpm</small>
          </dd>
          <dd className="bio-dock__hint">{method ? `${METHOD_LABELS[method]} · SNR ${fmt(s?.quality.snr_db, 1)} dB` : 'Waiting for 10 s of pulse'}</dd>
        </div>
        <div><dt>Breathing</dt><dd>{fmt(s?.respiration_rpm)}<small>/min</small></dd></div>
        <div><dt>Blinks</dt><dd>{fmt(s?.blink_rate_per_min)}<small>/min</small></dd></div>
      </dl>

      <p className="bio-dock__note">
        {message
          ? message
          : sessionOpen
            ? `${readingsSent} ${readingsSent === 1 ? 'reading' : 'readings'} sent with the session as BIOMETRIC events.`
            : readingsSent > 0
              ? `${readingsSent} ${readingsSent === 1 ? 'reading was' : 'readings were'} sent with this session.`
              : 'Readings go out with the session once play starts. The video never leaves this browser.'}
      </p>
    </aside>
  );
}
