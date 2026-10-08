// The live path for Apple Watch heart rate: a WebRTC data channel straight from
// the Skillprint iPhone app, which receives the watch's mirrored workout. The
// backend only passes the offer and answer along (biometrics/api/live/<id>/rtc/);
// readings never touch it. When this link is down, the page falls back to
// polling the backend, which the watch keeps uploading to.
//
// Messages from the phone, one JSON object each:
//   { "v": 1, "type": "hr", "t": <epoch ms measured>, "bpm": 84.2, "rest": 68.1 | null }
//   { "v": 1, "type": "ping" }                       every few seconds, so silence means trouble
//   { "v": 1, "type": "state", "state": "running" | "paused" | "ended" }

import type { IceServer, LiveApi } from './liveApi';

export type RtcStatus = 'idle' | 'connecting' | 'connected' | 'failed' | 'closed';

export interface RtcReading {
  t: number;
  bpm: number;
  /** The phone's resting rate (median of the workout's first minute), when it has one. */
  rest: number | null;
}

/** The parts of RTCPeerConnection and RTCDataChannel this uses, so tests can stand in for them. */
export interface PeerChannel {
  readyState: string;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  close(): void;
}

export interface Peer {
  iceGatheringState: string;
  connectionState: string;
  localDescription: { sdp: string; type: string } | null;
  onicegatheringstatechange: (() => void) | null;
  onconnectionstatechange: (() => void) | null;
  createDataChannel(label: string, options?: { ordered?: boolean }): PeerChannel;
  createOffer(): Promise<{ sdp?: string; type: string }>;
  setLocalDescription(description: { sdp?: string; type: string }): Promise<void>;
  setRemoteDescription(description: { sdp: string; type: 'answer' }): Promise<void>;
  close(): void;
}

export interface RtcLinkOptions {
  api: LiveApi;
  liveSessionId: string;
  viewerToken: string;
  onStatus: (status: RtcStatus, detail?: string) => void;
  onReading: (reading: RtcReading) => void;
  onWatchState?: (state: 'running' | 'paused' | 'ended') => void;
  createPeer?: (config: { iceServers: IceServer[] }) => Peer;
  /** How long to gather ICE candidates before sending the offer anyway. */
  gatherTimeoutMs?: number;
  /** How long the phone has to answer. */
  answerTimeoutMs?: number;
  answerPollMs?: number;
  /** How long the channel has to open once answered. */
  openTimeoutMs?: number;
  /** Silence longer than this (no reading, no ping) counts as a dropped link. */
  staleAfterMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  setTimer?: (fn: () => void, ms: number) => ReturnType<typeof setInterval>;
  clearTimer?: (id: ReturnType<typeof setInterval>) => void;
}

/** Parses one data-channel message; anything malformed is ignored. */
export function parseMessage(data: unknown):
  | { type: 'hr'; reading: RtcReading }
  | { type: 'ping' }
  | { type: 'state'; state: 'running' | 'paused' | 'ended' }
  | null {
  if (typeof data !== 'string' || data.length > 2000) return null;
  let message: Record<string, unknown>;
  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }
  if (!message || typeof message !== 'object') return null;
  if (message.type === 'ping') return { type: 'ping' };
  if (message.type === 'state' && (message.state === 'running' || message.state === 'paused' || message.state === 'ended')) {
    return { type: 'state', state: message.state };
  }
  if (message.type === 'hr') {
    const { t, bpm, rest } = message;
    if (typeof t !== 'number' || !Number.isFinite(t) || typeof bpm !== 'number' || bpm < 25 || bpm > 250) return null;
    return { type: 'hr', reading: { t: Math.round(t), bpm, rest: typeof rest === 'number' && Number.isFinite(rest) ? rest : null } };
  }
  return null;
}

export class WatchRtcLink {
  status: RtcStatus = 'idle';
  private peer: Peer | null = null;
  private channel: PeerChannel | null = null;
  private lastHeard = 0;
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;
  private readonly opts: Required<Omit<RtcLinkOptions, 'onWatchState' | 'createPeer'>> &
    Pick<RtcLinkOptions, 'onWatchState' | 'createPeer'>;

  constructor(opts: RtcLinkOptions) {
    this.opts = {
      gatherTimeoutMs: 3000,
      answerTimeoutMs: 30000,
      answerPollMs: 1000,
      openTimeoutMs: 15000,
      staleAfterMs: 12000,
      now: () => Date.now(),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      // Wrapped, never stored bare: browsers throw "Illegal invocation" otherwise.
      setTimer: (fn, ms) => setInterval(fn, ms),
      clearTimer: (id) => clearInterval(id),
      ...opts,
    };
  }

  private setStatus(status: RtcStatus, detail?: string) {
    if (this.closed && status !== 'closed') return;
    if (this.status === status) return;
    this.status = status;
    this.opts.onStatus(status, detail);
  }

  /** One attempt. Resolves when the channel is open; on failure, status is 'failed' and it resolves false. */
  async connect(): Promise<boolean> {
    const { api, liveSessionId, viewerToken } = this.opts;
    this.setStatus('connecting');
    try {
      const { iceServers } = await api.rtcConfig(liveSessionId, viewerToken);
      if (this.closed) return false;
      const peer = (this.opts.createPeer ?? defaultPeer)({ iceServers });
      this.peer = peer;
      const channel = peer.createDataChannel('heart-rate', { ordered: true });
      this.channel = channel;
      const opened = new Promise<boolean>((resolve) => {
        channel.onopen = () => resolve(true);
        channel.onclose = () => {
          resolve(false);
          this.drop('The iPhone closed the connection.');
        };
      });
      channel.onmessage = (event) => this.receive(event.data);
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'failed' || peer.connectionState === 'closed') this.drop('The direct connection dropped.');
      };

      await peer.setLocalDescription(await peer.createOffer());
      await this.gathered(peer);
      if (this.closed || !peer.localDescription) return false;
      const { offerId } = await api.postOffer(liveSessionId, viewerToken, peer.localDescription.sdp);

      const answer = await this.awaitAnswer(offerId);
      if (!answer) return this.fail('The iPhone app did not answer. Is Skillprint open on your iPhone?');
      await peer.setRemoteDescription({ type: 'answer', sdp: answer });

      const open = await Promise.race([opened, this.opts.sleep(this.opts.openTimeoutMs).then(() => false)]);
      if (!open) return this.fail("Couldn't open a direct connection to the iPhone (the networks may not allow it).");
      this.lastHeard = this.opts.now();
      this.staleTimer = this.opts.setTimer(() => {
        if (this.opts.now() - this.lastHeard > this.opts.staleAfterMs) this.drop('The iPhone went quiet.');
      }, 2000);
      this.setStatus('connected');
      return true;
    } catch (e) {
      return this.fail(String((e as Error).message ?? e));
    }
  }

  close() {
    this.closed = true;
    this.teardown();
    this.status = 'closed';
  }

  private receive(data: unknown) {
    const message = parseMessage(data);
    if (!message) return;
    this.lastHeard = this.opts.now();
    if (message.type === 'hr') this.opts.onReading(message.reading);
    else if (message.type === 'state') this.opts.onWatchState?.(message.state);
  }

  private async gathered(peer: Peer) {
    if (peer.iceGatheringState === 'complete') return;
    await Promise.race([
      new Promise<void>((resolve) => {
        peer.onicegatheringstatechange = () => {
          if (peer.iceGatheringState === 'complete') resolve();
        };
      }),
      // Some networks never finish gathering; send what we have.
      this.opts.sleep(this.opts.gatherTimeoutMs),
    ]);
  }

  private async awaitAnswer(offerId: string): Promise<string | null> {
    const { api, liveSessionId, viewerToken } = this.opts;
    const deadline = this.opts.now() + this.opts.answerTimeoutMs;
    while (!this.closed && this.opts.now() < deadline) {
      const answer = await api.getAnswer(liveSessionId, viewerToken, offerId);
      if (answer.status === 'answered' && answer.sdp) return answer.sdp;
      if (answer.status === 'expired') return null;
      await this.opts.sleep(this.opts.answerPollMs);
    }
    return null;
  }

  private fail(detail: string): false {
    this.teardown();
    this.setStatus('failed', detail);
    return false;
  }

  private drop(detail: string) {
    if (this.status !== 'connected' && this.status !== 'connecting') return;
    this.fail(detail);
  }

  private teardown() {
    if (this.staleTimer !== null) this.opts.clearTimer(this.staleTimer);
    this.staleTimer = null;
    const channel = this.channel;
    const peer = this.peer;
    this.channel = null;
    this.peer = null;
    if (channel) {
      channel.onclose = null;
      channel.onmessage = null;
      channel.close();
    }
    if (peer) {
      peer.onconnectionstatechange = null;
      peer.close();
    }
  }
}

function defaultPeer(config: { iceServers: IceServer[] }): Peer {
  return new RTCPeerConnection(config) as unknown as Peer;
}
