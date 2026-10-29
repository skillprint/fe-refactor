// The pour, its rising pitch as the flask fills, bubbles, glass and bells.
// All synthesised; nothing to download.

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
    this.master.gain.value = this.muted ? 0 : 0.85;
    this.master.connect(ctx.destination);

    // A small stone room.
    const len = ctx.sampleRate * 1.8;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.verb = ctx.createConvolver();
    this.verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    this.verb.connect(wet).connect(this.master);

    // Noise for the pour and the room.
    const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noise = nb;

    // The room: a low, barely-there hush.
    const room = ctx.createBufferSource();
    room.buffer = nb;
    room.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    const rg = ctx.createGain();
    rg.gain.value = 0.05;
    room.connect(lp).connect(rg).connect(this.master);
    room.start();

    // The pour: band-passed noise, its band climbing as the column shortens.
    const pour = ctx.createBufferSource();
    pour.buffer = nb;
    pour.loop = true;
    this.pourBand = ctx.createBiquadFilter();
    this.pourBand.type = 'bandpass';
    this.pourBand.Q.value = 3.2;
    this.pourBand.frequency.value = 500;
    this.pourGain = ctx.createGain();
    this.pourGain.gain.value = 0;
    const pourHp = ctx.createBiquadFilter();
    pourHp.type = 'highpass';
    pourHp.frequency.value = 180;
    pour.connect(pourHp).connect(this.pourBand).connect(this.pourGain);
    this.pourGain.connect(this.master);
    this.pourGain.connect(this.verb);
    pour.start();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.05);
  }

  /** @param {boolean} on @param {number} level 0..1 of the flask */
  pour(on, level = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.pourGain.gain.setTargetAtTime(on ? 0.5 : 0, t, on ? 0.015 : 0.04);
    this.pourBand.frequency.setTargetAtTime(380 + 1500 * Math.pow(Math.min(1.1, level), 1.6), t, 0.05);
  }

  tone(freq, { at = 0, dur = 1.2, gain = 0.2, type = 'sine', verb = 0.5, attack = 0.005, glide = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    if (verb) { const v = ctx.createGain(); v.gain.value = verb; g.connect(v).connect(this.verb); }
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** A glass struck lightly: inharmonic partials, quick decay. */
  clink(at = 0, pitch = 1) {
    for (const [f, g] of [[1870, 0.09], [2390, 0.05], [3720, 0.035], [5210, 0.02]]) this.tone(f * pitch, { at, dur: 0.6, gain: g, verb: 0.7 });
  }

  bubble() {
    this.tone(500 + Math.random() * 500, { dur: 0.09, gain: 0.05, glide: 1.9, verb: 0.2 });
  }

  valve() {
    this.tone(140, { dur: 0.18, gain: 0.12, type: 'triangle', glide: 0.7, verb: 0.2 });
    this.clink(0.03, 0.6);
  }

  /** The grade of a served layer, a little later for each layer. */
  grade(g, i = 0) {
    const at = 0.15 + i * 0.25;
    const base = 523.25;
    if (g === 'Perfect') [1, 1.25, 1.5, 2].forEach((m, k) => this.tone(base * m, { at: at + k * 0.07, dur: 1.6, gain: 0.08, verb: 0.8 }));
    else if (g === 'Fine') [1, 1.5].forEach((m, k) => this.tone(base * m, { at: at + k * 0.09, dur: 1.1, gain: 0.08, verb: 0.6 }));
    else if (g === 'Fair') this.tone(base * 0.75, { at, dur: 0.8, gain: 0.08, type: 'triangle', verb: 0.4 });
    else this.tone(110, { at, dur: 0.5, gain: 0.14, type: 'sawtooth', glide: 0.6, verb: 0.2 });
  }

  cork() { this.tone(260, { dur: 0.12, gain: 0.18, type: 'triangle', glide: 0.5, verb: 0.3 }); }

  shelf() { this.clink(0, 0.8); this.tone(784, { at: 0.05, dur: 1.4, gain: 0.05, verb: 0.9 }); }

  tick() { this.tone(1400, { dur: 0.04, gain: 0.04, type: 'square', verb: 0.1 }); }
}
