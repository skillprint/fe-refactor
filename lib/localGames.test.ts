import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SLUG_TO_DIR_MAP, hasLocalGameDir, mapSlugToGamePath } from './localGames';

test('every mapped live game has a build on disk', () => {
  for (const [slug, dir] of Object.entries(SLUG_TO_DIR_MAP)) {
    const index = join(__dirname, '..', 'public', 'games', 'live', dir, 'static', 'index.html');
    assert.ok(existsSync(index), `${slug} → ${dir} has no static/index.html`);
  }
});

test('Mage Duel resolves to its 2D build', () => {
  assert.equal(mapSlugToGamePath('mage-duel'), '/games/live/mage-duel-2d/static/index.html');
});

test('catalogue games with no build are not playable here', () => {
  for (const slug of ['lastwar-frontline', 'plastoblasto', 'natural-bridges', 'line-color', 'fruit-ninja']) {
    assert.equal(hasLocalGameDir(slug), false, slug);
  }
  assert.equal(hasLocalGameDir('hextris-475aff99-6346-4ea4-b432-dc8aa51f2178'), true);
});

test('legacy -2 catalog slugs resolve to their builds (SKI-180)', () => {
  // The backend's records for these games carry a `-2` base slug.
  for (const [slug, dir] of [
    ['sumagi-2-dbdafb8b-be06-4d5b-adc7-0868c2ecfaaf', 'Sumagi'],
    ['match-doodle-2-6697ba5a-8a64-42f6-adbd-6546dc65583', 'Match Doodle'],
    ['fruit-sorting-2-778da931-ec64-4123-9aa0-2b21c7994d', 'Fruit Sorting'],
    ['sweet-memory-2-6b558e2a-cf49-4ea7-be60-2a8dda06b60', 'Sweet Memory'],
  ]) {
    assert.equal(hasLocalGameDir(slug), true, slug);
    assert.equal(mapSlugToGamePath(slug), `/games/live/${dir}/static/index.html`, slug);
  }
});
