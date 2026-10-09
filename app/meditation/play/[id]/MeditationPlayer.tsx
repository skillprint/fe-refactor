'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Meditation, meditationApi, MeditationApiError, visualSettings } from '../../../../lib/models/meditation/meditationApi';
import MeditationVisual, { breathLevel, segmentAt } from '../../components/MeditationVisual';
import { formatDuration } from '../../MeditationStudio';
import '../../meditation.css';

const IDLE_MS = 3500;
/** Pauses at least this long get an on-screen breathing cue. */
const CUE_MIN_PAUSE = 4;

export default function MeditationPlayer({ id }: { id: string }) {
  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [idle, setIdle] = useState(false);
  const [captions, setCaptions] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    meditationApi.get(id)
      .then((m) => {
        setMeditation(m);
        setCaptions(visualSettings(m).showCaptions);
        setDuration(m.durationSeconds ?? 0);
      })
      .catch((err) => setError(err instanceof MeditationApiError && err.status === 404
        ? 'This meditation could not be found.' : 'This meditation could not be loaded.'));
  }, [id]);

  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const begin = async () => {
    setStarted(true);
    wake();
    try {
      await audioRef.current?.play();
    } catch {
      setPlaying(false);
    }
  };

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + delta));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else rootRef.current?.requestFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.key !== ' ') return;
      wake();
      if (e.key === ' ') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowLeft') seekBy(-15);
      else if (e.key === 'ArrowRight') seekBy(15);
      else if (e.key === 'f') toggleFullscreen();
      else if (e.key === 'c') setCaptions((c) => !c);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, toggle, seekBy, toggleFullscreen, wake]);

  const settings = visualSettings(meditation);
  const segments = meditation?.config?.segments;
  const current = segmentAt(segments, time);
  const pauseCue = started && current?.kind === 'pause' && current.end - current.start >= CUE_MIN_PAUSE;
  const inhaling = breathLevel(time + 0.25, Math.max(4, settings.breathSeconds)) < breathLevel(time + 0.5, Math.max(4, settings.breathSeconds));
  const caption = captions && current?.kind === 'speech' ? current.text : null;

  return (
    <div
      ref={rootRef}
      className={`meditation-player${started && idle && playing ? ' is-idle' : ''}`}
      onMouseMove={started ? wake : undefined}
      onTouchStart={started ? wake : undefined}
    >
      <MeditationVisual
        settings={settings}
        segments={segments}
        getTime={() => audioRef.current?.currentTime ?? 0}
        playing={playing}
      />

      {meditation && (
        <audio
          ref={audioRef}
          src={meditation.audioUrl}
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setIdle(false);
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
          onError={() => setError('The audio for this meditation could not be played.')}
        />
      )}

      {error && (
        <div className="med-player-message" role="alert">
          <p>{error}</p>
          <Link href="/meditation">Back to the studio</Link>
        </div>
      )}

      {!error && !meditation && <div className="med-player-message" aria-live="polite">Loading…</div>}

      {meditation && !started && !error && (
        <div className="med-player-intro">
          <h1>{meditation.title}</h1>
          {meditation.description && <p>{meditation.description}</p>}
          <p>{meditation.voiceName} · {formatDuration(duration)}</p>
          <button type="button" className="med-begin" onClick={begin} autoFocus>Begin</button>
          <p style={{ fontSize: 13 }}>Headphones recommended · space to pause · f for full screen</p>
        </div>
      )}

      {started && (
        <>
          <div className="med-cue" style={{ opacity: pauseCue ? 1 : 0 }} aria-hidden={!pauseCue}>
            {inhaling ? 'breathe in' : 'breathe out'}
          </div>
          {caption && <div className="med-caption" aria-live="polite">{caption}</div>}

          <div className="med-topbar">
            <Link href="/meditation">← Studio</Link>
            <span>{meditation?.title}</span>
          </div>

          <div className="med-controls">
            <input
              className="med-seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(time, duration || 0)}
              aria-label="Position"
              onChange={(e) => {
                if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
              }}
            />
            <div className="med-controls-row">
              <span className="med-time">{formatDuration(time)} / {formatDuration(duration)}</span>
              <button type="button" className="med-icon-btn" onClick={() => seekBy(-15)} aria-label="Back 15 seconds">−15</button>
              <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? 'Pause' : 'Play'}
              </button>
              <button type="button" className="med-icon-btn" onClick={() => seekBy(15)} aria-label="Forward 15 seconds">+15</button>
              <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={() => setCaptions((c) => !c)} aria-pressed={captions}>
                CC
              </button>
              <button type="button" className="med-icon-btn med-icon-btn--wide" onClick={toggleFullscreen} aria-label="Full screen">
                ⛶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
