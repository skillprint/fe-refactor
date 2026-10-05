/**
 * Procedural WebAudio: shots, hits, pickups, explosions and a droning soundtrack
 * whose pulse follows PARAMS.musicIntensity. No audio files.
 */
import { PARAMS } from './params.js';

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.enabled = true;
  }

  /** Must be called from a user gesture. */
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);
    this.startMusic();
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  _env(gain, t, a, d, peak = 1) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  _noise(duration) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  shoot(weaponId) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(this.master);
    if (weaponId === 2) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(220, t + 0.12);
      o.connect(g);
      this._env(g, t, 0.005, 0.12, 0.25);
      o.start(t); o.stop(t + 0.15);
      return;
    }
    const n = this._noise(0.25);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(weaponId === 1 ? 900 : 2200, t);
    f.frequency.exponentialRampToValueAtTime(120, t + (weaponId === 1 ? 0.3 : 0.14));
    n.connect(f); f.connect(g);
    this._env(g, t, 0.003, weaponId === 1 ? 0.32 : 0.16, weaponId === 1 ? 0.7 : 0.45);
    n.start(t);
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(weaponId === 1 ? 70 : 140, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    const g2 = ctx.createGain(); g2.connect(this.master);
    o.connect(g2);
    this._env(g2, t, 0.002, 0.1, 0.35);
    o.start(t); o.stop(t + 0.14);
  }

  hit() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    const g = ctx.createGain(); g.connect(this.master); o.connect(g);
    this._env(g, t, 0.002, 0.08, 0.3);
    o.start(t); o.stop(t + 0.1);
  }

  enemyDeath() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.35);
    const g = ctx.createGain(); g.connect(this.master); o.connect(g);
    this._env(g, t, 0.01, 0.35, 0.35);
    o.start(t); o.stop(t + 0.4);
    const n = this._noise(0.3);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 400;
    const g2 = ctx.createGain(); g2.connect(this.master);
    n.connect(f); f.connect(g2);
    this._env(g2, t, 0.01, 0.3, 0.3);
    n.start(t);
  }

  explosion() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noise(0.8);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(1200, t);
    f.frequency.exponentialRampToValueAtTime(60, t + 0.7);
    const g = ctx.createGain(); g.connect(this.master);
    n.connect(f); f.connect(g);
    this._env(g, t, 0.005, 0.7, 0.9);
    n.start(t);
  }

  playerHurt() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.25);
    const g = ctx.createGain(); g.connect(this.master); o.connect(g);
    this._env(g, t, 0.005, 0.25, 0.4);
    o.start(t); o.stop(t + 0.3);
  }

  pickup(kind) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const base = kind === 'gold' ? 880 : kind === 'health' ? 660 : 520;
    [0, 0.07].forEach((d, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = base * (i ? 1.5 : 1);
      const g = ctx.createGain(); g.connect(this.master); o.connect(g);
      this._env(g, t + d, 0.005, 0.12, 0.25);
      o.start(t + d); o.stop(t + d + 0.15);
    });
  }

  telegraph() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 1400;
    const g = ctx.createGain(); g.connect(this.master); o.connect(g);
    this._env(g, t, 0.002, 0.05, 0.12);
    o.start(t); o.stop(t + 0.07);
  }

  jump() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(440, t + 0.1);
    const g = ctx.createGain(); g.connect(this.master); o.connect(g);
    this._env(g, t, 0.005, 0.1, 0.15);
    o.start(t); o.stop(t + 0.12);
  }

  startMusic() {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    g.connect(this.master);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 320;
    f.connect(g);
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55;
    const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 55.6;
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = 27.5;
    o1.connect(f); o2.connect(f); o3.connect(f);
    o1.start(); o2.start(); o3.start();
    // pulse LFO on the filter
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain); lfoGain.connect(f.frequency);
    lfo.start();
    this.music = { g, f, lfo, lfoGain, o1, o2 };
  }

  /** Called each frame; follows musicIntensity and danger. */
  update(danger = 0) {
    if (!this.music || !this.ctx) return;
    const m = PARAMS.musicIntensity;
    const t = this.ctx.currentTime;
    const target = 1 + m * 5 + danger * 2;
    this.music.lfo.frequency.setTargetAtTime(target, t, 0.5);
    this.music.f.frequency.setTargetAtTime(220 + m * 500 + danger * 300, t, 0.5);
    this.music.g.gain.setTargetAtTime(0.06 + m * 0.16, t, 0.5);
    this.music.o2.detune.setTargetAtTime(danger * 40, t, 1);
  }
}
