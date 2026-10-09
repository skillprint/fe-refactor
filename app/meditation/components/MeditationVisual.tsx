'use client';

import { useEffect, useRef } from 'react';
import type { TimelineSegment } from '../../../lib/models/meditation/generator';
import type { PaletteName, VisualSettings } from '../../../lib/models/meditation/meditationApi';

export interface Palette {
  label: string;
  background: [string, string];
  glow: string;
  waves: string[];
}

export const PALETTES: Record<PaletteName, Palette> = {
  dusk: { label: 'Dusk', background: ['#0f0b24', '#2a1850'], glow: '#8f7bff', waves: ['#6f5cff', '#a86cff', '#ff8fb8', '#5b8cff'] },
  ocean: { label: 'Ocean', background: ['#02131f', '#073a52'], glow: '#4fd1e8', waves: ['#0e7490', '#22a6c4', '#5eead4', '#38bdf8'] },
  forest: { label: 'Forest', background: ['#07140f', '#163a2a'], glow: '#9be7b0', waves: ['#1f6f4a', '#3fa36b', '#a3d977', '#64c49a'] },
  dawn: { label: 'Dawn', background: ['#1b1030', '#8a4a63'], glow: '#ffc59e', waves: ['#ff9e7a', '#ffc48c', '#f78fb3', '#c78bff'] },
  skillprint: { label: 'Skillprint', background: ['#0b0a1f', '#1d1650'], glow: '#7a66ff', waves: ['#543deb', '#26b8ff', '#05df91', '#b05cff'] },
};

/** 0 → 1 → 0 over one breath cycle: inhale on the way up, exhale on the way down. */
export function breathLevel(seconds: number, cycle: number): number {
  const phase = (((seconds % cycle) + cycle) % cycle) / cycle;
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}

export function segmentAt(segments: TimelineSegment[] | undefined, t: number): TimelineSegment | undefined {
  if (!segments) return undefined;
  return segments.find((s) => t >= s.start && t < s.end);
}

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  twinkle: number;
}

function seededParticles(count: number): Particle[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: 0.4 + rand() * 1.4,
    speed: 0.004 + rand() * 0.012,
    twinkle: rand() * Math.PI * 2,
  }));
}

interface Props {
  settings: VisualSettings;
  /** Playback position in seconds; drives the speech-reactive swell. */
  getTime?: () => number;
  segments?: TimelineSegment[];
  playing?: boolean;
  className?: string;
}

/**
 * A calm generative scene drawn on a canvas each frame: no video or image assets.
 * Motion follows a breathing cycle, and swells gently while the voice is speaking
 * (from the generator's timeline, so it works for any audio host without CORS).
 */
export default function MeditationVisual({ settings, getTime, segments, playing = true, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ settings, getTime, segments, playing });
  live.current = { settings, getTime, segments, playing };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = seededParticles(70);
    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let clock = 0; // scene time: runs at full speed while playing, drifts slowly when paused
    let energy = 0; // eased 0..1, how much the voice is speaking
    let last = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      const { settings: s, getTime: time, segments: segs, playing: isPlaying } = live.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const speed = (isPlaying ? 1 : 0.25) * (reduced ? 0.35 : 1);
      clock += dt * speed;

      const position = time ? time() : clock;
      const speaking = isPlaying && segmentAt(segs, position)?.kind === 'speech' ? 1 : 0;
      energy += (speaking - energy) * Math.min(1, dt * (speaking ? 2.5 : 0.8));

      const palette = PALETTES[s.palette] ?? PALETTES.dusk;
      const breath = breathLevel(clock, Math.max(4, s.breathSeconds));
      const minSide = Math.min(width, height);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, palette.background[0]);
      bg.addColorStop(1, palette.background[1]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Soft central glow that breathes.
      const glowR = minSide * (0.45 + 0.15 * breath);
      const glow = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, glowR);
      glow.addColorStop(0, withAlpha(palette.glow, 0.18 + 0.12 * breath));
      glow.addColorStop(1, withAlpha(palette.glow, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Drifting motes.
      for (const p of particles) {
        const y = (((p.y - clock * p.speed) % 1) + 1) % 1;
        const alpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock * 0.8 + p.twinkle));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x * width, y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'screen';
      if (s.style === 'orb') drawOrb(ctx, width, height, minSide, clock, breath, energy, palette, s.breathSeconds);
      if (s.style === 'aurora') drawAurora(ctx, width, height, clock, breath, energy, palette);
      ctx.globalCompositeOperation = 'source-over';
      drawWaves(ctx, width, height, clock, breath, energy, palette, s.style === 'waves' ? 1 : 0.45);

      // Settle the bottom edge back into the night so the sea doesn't glare.
      const shade = ctx.createLinearGradient(0, height * 0.7, 0, height);
      shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shade.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function drawWaves(
  ctx: CanvasRenderingContext2D, width: number, height: number, t: number, breath: number, energy: number,
  palette: Palette, strength: number,
) {
  const layers = palette.waves.length;
  for (let i = 0; i < layers; i++) {
    const depth = i / (layers - 1);
    const base = height * (0.62 + depth * 0.1 - 0.04 * breath * strength);
    const amp = height * 0.035 * strength * (1 + 0.8 * energy) * (0.7 + depth * 0.6);
    const k1 = (Math.PI * 2) / (width * (0.9 + depth * 0.5));
    const k2 = k1 * 2.3;
    const phase = t * (0.18 + depth * 0.07) + i * 1.7;

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 8; x += 8) {
      const y = base + Math.sin(x * k1 + phase) * amp + Math.sin(x * k2 - phase * 1.4) * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, base - amp, 0, height);
    // Translucent layers: where they overlap the colour deepens rather than washing out.
    fill.addColorStop(0, withAlpha(palette.waves[i], 0.34 * strength + 0.06));
    fill.addColorStop(1, withAlpha(palette.waves[i], 0.04));
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

function drawOrb(
  ctx: CanvasRenderingContext2D, width: number, height: number, minSide: number, t: number, breath: number,
  energy: number, palette: Palette, breathSeconds: number,
) {
  const cx = width / 2;
  const cy = height * 0.42;
  const r = minSide * (0.13 + 0.07 * breath) * (1 + 0.04 * energy);

  // Rings released once per breath, expanding and fading.
  const cycle = Math.max(4, breathSeconds);
  for (let n = 0; n < 4; n++) {
    const age = (((t / cycle - n * 0.25) % 1) + 1) % 1;
    const ringR = r * (1.1 + age * 2.6);
    ctx.strokeStyle = withAlpha(palette.waves[n % palette.waves.length], 0.35 * (1 - age));
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  const orb = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 1.25);
  orb.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  orb.addColorStop(0.35, withAlpha(palette.glow, 0.75));
  orb.addColorStop(1, withAlpha(palette.waves[0], 0));
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawAurora(
  ctx: CanvasRenderingContext2D, width: number, height: number, t: number, breath: number, energy: number,
  palette: Palette,
) {
  ctx.lineCap = 'round';
  palette.waves.forEach((color, i) => {
    const baseY = height * (0.22 + i * 0.07);
    const amp = height * (0.05 + 0.02 * breath) * (1 + 0.5 * energy);
    const phase = t * (0.1 + i * 0.03) + i * 2.1;
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = withAlpha(color, [0.08, 0.13, 0.3][pass]);
      ctx.lineWidth = [height * 0.12, height * 0.06, height * 0.012][pass];
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 12) {
        const y = baseY + Math.sin(x * 0.0035 + phase) * amp + Math.sin(x * 0.009 - phase * 0.7) * amp * 0.4;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
}
