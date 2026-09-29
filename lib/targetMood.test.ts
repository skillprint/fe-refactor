import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseTargetMood, isMoodSlug } from './targetMood';

test('uses the requested mood when the game carries it', () => {
  assert.equal(chooseTargetMood('relax', ['relax', 'focus']), 'relax');
  assert.equal(chooseTargetMood('Grit', ['focus', 'grit']), 'grit');
});

test('falls back to focus when the requested mood is not on the game', () => {
  assert.equal(chooseTargetMood('relax', ['focus', 'grit']), 'focus');
});

test("falls back to the game's first mood when it has no focus", () => {
  // Staging, 2026-09-29: gummy-blocks is relax-only and change-word creativity-only.
  // Sending focus for them was rejected, so no session was ever recorded.
  assert.equal(chooseTargetMood(null, ['relax']), 'relax');
  assert.equal(chooseTargetMood('focus', ['creativity']), 'creativity');
});

test('reads catalog mood objects as well as slugs', () => {
  // The catalog API sends { slug, name } objects.
  assert.equal(chooseTargetMood(null, [{ slug: 'relax' }]), 'relax');
  assert.equal(chooseTargetMood('grit', [{ slug: 'focus' }, { slug: 'grit' }]), 'grit');
  assert.equal(chooseTargetMood(null, [{ slug: null }, null, 'focus']), 'focus');
});

test('passes the request or focus through when the catalog lists no moods', () => {
  assert.equal(chooseTargetMood('relax', []), 'relax');
  assert.equal(chooseTargetMood(undefined, undefined), 'focus');
});

test('ignores values that are not moods', () => {
  assert.equal(chooseTargetMood('energize', ['relax', 'focus']), 'focus');
  assert.equal(chooseTargetMood('energize', []), 'focus');
  assert.equal(chooseTargetMood(null, ['energize', 'relax']), 'relax');
  assert.equal(isMoodSlug('energize'), false);
});
