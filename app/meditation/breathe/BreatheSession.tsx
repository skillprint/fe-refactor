'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiBaseUrl } from '../../utils/cookieUtils';
import { useBiometrics } from '../../labs/ai_guide/biometrics/useBiometrics';
import { qrSVG } from '../../labs/ai_guide/biometrics/watch/qr';
import { useAppleWatch } from '../../labs/ai_guide/biometrics/watch/useAppleWatch';
import {
  DEFAULT_VISUAL, Meditation, meditationApi, PaletteName, VisualSettings, VisualStyle, visualSettings,
} from '../../../lib/models/meditation/meditationApi';
import MeditationVisual, { BreathState, PALETTES, segmentAt } from '../components/MeditationVisual';
import { formatDuration } from '../MeditationStudio';
import { BreathPacer, changeSince, DEFAULT_TARGET_PER_MIN, pickHeartRate } from './biofeedback';
import '../meditation.css';

const IDLE_MS = 3500;
const PACES = [5, 6, 7];
const STYLES: VisualStyle[] = ['orb', 'waves', 'aurora'];

type Stage = 'setup' | 'session' | 'summary';

interface Summary {
  seconds: number;
  heart: { first: number | null; last: number | null };
  breath: { first: number | null; last: number | null };
}

const round1 = (v: number | null | undefined) => (v === null || v === undefined ? null : Math.round(v * 10) / 10);

/**
 * Breathe with biofeedback: the meditation visual breathes at your measured breathing rate,
 * then eases toward a calmer pace, while heart rate (Apple Watch or camera) and breathing
 * (camera) sit faded in the bottom corners. Camera video is analysed on this device only.
 * `?id=` plays a saved meditation alongside; `?pace=`, `?style=`, `?palette=` set the defaults;
 * `?bio_src=` swaps the camera for a same-origin test video.
 */
export default function BreatheSession() {
  const params = useSearchParams();
  const meditationId = params.get('id');
  const paceParam = Number(params.get('pace'));

  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('setup');
  const [sensorsOpen, setSensorsOpen] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [watchOn, setWatchOn] = useState(false);
  const [pace, setPace] = useState(PACES.includes(paceParam) ? paceParam : DEFAULT_TARGET_PER_MIN);
  const [visual, setVisual] = useState<VisualSettings>(() => ({
    ...DEFAULT_VISUAL,
    style: (STYLES.includes(params.get('style') as VisualStyle) ? params.get('style') : 'orb') as VisualStyle,
    palette: (params.get('palette') && params.get('palette')! in PALETTES ? params.get('palette') : 'dusk') as PaletteName,
  }));
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [idle, setIdle] = useState(false);
  const [inhaling, setInhaling] = useState(true);
  const [audioTime, setAudioTime] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const breathRef = useRef<BreathState | null>(null);
  const pacerRef = useRef(new BreathPacer(pace));
  const firstHeart = useRef<number | null>(null);
  const firstBreath = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ---- data sources ----
  useEffect(() => {
    if (!meditationId) return;
    meditationApi.get(meditationId)
      .then((m) => {
        setMeditation(m);
        setVisual((v) => ({ ...visualSettings(m), style: v.style }));
      })
      .catch(() => setLoadError('That meditation could not be loaded; you can still breathe without it.'));
  }, [meditationId]);

  // ?bio_src=/path.webm reads a same-origin video instead of the camera, as in the AI Guide.
  const bioSourceParam = params.get('bio_src');
  const bio = useBiometrics(cameraOn, undefined, bioSourceParam?.startsWith('/') ? bioSourceParam : null);
  const watch = useAppleWatch(watchOn, getApiBaseUrl());

  const signals = bio.snapshot?.signals ?? null;
  const cameraBpm = signals?.heart_rate_bpm ?? null;
  const breathingRate = signals?.respiration_rpm ?? null;
  const heart = pickHeartRate(watch.state, cameraBpm, now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // A new pace target restarts the pacer, which then re-anchors on the next breathing reading.
  useEffect(() => {
    pacerRef.current = new BreathPacer(pace);
  }, [pace]);
  useEffect(() => {
    pacerRef.current.observe(breathingRate);
  }, [breathingRate]);
  const onBreath = useCallback(() => pacerRef.current.nextBreath(), []);

  // The in/out cue reads the visual's breath a few times a second.
  useEffect(() => {
    const timer = setInterval(() => {
      if (breathRef.current) setInhaling(breathRef.current.inhaling);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stage !== 'session') return;
    if (heart && firstHeart.current === null) firstHeart.current = heart.bpm;
    if (breathingRate !== null && firstBreath.current === null) firstBreath.current = breathingRate;
  }, [stage, heart, breathingRate]);

  // ---- session controls ----
  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const begin = () => {
    firstHeart.current = heart?.bpm ?? null;
    firstBreath.current = breathingRate;
    setStartedAt(Date.now());
    setStage('session');
    setSensorsOpen(false);
    wake();
    audioRef.current?.play().catch(() => undefined);
  };

  const finish = useCallback(() => {
    audioRef.current?.pause();
    setSummary({
      seconds: startedAt ? (Date.now() - startedAt) / 1000 : 0,
      heart: { first: firstHeart.current, last: heart?.bpm ?? null },
      breath: { first: round1(firstBreath.current), last: round1(breathingRate) },
    });
    setStage('summary');
    setCameraOn(false);
    if (watchOn) void watch.end();
    setWatchOn(false);
  }, [startedAt, heart, breathingRate, watchOn, watch]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else document.documentElement.requestFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (stage !== 'session') return;
    const onKey = (e: KeyboardEvent) => {
      wake();
      if (e.key === 'f') toggleFullscreen();
      else if (e.key === ' ' && audioRef.current) {
        e.preventDefault();
        if (audioRef.current.paused) audioRef.current.play().catch(() => undefined);
        else audioRef.current.pause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, wake, toggleFullscreen]);

  // ---- derived display ----
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const segments = meditation?.config?.segments;
  const current = segmentAt(segments, audioTime);
  // With a guided meditation playing, the cue only shows in its silences; without one it always does.
  const showCue = stage === 'session' && (!meditation || current?.kind === 'pause' || !current);

  const cameraStatus = useMemo(() => {
    if (!cameraOn) return null;
    if (bio.loadError) return 'Camera unavailable';
    if (!bio.snapshot || bio.snapshot.source === 'idle') return 'Starting camera…';
    if (bio.snapshot.error) return 'Camera unavailable';
    const present = bio.snapshot.analysis?.quality.facePresent ?? 0;
    if (present < 0.5) return 'Centre your face in view';
    return null;
  }, [cameraOn, bio.loadError, bio.snapshot]);

  const watchState = watch.state;
  const watchStatus = !watchOn ? null
    : watch.setupError ? "Couldn't connect"
      : watchState?.status === 'live' ? 'Apple Watch connected'
        : watchState?.status === 'waiting' || !watchState ? 'Waiting for your watch'
          : watchState.status === 'idle' ? 'Watch paused' : 'Reconnecting…';

  const heartNote = heart
    ? `${heart.source === 'watch' ? 'Apple Watch' : 'camera'}${(() => {
      const d = stage === 'session' ? changeSince(firstHeart.current, heart.bpm) : null;
      return d ? ` · ${d > 0 ? '+' : '−'}${Math.abs(d)} since start` : '';
    })()}`
    : cameraStatus ?? (watchOn ? watchStatus : null) ?? (cameraOn ? 'Reading your pulse…' : 'Add a sensor');
  const breathNote = breathingRate !== null
    ? `camera · guiding to ${pace.toFixed(1)}`
    : cameraOn ? (cameraStatus ?? 'Reading your breath…') : `guide · ${pace.toFixed(1)} per min`;

  const qr = useMemo(
    () => (watch.pairing ? qrSVG(watch.pairing.linkUrl, { title: 'Scan with Skillprint on your iPhone', dark: '#1a1633' }) : null),
    [watch.pairing],
  );

  return (
    <div
      className={`meditation-player med-breathe${stage === 'session' && idle && !sensorsOpen ? ' is-idle' : ''}`}
      onMouseMove={stage === 'session' ? wake : undefined}
      onTouchStart={stage === 'session' ? wake : undefined}
    >
      <MeditationVisual
        settings={visual}
        segments={segments}
        getTime={meditation ? () => audioRef.current?.currentTime ?? 0 : undefined}
        playing={stage !== 'summary'}
        heartRate={stage === 'session' ? heart?.bpm ?? null : null}
        breathRef={breathRef}
        onBreath={onBreath}
      />

      {meditation && (
        <audio
          ref={audioRef}
          src={meditation.audioUrl}
          preload="auto"
          onTimeUpdate={(e) => setAudioTime(e.currentTarget.currentTime)}
          onEnded={finish}
        />
      )}

      {showCue && (
        <div className="med-cue med-cue--soft" aria-live="off">{inhaling ? 'breathe in' : 'breathe out'}</div>
      )}

      {stage !== 'summary' && (
        <>
          <div className="med-metric med-metric--left" aria-live="polite">
            <span className="med-metric-label">Heart</span>
            <span className="med-metric-value">
              {heart ? Math.round(heart.bpm) : '—'}
              <small>bpm</small>
            </span>
            <span className="med-metric-note">{heartNote}</span>
          </div>
          <div className="med-metric med-metric--right" aria-live="polite">
            <span className="med-metric-label">Breathing</span>
            <span className="med-metric-value">
              {breathingRate !== null ? breathingRate.toFixed(1) : pacerRef.current.perMin.toFixed(1)}
              <small>/ min</small>
            </span>
            <span className="med-metric-note">{breathNote}</span>
          </div>
        </>
      )}

      {stage === 'session' && (
        <div className="med-topbar">
          <Link href={meditation ? `/meditation/play/${meditation.id}` : '/meditation'}>← Back</Link>
          <span>{meditation?.title ?? 'Breathe'} · {formatDuration(elapsed)}</span>
          <span className="med-actions">
            <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={() => setSensorsOpen((o) => !o)}>
              Sensors
            </button>
            <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={toggleFullscreen} aria-label="Full screen">⛶</button>
            <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={finish}>End</button>
          </span>
        </div>
      )}

      {(stage === 'setup' || sensorsOpen) && stage !== 'summary' && (
        <div className={stage === 'setup' ? 'med-player-intro' : 'med-sensor-overlay'}>
          <section className="med-sensors" aria-labelledby="med-breathe-heading">
            <h1 id="med-breathe-heading">{stage === 'setup' ? meditation?.title ?? 'Breathe' : 'Sensors'}</h1>
            {stage === 'setup' && (
              <p>
                The light breathes with you, then slowly guides you toward {pace} breaths a minute.
                {meditation ? ` ${meditation.voiceName} guides the meditation.` : ''}
              </p>
            )}
            {loadError && <p className="med-alert">{loadError}</p>}

            <label className="med-sensor">
              <input type="checkbox" checked={cameraOn} onChange={(e) => setCameraOn(e.target.checked)} />
              <span>
                <strong>Camera</strong>
                <small>Heart rate and breathing from your face. Video never leaves this device.</small>
                {cameraOn && <em>{cameraStatus ?? (cameraBpm ? `Reading · ${Math.round(cameraBpm)} bpm` : 'Reading… hold still for about 20 seconds')}</em>}
              </span>
            </label>

            <label className="med-sensor">
              <input
                type="checkbox"
                checked={watchOn}
                onChange={(e) => {
                  if (!e.target.checked) void watch.end();
                  setWatchOn(e.target.checked);
                }}
              />
              <span>
                <strong>Apple Watch</strong>
                <small>Heart rate from the Skillprint app on your iPhone and Watch.</small>
                {watchOn && <em>{watchStatus}{watchState?.bpm && watchState.status === 'live' ? ` · ${watchState.bpm} bpm` : ''}</em>}
              </span>
            </label>
            {watchOn && watchState?.status !== 'live' && (
              <div className="med-watch-pair">
                {qr ? <div className="med-watch-qr" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="med-watch-qr" />}
                <p>
                  Scan with the Skillprint app on your iPhone
                  {watch.pairing ? <>, or enter <code>{watch.pairing.displayCode}</code></> : ''}.
                </p>
                {watch.setupError && <p className="med-alert">{watch.setupError}</p>}
              </div>
            )}

            {stage === 'setup' && (
              <>
                <div className="med-breathe-options">
                  <div className="med-segmented" role="group" aria-label="Breathing pace">
                    {PACES.map((p) => (
                      <button key={p} type="button" aria-pressed={pace === p} onClick={() => setPace(p)}>{p} / min</button>
                    ))}
                  </div>
                  <div className="med-segmented" role="group" aria-label="Visual style">
                    {STYLES.map((s) => (
                      <button key={s} type="button" aria-pressed={visual.style === s}
                        onClick={() => setVisual((v) => ({ ...v, style: s }))}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" className="med-begin" onClick={begin}>Begin</button>
                <p className="med-breathe-fine">Works without sensors too · f for full screen</p>
              </>
            )}
            {stage === 'session' && (
              <button type="button" className="med-btn" onClick={() => setSensorsOpen(false)}>Done</button>
            )}
          </section>
        </div>
      )}

      {stage === 'summary' && summary && (
        <div className="med-player-intro">
          <section className="med-sensors">
            <h1>Well done</h1>
            <p>{formatDuration(summary.seconds)} of slow breathing.</p>
            <div className="med-summary">
              <div>
                <span className="med-metric-label">Heart</span>
                <strong>
                  {summary.heart.first !== null ? Math.round(summary.heart.first) : '—'} → {summary.heart.last !== null ? Math.round(summary.heart.last) : '—'}
                </strong>
                <small>bpm, start → end</small>
              </div>
              <div>
                <span className="med-metric-label">Breathing</span>
                <strong>{summary.breath.first ?? '—'} → {summary.breath.last ?? '—'}</strong>
                <small>per minute</small>
              </div>
            </div>
            <div className="med-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="med-btn med-btn--primary" onClick={() => window.location.reload()}>Breathe again</button>
              <Link className="med-btn" href={meditation ? `/meditation/play/${meditation.id}` : '/meditation'}>Back</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
