// Wind chimes and the small sounds of handling metal. All synthesised.

// Tubular-bell partials: a struck tube's overtones aren't harmonic, which is
// what makes a chime a chime.
const PARTIALS = [[1, 1, 1.0], [2.756, 0.5, 0.55], [5.404, 0.28, 0.32], [8.933, 0.14, 0.18]];
// D major pentatonic, two octaves up from D4.
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const hz = (semi) => 293.66 * Math.pow(2, semi / 12);

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
    this.master.gain.value = this.muted ? 0 : 0.7;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    // A gallery's long, bright tail.
    const len = ctx.sampleRate * 2.6;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.verb = ctx.createConvolver();
    this.verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    this.verb.connect(wet).connect(this.master);

    // Room tone, barely there.
    const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nd.length; i++) { last = last * 0.985 + (Math.random() * 2 - 1) * 0.015; nd[i] = last * 4; }
    const air = ctx.createBufferSource();
    air.buffer = nb;
    air.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const ag = ctx.createGain();
    ag.gain.value = 0.05;
    air.connect(lp).connect(ag).connect(this.master);
    air.start();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.05);
  }

  get ok() { return this.ctx && !this.muted; }

  chime(semi, { at = 0, gain = 0.22, decay = 2.4 } = {}) {
    if (!this.ok) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const f = hz(semi);
    const out = ctx.createGain();
    out.gain.value = gain;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.max(-0.6, Math.min(0.6, (semi - 12) / 20)); out.connect(pan); pan.connect(this.master); pan.connect(this.verb); } else { out.connect(this.master); out.connect(this.verb); }
    for (const [ratio, amp, dk] of PARTIALS) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay * dk);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay * dk + 0.05);
    }
  }

  // A short knock: filtered noise, for lifting and setting down.
  knock(freq = 1800, gain = 0.12) {
    if (!this.ok) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    const src = ctx.createBufferSource();
    src.buffer = b;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 2.5;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(bp).connect(g).connect(this.master);
    g.connect(this.verb);
    src.start(t);
  }

  lift() { this.knock(2400, 0.08); }
  // Heavier weights ring lower.
  hang(w) { this.knock(1400, 0.1); this.chime(SCALE[Math.max(0, 9 - Math.round(w * 0.6))], { gain: 0.12, decay: 1.6 }); }
  shelve() { this.knock(900, 0.09); }
  level() { this.chime(14, { gain: 0.1, decay: 2 }); this.chime(19, { at: 0.09, gain: 0.08, decay: 2 }); }
  pinned() { this.knock(600, 0.14); }

  solved() {
    [0, 4, 7, 9, 12, 16, 19, 24].forEach((s, i) => this.chime(s, { at: i * 0.11 + Math.random() * 0.03, gain: 0.16, decay: 3.2 }));
    [0, 7, 16].forEach((s) => this.chime(s - 12, { at: 0.95, gain: 0.1, decay: 4.5 }));
  }

  wrong() { this.chime(-5, { gain: 0.14, decay: 1.4 }); this.chime(-4, { at: 0.04, gain: 0.12, decay: 1.4 }); this.knock(500, 0.12); }
  release() { this.knock(700, 0.1); }
  out() { [12, 9, 7, 4, 0].forEach((s, i) => this.chime(s - 12, { at: i * 0.22, gain: 0.1, decay: 2.6 })); }
}
