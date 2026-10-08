'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConsoleIcon } from '@/components/LiveConsole/ConsoleIcon';
import { CardHead, CardLede, CardNote } from '@/components/LiveConsole/ConsoleCard';
import { TrendChart, TrendLegend, TrendSeries } from '@/components/LiveConsole/TrendChart';
import type { BiometricEngine, Primary, RoiName, Snapshot } from './engine/BiometricEngine';
import { plot, type Line } from './engine/plot';
import { FS } from './engine/analysis';
import { BiometricsView } from './BiometricsView';
import { biometricsState } from './BiometricsDock';
import { METHOD_COLOURS, METHOD_LABELS, METHOD_NOTES, METHOD_ORDER, ROI_LABELS, fmt } from './labels';

const HISTORY_SERIES: TrendSeries[] = [
  ...METHOD_ORDER.map(m => ({ key: m, label: METHOD_LABELS[m], colour: METHOD_COLOURS[m] })),
  { key: 'strap', label: 'Strap', colour: METHOD_COLOURS.strap },
];

const ROI_ORDER: RoiName[] = ['forehead', 'leftCheek', 'rightCheek'];

/** Canvas can't read `var(--x)`; resolve it against the element's own styles. */
function resolveColour(el: Element, value: string) {
  const m = /^var\((--[\w-]+)\)$/.exec(value);
  return m ? getComputedStyle(el).getPropertyValue(m[1]).trim() || '#888' : value;
}

interface PanelProps {
  snapshot: Snapshot | null;
  engine: BiometricEngine | null;
  loadError: string | null;
  sessionOpen: boolean;
  readingsSent: number;
  lastSent: Record<string, unknown> | null;
  onBaseline: (baseline: { hr: number; rmssd: number | null }) => void;
}

/** Everything the rPPG lab shows, on the AI Guide's cards. */
export function BiometricsPanel({ snapshot, engine, loadError, sessionOpen, readingsSent, lastSent, onBaseline }: PanelProps) {
  const [recordVideo, setRecordVideo] = useState(false);
  const pulseRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const state = biometricsState(snapshot, loadError);
  const a = snapshot?.analysis ?? null;
  const settings = snapshot?.settings;
  const running = !!snapshot && snapshot.source !== 'idle';
  const ready = !!engine && !!snapshot && !/loading|error/.test(snapshot.status.face);

  // The pulse waveform, redrawn every tick.
  useEffect(() => {
    const canvas = pulseRef.current;
    if (!canvas) return;
    const lines: Line[] = [];
    for (const m of METHOD_ORDER) {
      const y = a?.methods[m].bvp;
      if (!y?.length) continue;
      lines.push({ x: Float64Array.from(y, (_, i) => i / FS), y, color: resolveColour(canvas, METHOD_COLOURS[m]) });
    }
    plot(canvas, lines, { normalise: true });
  }, [a]);

  const historyData = useMemo(() => {
    const h = snapshot?.history ?? [];
    const end = h.length ? h[h.length - 1].t : 0;
    return h.map(p => {
      const row: Record<string, number | string> = { time: `${Math.round(p.t - end)} s` };
      for (const m of METHOD_ORDER) if (p.methods[m] !== undefined) row[m] = Math.round(p.methods[m]! * 10) / 10;
      if (p.truth !== null) row.strap = Math.round(p.truth * 10) / 10;
      return row;
    });
  }, [snapshot?.history]);

  const setBaseline = () => {
    const b = engine?.setBaseline();
    if (b) onBaseline({ hr: b.hr, rmssd: b.rmssd });
  };

  const toggleRoi = (roi: RoiName) => {
    if (!engine || !settings) return;
    const next = settings.rois.includes(roi) ? settings.rois.filter(r => r !== roi) : [...settings.rois, roi];
    engine.updateSettings({ rois: next.length ? next : settings.rois });
  };

  const resp = a?.respiration;
  const strap = snapshot?.strap;

  return (
    <section className="sp-card bio-panel" id="biometricsPanel" aria-labelledby="bioPanelTitle">
      <CardHead id="bioPanelTitle" icon="camera" title="Biometrics">
        <div className="aa-card__tools">
          <span className="ui-badge ui-badge--pill ui-badge--leading" data-badge-tone={state.tone} role="status">
            <span className="ui-badge__dot" aria-hidden="true" />
            <span>{state.label}</span>
          </span>
          <span className="ui-badge ui-badge--pill" data-badge-tone="neutral" title="Face tracking">Face · {snapshot?.status.face ?? '…'}</span>
          <span className="ui-badge ui-badge--pill" data-badge-tone="neutral" title="ME-rPPG in its worker">ME-rPPG · {snapshot?.status.me ?? '…'}</span>
        </div>
      </CardHead>
      <CardLede>
        Heart rate, HRV, breathing, blinks and expression read from the camera, the way the rPPG lab does it: four methods side by side,
        checked against a Bluetooth chest strap when one is paired. The video stays in this browser. Once play starts, one reading a second
        goes out with the session as a <code className="inline-code">BIOMETRIC</code> event.
      </CardLede>

      <div className="bio-panel__controls">
        <div className="bio-panel__group" role="group" aria-label="Source">
          <button className="button button--secondary button--sm" type="button" disabled={!ready} onClick={() => engine?.startCamera()}>
            <ConsoleIcon name="camera" />{snapshot?.source === 'camera' ? 'Restart camera' : 'Camera'}
          </button>
          <button className="button button--secondary button--sm" type="button" disabled={!ready} onClick={() => fileRef.current?.click()}>
            <ConsoleIcon name="upload" />Video file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            hidden
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) engine?.startFile(f);
              e.target.value = '';
            }}
          />
          <button className="button button--secondary button--sm" type="button" disabled={!running} onClick={() => engine?.stop()}>
            <ConsoleIcon name="pause" />Stop
          </button>
        </div>
        <div className="bio-panel__group" role="group" aria-label="Ground truth">
          <button
            className="button button--secondary button--sm"
            type="button"
            disabled={!strap?.available || strap.state === 'pairing'}
            onClick={() => engine?.toggleStrap()}
          >
            <ConsoleIcon name="trending" />{strap?.state === 'on' ? 'Disconnect strap' : 'Connect HR strap'}
          </button>
          <span className="bio-panel__muted">
            {strap?.state === 'on'
              ? `${strap.name}: ${fmt(strap.bpm)} bpm${strap.hasRr ? ' · RR ✓' : ' · no RR'}`
              : strap?.message}
          </span>
        </div>
        <div className="bio-panel__group" role="group" aria-label="Recording and baseline">
          <button
            className={snapshot?.recording ? 'button button--danger button--sm' : 'button button--secondary button--sm'}
            type="button"
            disabled={!running && !snapshot?.recording}
            onClick={() => engine?.toggleRecording(recordVideo)}
          >
            <ConsoleIcon name={snapshot?.recording ? 'download' : 'database'} />{snapshot?.recording ? 'Stop & save' : 'Record'}
          </button>
          <label className="bio-check">
            <input type="checkbox" checked={recordVideo} onChange={e => setRecordVideo(e.target.checked)} disabled={!!snapshot?.recording} /> include raw video
          </label>
          <button
            className="button button--secondary button--sm"
            type="button"
            disabled={!running}
            onClick={setBaseline}
            title="The primary method's median heart rate over the last 60 s, and its current RMSSD"
          >
            <ConsoleIcon name="check" />Set baseline
          </button>
          <button className="button button--tertiary button--sm" type="button" onClick={() => engine?.resetErrors()}>
            <ConsoleIcon name="refresh" />Reset error stats
          </button>
        </div>
      </div>

      {settings && (
        <div className="bio-panel__settings" role="group" aria-label="Settings">
          <div className="field">
            <label htmlFor="bioHrWindow">HR window</label>
            <select id="bioHrWindow" value={settings.hrWindowSec} onChange={e => engine?.updateSettings({ hrWindowSec: Number(e.target.value) })}>
              {[8, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v} s</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bioHrvWindow">HRV window</label>
            <select id="bioHrvWindow" value={settings.hrvWindowSec} onChange={e => engine?.updateSettings({ hrvWindowSec: Number(e.target.value) })}>
              {[30, 60, 90, 120].map(v => <option key={v} value={v}>{v} s</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bioPrimary">Primary method</label>
            <select id="bioPrimary" value={settings.primary} onChange={e => engine?.updateSettings({ primary: e.target.value as Primary })}>
              {METHOD_ORDER.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
              <option value="best-snr">Best SNR</option>
            </select>
          </div>
          <fieldset className="bio-panel__rois">
            <legend>Skin regions</legend>
            {ROI_ORDER.map(r => (
              <label key={r} className="bio-check">
                <input type="checkbox" checked={settings.rois.includes(r)} onChange={() => toggleRoi(r)} /> {ROI_LABELS[r]}
              </label>
            ))}
          </fieldset>
          <div className="field bio-panel__lambda">
            <label htmlFor="bioLambda">ME-rPPG λ <span className="aa-mono">{settings.lambda.toFixed(2)}</span></label>
            <input
              id="bioLambda"
              type="range"
              min={-0.477}
              max={0.477}
              step={0.001}
              value={Math.log10(settings.lambda)}
              onChange={e => engine?.updateSettings({ lambda: 10 ** Number(e.target.value) })}
            />
          </div>
          <label className="bio-check" title="Auto exposure and white balance inject colour changes that swamp the pulse. Only some cameras let the browser lock them. Applies when the camera (re)starts.">
            <input type="checkbox" checked={settings.lockCamera} onChange={e => engine?.updateSettings({ lockCamera: e.target.checked })} /> Lock exposure &amp; white balance
          </label>
        </div>
      )}

      <div className="bio-panel__grid">
        <div className="bio-panel__camera">
          <BiometricsView engine={engine} className="bio-view--large" label="Your camera, with the skin regions and the pulse model's crop outlined" />
          <dl className="aa-kv bio-panel__quality">
            <div><dt>Frames / s</dt><dd>{fmt(a?.quality.fps, 1)}</dd></div>
            <div><dt>Face present</dt><dd>{a ? `${fmt(a.quality.facePresent * 100)}%` : '—'}</dd></div>
            <div><dt>Motion</dt><dd>{fmt((a?.quality.motion ?? NaN) * 1000, 1)} ‰ IOD</dd></div>
            <div><dt>Skin luma</dt><dd>{fmt(a?.quality.luma)}</dd></div>
            <div><dt>ME-rPPG latency</dt><dd>{fmt(a?.quality.meLatencyMs, 1)} ms</dd></div>
            <div><dt>ME-rPPG dropped</dt><dd>{snapshot?.meDropped ?? 0}</dd></div>
            <div><dt>ROI pixels</dt><dd>{snapshot?.roiPixels ?? '—'}</dd></div>
            <div><dt>Camera</dt><dd>{snapshot?.cameraLock || '—'}</dd></div>
            {snapshot?.source === 'file' && <div><dt>File</dt><dd>{snapshot.fileProgress}</dd></div>}
          </dl>
        </div>

        <div className="bio-panel__methods">
          <h3 className="bio-panel__subhead">Heart rate by method</h3>
          <div className="table-scroll">
            <table className="sp-table aa-table bio-table">
              <thead>
                <tr><th scope="col">Method</th><th scope="col">HR</th><th scope="col">SNR dB</th><th scope="col">RMSSD ms</th><th scope="col">Δ now</th><th scope="col">MAE</th><th scope="col">≤5 bpm</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><i className="bio-swatch" style={{ '--swatch': METHOD_COLOURS.strap } as React.CSSProperties} aria-hidden="true" />Strap</td>
                  <td className="bio-table__hr">{fmt(a?.truth?.bpm)}</td><td>—</td><td>{fmt(a?.truth?.hrv?.rmssdMs)}</td><td>—</td><td>—</td><td>—</td>
                </tr>
                {METHOD_ORDER.map(m => {
                  const r = a?.methods[m];
                  const e = snapshot?.errors[m];
                  const delta = r?.hr && a?.truth ? r.hr.perMin - a.truth.bpm : null;
                  return (
                    <tr key={m} className={snapshot?.primaryMethod === m ? 'is-primary' : undefined} title={METHOD_NOTES[m]}>
                      <td><i className="bio-swatch" style={{ '--swatch': METHOD_COLOURS[m] } as React.CSSProperties} aria-hidden="true" />{METHOD_LABELS[m]}</td>
                      <td className="bio-table__hr">{fmt(r?.hr?.perMin)}</td>
                      <td>{fmt(r?.hr?.snrDb, 1)}</td>
                      <td>{fmt(r?.hrv?.rmssdMs)}</td>
                      <td>{delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`}</td>
                      <td>{fmt(e?.mae, 1)}</td>
                      <td>{e?.within5 === null || e?.within5 === undefined ? '—' : `${e.within5.toFixed(0)}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="bio-panel__muted">
            The bold row feeds the readings. Δ and MAE are against the strap, counting only windows with a face in at least 80% of frames.
            Camera RMSSD is unproven: on a perfectly regular synthetic pulse these methods read 17 to 67 ms.
          </p>
          <dl className="bio-panel__extras">
            <div><dt>Breathing</dt><dd>{fmt(snapshot?.signals?.respiration_rpm, 1)}<small>/min · nose motion {fmt((resp?.amplitude ?? NaN) * 1000, 2)} ‰ IOD</small></dd></div>
            <div><dt>Blinks</dt><dd>{fmt(a?.blinksPerMin)}<small>/min</small></dd></div>
            <div><dt>Smile</dt><dd>{fmt(snapshot?.signals?.camera_affect.smile, 2)}</dd></div>
            <div><dt>Brow down</dt><dd>{fmt(snapshot?.signals?.camera_affect.brow_down, 2)}</dd></div>
            <div><dt>Baseline HR / RMSSD</dt><dd>{snapshot?.baseline ? `${snapshot.baseline.hr.toFixed(0)} / ${fmt(snapshot.baseline.rmssd)}` : '—'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bio-panel__charts">
        <div>
          <h3 className="bio-panel__subhead">Pulse waveform <span className="bio-panel__muted">last {settings?.hrWindowSec ?? 10} s, each scaled to its own range</span></h3>
          <canvas ref={pulseRef} className="bio-pulse" role="img" aria-label="Pulse waveform for each method" />
          <TrendLegend series={HISTORY_SERIES.slice(0, 4)} />
        </div>
        <div>
          <h3 className="bio-panel__subhead">Heart rate over the last 2 minutes</h3>
          <TrendLegend series={HISTORY_SERIES} />
          <TrendChart data={historyData} series={HISTORY_SERIES} domain={['dataMin - 3', 'dataMax + 3']} emptyText="Heart rate appears here after 10 s with a face in view." />
        </div>
      </div>

      <div className="bio-panel__payloads">
        <div>
          <h3 className="bio-panel__subhead">Sent to the API <span className="bio-panel__muted">{sessionOpen ? `${readingsSent} BIOMETRIC events this session` : 'from the moment play starts'}</span></h3>
          <pre className="bio-json">{lastSent ? JSON.stringify(lastSent, null, 2) : 'Nothing sent yet.'}</pre>
        </div>
        <div>
          <h3 className="bio-panel__subhead"><code className="inline-code">biometric_signals</code></h3>
          <pre className="bio-json">{snapshot?.signals ? JSON.stringify(snapshot.signals, null, 2) : '—'}</pre>
        </div>
        <div>
          <h3 className="bio-panel__subhead">Indicator v2 fragment <span className="bio-panel__muted">needs a baseline</span></h3>
          <pre className="bio-json">
            {snapshot?.indicators
              ? JSON.stringify(snapshot.indicators, null, 2)
              : snapshot?.baseline
                ? 'No usable heart rate in this window (see quality.usable).'
                : 'Set a baseline after a minute of calm, still sitting.'}
          </pre>
        </div>
      </div>

      <CardNote>
        A reading only carries a heart rate when the primary method&apos;s SNR is at least 3 dB and another method agrees within 6 bpm:
        every method invents a plausible number from a face with no pulse. Wellness and engagement only, never diagnostic.
      </CardNote>
    </section>
  );
}
