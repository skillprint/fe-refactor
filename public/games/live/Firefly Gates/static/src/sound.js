// The wood at night, and the swarm's music: crickets, a breath of wind, a low
// pad, and bell-tones that rise when the swarm grows. All synthesised.

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];
const ROOT = 293.66; // D

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.75;
    this.master.connect(ctx.destination);

    const len = ctx.sampleRate * 2.6;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    this.verb = ctx.createConvolver();
    this.verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    this.verb.connect(wet).connect(this.master);

    // Wind in the pines.
    const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nd.length; i++) { last = last * 0.98 + (Math.random() * 2 - 1) * 0.02; nd[i] = last * 7; }
    this.noise = nb;
    const wind = ctx.createBufferSource();
    wind.buffer = nb;
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 380;
    bp.Q.value = 0.5;
    const wg = ctx.createGain();
    wg.gain.value = 0.1;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lg = ctx.createGain();
    lg.gain.value = 180;
    lfo.connect(lg).connect(bp.frequency);
    wind.connect(bp).connect(wg).connect(this.master);
    wind.start();
    lfo.start();

    // A pad, a fifth apart, barely there.
    this.pad = ctx.createGain();
    this.pad.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 650;
    this.pad.connect(lp).connect(this.master);
    for (const [f, type, v] of [[73.42, 'triangle', 0.08], [110, 'triangle', 0.06], [146.83, 'sine', 0.05], [220, 'sine', 0.02]]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * 8;
      const g = ctx.createGain();
      g.gain.value = v;
      o.connect(g).connect(this.pad);
      o.start();
    }
    this.pad.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 5);
    this.crickets();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.75, this.ctx.currentTime, 0.1);
  }

  // Crickets, chirping in threes at their own pace, off to either side.
  crickets() {
    const ctx = this.ctx;
    const chirp = (pan) => {
      if (!this.ctx) return;
      const t = ctx.currentTime + 0.05;
      const o = ctx.createOscillator();
      o.frequency.value = 4300 + Math.random() * 500;
      const g = ctx.createGain();
      g.gain.value = 0;
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      for (let k = 0; k < 3; k++) {
        g.gain.setValueAtTime(0, t + k * 0.06);
        g.gain.linearRampToValueAtTime(0.012, t + k * 0.06 + 0.012);
        g.gain.linearRampToValueAtTime(0, t + k * 0.06 + 0.04);
      }
      if (p) { p.pan.value = pan; o.connect(g).connect(p).connect(this.master); } else o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.25);
    };
    for (const pan of [-0.7, 0.6]) {
      const loop = () => { chirp(pan + (Math.random() - 0.5) * 0.3); setTimeout(loop, 700 + Math.random() * 1400); };
      setTimeout(loop, Math.random() * 1000);
    }
  }

  bell(freq, when = 0, gain = 0.16, decay = 1.6) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + when;
    for (const [mult, g0] of [[1, 1], [2.76, 0.32], [5.4, 0.1]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * g0, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay / mult);
      o.connect(g);
      g.connect(this.master);
      g.connect(this.verb);
      o.start(t);
      o.stop(t + decay + 0.1);
    }
  }

  note(step) { return ROOT * Math.pow(2, SCALE[Math.max(0, Math.min(SCALE.length - 1, step))] / 12); }

  /** Through a gate: brighter and higher for the best one, a ripple up if the swarm grew. */
  gate(best, ratio) {
    if (!this.ctx) return;
    const base = best ? 4 : 1;
    this.bell(this.note(base), 0, 0.15);
    this.bell(this.note(base + (best ? 2 : 1)), 0.09, 0.12);
    if (ratio > 1.05) {
      const n = Math.min(5, 1 + Math.round(Math.log2(ratio) * 2));
      for (let i = 0; i < n; i++) this.bell(this.note(6 + i), 0.18 + i * 0.06, 0.05, 0.9);
    }
  }

  /** Fireflies burning out. */
  fizz(amount = 0.5) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(2400, t);
    f.frequency.exponentialRampToValueAtTime(300, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12 * (0.4 + amount), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 2);
    src.stop(t + 0.6);
  }

  moth() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.35);
    this.fizz(0.8);
  }

  /** The beacon wakes: a slow chord and a cascade of bells. */
  lit() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const f of [146.83, 220, 293.66, 369.99, 440]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 1.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
      o.connect(g);
      g.connect(this.master);
      g.connect(this.verb);
      o.start(t);
      o.stop(t + 5.6);
    }
    [0, 2, 4, 5, 7, 9, 12].forEach((s, i) => this.bell(this.note(s), 0.3 + i * 0.13, 0.11, 2.2));
  }

  /** It stays cold: three notes falling away. */
  cold() {
    [5, 3, 1].forEach((s, i) => this.bell(this.note(s) / 2, i * 0.32, 0.12, 2));
  }
}
