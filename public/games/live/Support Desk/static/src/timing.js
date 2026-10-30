// Clocks. The shift clock stops while the portal has the game paused; turn
// latency is measured from the moment the customer finished (text shown, or
// speech ended) to the moment the agent's reply is sent.

export const epochMs = () => performance.timeOrigin + performance.now();

export class Timing {
  constructor() {
    this.shiftStart = null;
    this.pausedAt = null;
    this.pausedTotal = 0;
    this.customerDoneAt = new Map();
    this.ticketOpenedAt = new Map();
  }

  start() { this.shiftStart = performance.now(); }

  get running() { return this.shiftStart !== null && this.pausedAt === null; }

  pause() { if (this.shiftStart !== null && this.pausedAt === null) this.pausedAt = performance.now(); }

  resume() {
    if (this.pausedAt !== null) { this.pausedTotal += performance.now() - this.pausedAt; this.pausedAt = null; }
  }

  /** Shift time elapsed, excluding pauses. */
  elapsedMs() {
    if (this.shiftStart === null) return 0;
    const end = this.pausedAt ?? performance.now();
    return Math.max(0, end - this.shiftStart - this.pausedTotal);
  }

  ticketOpened(id) { this.ticketOpenedAt.set(id, performance.now()); this.customerDoneAt.set(id, performance.now()); }

  ticketAgeMs(id) { const t = this.ticketOpenedAt.get(id); return t == null ? 0 : performance.now() - t; }

  /** The customer has finished their turn (text shown or speech ended). */
  customerDone(id, at = performance.now()) { this.customerDoneAt.set(id, at); }

  /** The customer is still speaking: nothing is waiting on the agent until they finish. */
  customerSpeaking(id) { this.customerDoneAt.delete(id); }

  /** The agent is replying now: how long the customer waited, in ms (0 when nothing was pending). */
  agentReplies(id) {
    const t = this.customerDoneAt.get(id);
    if (t == null) return 0;
    this.customerDoneAt.delete(id);
    return Math.max(0, Math.round(performance.now() - t));
  }

  /** How long the customer has been waiting right now, or 0. */
  waitingMs(id) { const t = this.customerDoneAt.get(id); return t == null ? 0 : Math.max(0, performance.now() - t); }
}

export const mmss = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
