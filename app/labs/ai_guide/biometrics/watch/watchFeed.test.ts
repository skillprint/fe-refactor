import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Feed } from './liveApi';
import { LiveApi } from './liveApi';
import { encodeQR } from './qr';
import { applyFeed, emptyWatchState, WatchPoller, watchEvent, zoneFor, type WatchState } from './watchFeed';

const T0 = Date.parse('2026-10-07T20:00:00.000Z');
const iso = (ms: number) => new Date(ms).toISOString();

function feed(samples: [number, number, number][], extra: Partial<Feed> = {}): Feed {
  const last = samples[samples.length - 1];
  return {
    sessionOpen: true,
    paired: true,
    active: true,
    devices: [{ deviceId: 'd', name: 'Apple Watch', claimedAt: iso(T0) }],
    baselineBpm: 70,
    samples: samples.map(([id, t, bpm]) => ({ id, t: iso(t), bpm })),
    latest: last ? { id: last[0], t: iso(last[1]), bpm: last[2] } : null,
    cursor: last ? last[0] : 0,
    ...extra,
  };
}

test('zones are measured from resting', () => {
  assert.equal(zoneFor(null), null);
  assert.equal(zoneFor(3), 'calm');
  assert.equal(zoneFor(12), 'engaged');
  assert.equal(zoneFor(20), 'elevated');
  assert.equal(zoneFor(40), 'intense');
});

test('applyFeed reports only the samples it has not seen', () => {
  let { state, added } = applyFeed(emptyWatchState(), feed([[1, T0, 72], [2, T0 + 2000, 80]]));
  assert.deepEqual(added.map((s) => s.id), [1, 2]);
  assert.equal(state.status, 'live');
  assert.equal(state.deltaBpm, 10);
  assert.equal(state.zone, 'engaged');
  assert.equal(state.cursor, 2);

  ({ state, added } = applyFeed(state, feed([[2, T0 + 2000, 80], [3, T0 + 4000, 101]])));
  assert.deepEqual(added.map((s) => s.id), [3]);
  assert.equal(state.zone, 'intense');
});

test('status follows pairing and activity', () => {
  assert.equal(applyFeed(emptyWatchState(), feed([], { paired: false, active: false })).state.status, 'waiting');
  assert.equal(applyFeed(emptyWatchState(), feed([], { active: false })).state.status, 'idle');
  assert.equal(applyFeed(emptyWatchState(), feed([], { sessionOpen: false })).state.status, 'ended');
});

test('a watch reading becomes a BIOMETRIC event whose head fits the prompt', () => {
  const data = watchEvent({ id: 9, t: T0, bpm: 91 }, 70);
  assert.deepEqual(Object.keys(data).slice(0, 5), ['hr', 'ok', 'src', 'd', 'aro']);
  assert.equal(data.src, 'apple_watch');
  assert.equal(data.d, 21);
  assert.equal((data.bio as { zone: string }).zone, 'elevated');
  // The vision prompt shows 120 characters of each event's data.
  const head = JSON.stringify({ hr: data.hr, ok: data.ok, src: data.src, d: data.d, aro: data.aro });
  assert.ok(head.length < 120, head);
  // `event` and `timestamp` belong to the timeline and must not be set here.
  assert.equal('event' in data || 'timestamp' in data, false);

  const noBaseline = watchEvent({ id: 1, t: T0, bpm: 75 }, null);
  assert.equal('d' in noBaseline || 'aro' in noBaseline || 'indicators' in noBaseline, false);
});

test('the poller backs off, drops answers after stop, and stops when the session is gone', async () => {
  const delays: number[] = [];
  const updates: WatchState[] = [];
  const responses: Array<() => Feed> = [
    () => feed([[1, T0, 75]]),
    () => { throw Object.assign(new Error('boom'), { status: 502 }); },
    () => { throw Object.assign(new Error('gone'), { status: 404 }); },
  ];
  let done!: () => void;
  const finished = new Promise<void>((resolve) => { done = resolve; });
  const poller = new WatchPoller({
    fetchFeed: async () => responses.shift()!(),
    onUpdate: (state) => {
      updates.push(state);
      if (!poller.running) done();
    },
    intervalMs: 1000,
    setTimer: (fn, ms) => {
      delays.push(ms);
      queueMicrotask(fn);
      return 0 as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimer: () => {},
  });
  poller.start();
  await finished;
  assert.deepEqual(delays, [1000, 2000]);
  assert.equal(updates.at(-1)!.status, 'error');

  // A stop() while a request is in flight: its answer never reaches onUpdate.
  let release!: (f: Feed) => void;
  const late: WatchState[] = [];
  const slow = new WatchPoller({
    fetchFeed: () => new Promise<Feed>((resolve) => { release = resolve; }),
    onUpdate: (state) => late.push(state),
  });
  slow.start();
  slow.stop();
  release(feed([[1, T0, 80]]));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(late.length, 0);
});

test('the API client sends the viewer token and the cursor', async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const api = new LiveApi('http://api.test', async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(feed([])), { status: 200 });
  });
  await api.feed('abc', 'secret-token', 42);
  assert.equal(calls[0].url, 'http://api.test/biometrics/api/live/abc/?after=42');
  assert.equal((calls[0].init?.headers as Record<string, string>)['X-Live-Token'], 'secret-token');

  const failing = new LiveApi('http://api.test/', async () => new Response('{"detail":"nope"}', { status: 404 }));
  await assert.rejects(failing.feed('abc', 't'), (e: Error & { status: number }) => e.status === 404 && e.message === 'nope');
});

test('the QR port matches the encoder it came from', () => {
  // Pinned against skillprint-live/app/src/qr.js, which was checked by decoding with CoreImage.
  const link = 'skillprint-watch://pair?code=K7Q4MD&api=https%3A%2F%2Fapi.skillprint.com%2F';
  const qr = encodeQR(link, { ecc: 'M' });
  assert.equal(qr.version, 5);
  assert.equal(qr.size, 37);
  assert.equal(qr.modules[qr.size - 8][8], true, 'dark module');
});
