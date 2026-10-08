// Apple Watch heart rate on the AI Guide: the feed's state, and the BIOMETRIC
// event each new reading becomes. Pure, so it runs (and is tested) outside React.

import type { Feed } from './liveApi';

/** History kept for the sparkline. */
export const WINDOW_MS = 5 * 60 * 1000;

/** Zones are measured against the player's resting heart rate (the workout's first minute). */
export const ZONES = [
  { id: 'calm', label: 'Calm', maxDelta: 5 },
  { id: 'engaged', label: 'Engaged', maxDelta: 15 },
  { id: 'elevated', label: 'Elevated', maxDelta: 30 },
  { id: 'intense', label: 'Intense', maxDelta: Infinity },
] as const;

export type ZoneId = (typeof ZONES)[number]['id'];

export function zoneFor(delta: number | null): ZoneId | null {
  if (delta === null || Number.isNaN(delta)) return null;
  return (ZONES.find((z) => delta < z.maxDelta) ?? ZONES[ZONES.length - 1]).id;
}

export type WatchStatus = 'connecting' | 'waiting' | 'live' | 'idle' | 'ended' | 'error';

export interface WatchSample {
  id: number;
  /** Epoch ms, as measured on the watch. */
  t: number;
  bpm: number;
}

export interface WatchState {
  status: WatchStatus;
  paired: boolean;
  deviceNames: string[];
  bpm: number | null;
  sampledAt: number | null;
  baselineBpm: number | null;
  deltaBpm: number | null;
  zone: ZoneId | null;
  samples: WatchSample[];
  cursor: number;
  error: string | null;
}

export const emptyWatchState = (): WatchState => ({
  status: 'connecting',
  paired: false,
  deviceNames: [],
  bpm: null,
  sampledAt: null,
  baselineBpm: null,
  deltaBpm: null,
  zone: null,
  samples: [],
  cursor: 0,
  error: null,
});

const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Folds one feed response into `state`. Returns the new state and the samples
 * this response added (newest last), which become session events.
 */
export function applyFeed(state: WatchState, feed: Feed): { state: WatchState; added: WatchSample[] } {
  const known = new Set(state.samples.map((s) => s.id));
  const added = (feed.samples ?? [])
    .filter((s) => !known.has(s.id) && s.id > state.cursor)
    .map((s) => ({ id: s.id, t: Date.parse(s.t), bpm: s.bpm }))
    .filter((s) => Number.isFinite(s.t))
    .sort((a, b) => a.t - b.t);
  const samples = state.samples.concat(added).sort((a, b) => a.t - b.t);
  const newest = samples.length ? samples[samples.length - 1].t : 0;

  const bpm = feed.latest?.bpm ?? null;
  const baselineBpm = feed.baselineBpm ?? null;
  const deltaBpm = bpm !== null && baselineBpm !== null ? round1(bpm - baselineBpm) : null;

  let status: WatchStatus = 'waiting';
  if (feed.sessionOpen === false) status = 'ended';
  else if (feed.active) status = 'live';
  else if (feed.paired) status = 'idle';

  return {
    state: {
      status,
      paired: Boolean(feed.paired),
      deviceNames: (feed.devices ?? []).map((d) => d.name || 'Apple Watch'),
      bpm,
      sampledAt: feed.latest ? Date.parse(feed.latest.t) : null,
      baselineBpm,
      deltaBpm,
      zone: zoneFor(deltaBpm),
      samples: samples.filter((s) => s.t >= newest - WINDOW_MS),
      cursor: Math.max(state.cursor, feed.cursor ?? 0),
      error: null,
    },
    added,
  };
}

export const withError = (state: WatchState, message: string): WatchState => ({
  ...state,
  status: state.status === 'ended' ? 'ended' : 'error',
  error: message,
});

/** Name of the source in BIOMETRIC events, next to the webcam's method names. */
export const WATCH_SOURCE = 'apple_watch';

/**
 * One watch reading as a BIOMETRIC event's data, laid out like the webcam's
 * (engine/signals.ts biometricEvent): the short fields the vision prompt reads
 * first, since it shows 120 characters of each event, then the detail.
 *
 *   hr    heart rate (bpm)
 *   ok    always true: a watch reading has no camera quality gate to fail
 *   src   "apple_watch"
 *   d     beats above resting, when the resting rate is known
 *   aro   arousal 0–1 against resting, the same mapping the webcam uses
 */
export function watchEvent(sample: WatchSample, baselineBpm: number | null): Record<string, unknown> {
  const delta = baselineBpm !== null ? round1(sample.bpm - baselineBpm) : null;
  const arousal =
    baselineBpm !== null ? Math.round(Math.min(1, Math.max(0, 0.5 + (sample.bpm - baselineBpm) / (0.5 * baselineBpm))) * 1000) / 1000 : null;
  return {
    hr: sample.bpm,
    ok: true,
    src: WATCH_SOURCE,
    ...(delta !== null ? { d: delta } : {}),
    ...(arousal !== null ? { aro: arousal } : {}),
    bio: {
      heart_rate_bpm: sample.bpm,
      baseline_bpm: baselineBpm,
      heart_rate_delta_bpm: delta,
      zone: zoneFor(delta),
      source: WATCH_SOURCE,
      measured_at: new Date(sample.t).toISOString(),
    },
    ...(arousal !== null
      ? {
          indicators: {
            version: 2,
            flow: { arousal_level: arousal },
            sources: { arousal_level: 'measured' },
            // A wrist optical sensor is a steadier heart rate than a camera.
            confidence: { arousal_level: 0.8 },
          },
        }
      : {}),
  };
}

export interface WatchPollerOptions {
  fetchFeed: (cursor: number) => Promise<Feed>;
  onUpdate: (state: WatchState, added: WatchSample[]) => void;
  intervalMs?: number;
  maxBackoffMs?: number;
  // Wrapped, never stored bare: browsers throw "Illegal invocation" when
  // setTimeout is called as a method of something other than the window.
  setTimer?: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (id: ReturnType<typeof setTimeout>) => void;
}

/** Polls the live feed, backing off on errors and stopping once the session is gone. */
export class WatchPoller {
  state: WatchState = emptyWatchState();
  running = false;
  private failures = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  private readonly opts: WatchPollerOptions;

  constructor(opts: WatchPollerOptions) {
    this.opts = opts;
  }

  start() {
    if (this.running) return;
    this.running = true;
    void this.tick(++this.generation);
  }

  stop() {
    this.running = false;
    this.generation += 1;
    if (this.timer !== null) (this.opts.clearTimer ?? ((id) => clearTimeout(id)))(this.timer);
    this.timer = null;
  }

  // A stop() while a request is in flight bumps the generation, so its answer is dropped.
  private generation = 0;

  private async tick(generation: number) {
    if (!this.running || generation !== this.generation) return;
    const interval = this.opts.intervalMs ?? 2000;
    let delay = interval;
    let added: WatchSample[] = [];
    try {
      const feed = await this.opts.fetchFeed(this.state.cursor);
      if (generation !== this.generation) return;
      const result = applyFeed(this.state, feed);
      this.state = result.state;
      added = result.added;
      this.failures = 0;
      if (this.state.status === 'ended') this.running = false;
    } catch (e) {
      if (generation !== this.generation) return;
      this.failures += 1;
      const gone = (e as { status?: number }).status === 404;
      this.state = withError(this.state, gone ? 'This watch session no longer exists.' : String((e as Error).message ?? e));
      if (gone) this.running = false;
      delay = Math.min(this.opts.maxBackoffMs ?? 30000, interval * 2 ** this.failures);
    }
    this.opts.onUpdate(this.state, added);
    if (this.running) {
      this.timer = (this.opts.setTimer ?? ((fn, ms) => setTimeout(fn, ms)))(() => void this.tick(generation), delay);
    }
  }
}
