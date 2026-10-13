import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BreathPacer, changeSince, cycleForRate, MAX_CYCLE_S, MIN_CYCLE_S, pickHeartRate, WATCH_FRESH_MS } from './biofeedback';

test('cycle length follows the rate, clamped to a comfortable range', () => {
  assert.equal(cycleForRate(6), 10);
  assert.equal(cycleForRate(60), MIN_CYCLE_S);
  assert.equal(cycleForRate(1), MAX_CYCLE_S);
});

test('the pacer starts at the measured rate and eases toward the target without jumps', () => {
  const pacer = new BreathPacer(6);
  pacer.observe(15); // 4 s breaths
  assert.equal(pacer.cycle, 4);
  const cycles = Array.from({ length: 40 }, () => pacer.nextBreath());
  for (let i = 1; i < cycles.length; i++) {
    assert.ok(cycles[i] >= cycles[i - 1], 'never speeds back up');
    assert.ok(cycles[i] - cycles[i - 1] <= 0.6 + 1e-9, 'never more than 0.6 s longer per breath');
  }
  assert.equal(cycles.at(-1), 10);
  assert.equal(pacer.perMin, 6);
});

test('once guiding, new readings do not re-anchor the pacer', () => {
  const pacer = new BreathPacer(6);
  pacer.observe(12);
  pacer.nextBreath();
  const before = pacer.cycle;
  pacer.observe(20);
  assert.equal(pacer.cycle, before);
});

test('without a reading the pacer simply breathes at the target', () => {
  const pacer = new BreathPacer(5);
  pacer.observe(null);
  assert.equal(pacer.cycle, 12);
  assert.equal(pacer.nextBreath(), 12);
});

test('a fresh watch reading wins over the camera; a stale one does not', () => {
  const now = 1_000_000;
  assert.deepEqual(pickHeartRate({ bpm: 61, sampledAt: now - 2000 }, 66, now), { bpm: 61, source: 'watch' });
  assert.deepEqual(pickHeartRate({ bpm: 61, sampledAt: now - WATCH_FRESH_MS - 1 }, 66, now), { bpm: 66, source: 'camera' });
  assert.deepEqual(pickHeartRate(null, 66, now), { bpm: 66, source: 'camera' });
  assert.equal(pickHeartRate({ bpm: null, sampledAt: null }, null, now), null);
});

test('change since the first reading', () => {
  assert.equal(changeSince(72, 64.6), -7);
  assert.equal(changeSince(null, 64), null);
});
