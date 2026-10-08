import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Feed, LiveApi, RtcAnswer } from './liveApi';
import { parseMessage, WatchRtcLink, type Peer, type PeerChannel, type RtcStatus } from './rtc';
import { applyFeed, applyRtcReading, emptyWatchState } from './watchFeed';

const T0 = Date.parse('2026-10-08T16:00:00.000Z');

class FakeChannel implements PeerChannel {
  readyState = 'connecting';
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  closed = false;
  close() { this.closed = true; }
  open() { this.readyState = 'open'; this.onopen?.(); }
  send(message: unknown) { this.onmessage?.({ data: JSON.stringify(message) }); }
}

class FakePeer implements Peer {
  iceGatheringState = 'new';
  connectionState = 'new';
  localDescription: { sdp: string; type: string } | null = null;
  remote: string | null = null;
  onicegatheringstatechange: (() => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  channel = new FakeChannel();
  closed = false;
  config: unknown;
  constructor(config: unknown) { this.config = config; }
  createDataChannel() { return this.channel; }
  async createOffer() { return { type: 'offer', sdp: 'offer-sdp' }; }
  async setLocalDescription(d: { sdp?: string; type: string }) {
    this.localDescription = { sdp: `${d.sdp}+candidates`, type: d.type };
    queueMicrotask(() => { this.iceGatheringState = 'complete'; this.onicegatheringstatechange?.(); });
  }
  async setRemoteDescription(d: { sdp: string }) {
    this.remote = d.sdp;
    queueMicrotask(() => this.channel.open());
  }
  close() { this.closed = true; }
}

function fakeApi(answers: RtcAnswer[]) {
  const calls: string[] = [];
  const api = {
    rtcConfig: async () => { calls.push('config'); return { iceServers: [{ urls: ['stun:stun.test'] }] }; },
    postOffer: async (_id: string, _token: string, sdp: string) => { calls.push(`offer:${sdp}`); return { offerId: 'o1', expiresAt: '' }; },
    getAnswer: async () => { calls.push('answer?'); return answers.shift() ?? { offerId: 'o1', status: 'pending' }; },
  } as unknown as LiveApi;
  return { api, calls };
}

function makeLink(api: LiveApi, overrides: Partial<ConstructorParameters<typeof WatchRtcLink>[0]> = {}) {
  const statuses: RtcStatus[] = [];
  const readings: number[] = [];
  let peer!: FakePeer;
  let clock = T0;
  const link = new WatchRtcLink({
    api,
    liveSessionId: 'live-1',
    viewerToken: 'viewer',
    onStatus: (s) => statuses.push(s),
    onReading: (r) => readings.push(r.bpm),
    createPeer: (config) => (peer = new FakePeer(config)),
    sleep: async () => { clock += 1000; },
    now: () => clock,
    setTimer: () => 0 as unknown as ReturnType<typeof setInterval>,
    clearTimer: () => {},
    ...overrides,
  });
  return { link, statuses, readings, peer: () => peer };
}

test('messages from the phone are validated', () => {
  assert.deepEqual(parseMessage('{"v":1,"type":"hr","t":1791475200000.4,"bpm":84.2,"rest":68}'),
    { type: 'hr', reading: { t: 1791475200000, bpm: 84.2, rest: 68 } });
  assert.deepEqual(parseMessage('{"type":"ping"}'), { type: 'ping' });
  assert.deepEqual(parseMessage('{"type":"state","state":"paused"}'), { type: 'state', state: 'paused' });
  for (const bad of ['nope', '{"type":"hr","t":"x","bpm":80}', '{"type":"hr","t":1,"bpm":400}', 42, '{"type":"state","state":"x"}']) {
    assert.equal(parseMessage(bad), null, String(bad));
  }
});

test('the link offers with gathered candidates, takes the answer and passes readings on', async () => {
  const { api, calls } = fakeApi([{ offerId: 'o1', status: 'pending' }, { offerId: 'o1', status: 'answered', sdp: 'answer-sdp' }]);
  const { link, statuses, readings, peer } = makeLink(api);
  assert.equal(await link.connect(), true);
  assert.deepEqual(statuses, ['connecting', 'connected']);
  assert.deepEqual(calls, ['config', 'offer:offer-sdp+candidates', 'answer?', 'answer?']);
  assert.equal(peer().remote, 'answer-sdp');
  assert.deepEqual(peer().config, { iceServers: [{ urls: ['stun:stun.test'] }] });

  peer().channel.send({ v: 1, type: 'hr', t: T0, bpm: 90, rest: 70 });
  peer().channel.send({ v: 1, type: 'hr', t: T0 + 1000, bpm: 300 }); // glitch, dropped
  assert.deepEqual(readings, [90]);

  peer().channel.onclose?.();
  assert.equal(statuses.at(-1), 'failed');
  assert.equal(peer().closed, true);
});

test('no answer in time is a failure, not a hang', async () => {
  const { api } = fakeApi([]);
  const { link, statuses } = makeLink(api, { answerTimeoutMs: 3000 });
  assert.equal(await link.connect(), false);
  assert.deepEqual(statuses, ['connecting', 'failed']);
});

test('a reading arriving over both paths is kept once, and the fresher one wins', () => {
  let state = applyRtcReading(emptyWatchState(), { t: T0 + 2000, bpm: 95, rest: 70 })!;
  assert.equal(state.status, 'live');
  assert.equal(state.deltaBpm, 25);
  assert.equal(applyRtcReading(state, { t: T0 + 2000, bpm: 95, rest: 70 }), null, 'same measurement twice');

  // The server's poll trails: it brings the same reading plus an older one, and a baseline.
  const feed: Feed = {
    sessionOpen: true, paired: true, active: true, devices: [], baselineBpm: 68,
    samples: [{ id: 7, t: new Date(T0 + 1000).toISOString(), bpm: 90 }, { id: 8, t: new Date(T0 + 2000).toISOString(), bpm: 95 }],
    latest: { id: 7, t: new Date(T0 + 1000).toISOString(), bpm: 90 }, cursor: 8,
  };
  const result = applyFeed(state, feed);
  assert.deepEqual(result.added.map((s) => s.t), [T0 + 1000], 'only the reading the link missed');
  assert.equal(result.state.bpm, 95, "the direct reading is newer than the server's latest");
  assert.equal(result.state.baselineBpm, 68, "the server's baseline replaces the phone's");
  state = result.state;
  assert.equal(state.samples.length, 2);
});
