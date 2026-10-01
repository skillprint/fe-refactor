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
