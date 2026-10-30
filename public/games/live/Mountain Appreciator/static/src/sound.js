// Wind, a low drone, and bells. All synthesised; nothing to download.

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

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
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(ctx.destination);

    // A long, soft room for the bells.
    const len = ctx.sampleRate * 3.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    this.verb = ctx.createConvolver();
    this.verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.42;
    this.verb.connect(wet).connect(this.master);

    // Wind: filtered noise with a slow, wandering band.
    const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nd.length; i++) { last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; nd[i] = last * 6; }
    const wind = ctx.createBufferSource();
    wind.buffer = nb;
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 0.6;
    const wg = ctx.createGain();
    wg.gain.value = 0.16;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = ctx.createGain();
    lg.gain.value = 260;
    lfo.connect(lg).connect(bp.frequency);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.11;
    const lg2 = ctx.createGain();
    lg2.gain.value = 0.07;
    lfo2.connect(lg2).connect(wg.gain);
    wind.connect(bp).connect(wg).connect(this.master);
    wind.start(); lfo.start(); lfo2.start();

    // Drone: a fifth, barely there.
    this.drone = ctx.createGain();
    this.drone.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    this.drone.connect(lp).connect(this.master);
    this.droneOsc = [73.42, 110, 146.83].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 4;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.05 : 0.09;
      o.connect(g).connect(this.drone);
      o.start();
      return o;
    });
    this.drone.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 6);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.1);
  }

  // Shift the drone's key per pair, so each pair has its own mood.
  setKey(root) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const base = 55 * Math.pow(2, root / 12);
    [1, 1.5, 2].forEach((m, i) => this.droneOsc[i].frequency.setTargetAtTime(base * m, t, 1.5));
  }

  bell(step, { gain = 0.22, octave = 0, when = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const f = 523.25 * Math.pow(2, (PENTA[step % PENTA.length] + 12 * octave) / 12);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(gain, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    out.connect(this.master);
    out.connect(this.verb);
    [[1, 1], [2.76, 0.32], [5.4, 0.12], [8.9, 0.05]].forEach(([m, a]) => {
      const o = ctx.createOscillator();
      o.frequency.value = f * m;
      const g = ctx.createGain();
      g.gain.setValueAtTime(a, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2 / m);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 3.3);
    });
  }

  found(i) { this.bell(i); this.bell(i + 2, { gain: 0.08, when: 0.09 }); }

  miss() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.35);
  }

  tick() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.025, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.05);
  }

  complete() { [0, 2, 4, 5, 7].forEach((s, i) => this.bell(s, { gain: 0.16, when: i * 0.16 })); }
  dusk() { [4, 2, 0].forEach((s, i) => this.bell(s, { gain: 0.12, octave: -1, when: i * 0.35 })); }
  keep() { this.bell(5, { gain: 0.14 }); this.bell(9, { gain: 0.08, when: 0.2 }); }
}
