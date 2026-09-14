import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseSlug, resolveCatalogGame, dedupeByBaseSlug } from './gameSlug';

// Every publicly listed slug on staging, 2026-09-14.
const STAGING_SLUGS: Record<string, string> = {
  '0hh1-e28b593f-4355-4b9e-8444-6f9e04ca1846': '0hh1',
  '2048': '2048',
  'box-tower-befd1b5c-b07f-4463-8137-fadfdb6fc8de': 'box-tower',
  'brick-out-54e74305-8000-4605-b6b7-cf9412dd285b': 'brick-out',
  'change-word-0bc38905-8138-43f2-9ff5-a01a5f038782': 'change-word',
  'flappy-bird-1': 'flappy-bird-1',
  'fruit-ninja': 'fruit-ninja',
  'gems-of-hanoi-0403925f-1ccc-49fb-9c6d-027bd770da50': 'gems-of-hanoi',
  'gummy-blocks-018b6d5d-9048-40aa-b79a-b7e4435ddb9a': 'gummy-blocks',
  'hextris': 'hextris',
  'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178': 'hextris',
  'infinite-runner-3d': 'infinite-runner-3d',
  'lastwar-frontline': 'lastwar-frontline',
  'line-color': 'line-color',
  'mage-duel': 'mage-duel',
  'match-doodle-2-6697ba5a-8a64-42f6-adbd-6546dc65583': 'match-doodle-2',
  'natural-bridges': 'natural-bridges',
  'photo-hunt-a9cba04f-8ccb-41e8-9569-af32e6bb2653': 'photo-hunt',
  'plastoblasto': 'plastoblasto',
  'snake-attack-3b730898-fe67-4e51-a655-57c81bd3efbc': 'snake-attack',
  'space-adventure-pinball-fff717d3-9edc-4534-a4a2-9b': 'space-adventure-pinball',
  'sumagi-2-dbdafb8b-be06-4d5b-adc7-0868c2ecfaaf': 'sumagi-2',
  'ultimate-sudoku-c5f5177d-6a3e-43f6-b2d2-6a7a78c88e': 'ultimate-sudoku',
  'whack-em-all-b32fb0b4-2558-4b45-bad7-f419733bdb3a': 'whack-em-all',
};

test('baseSlug strips full and truncated UUID suffixes for every staging slug', () => {
  for (const [slug, expected] of Object.entries(STAGING_SLUGS)) {
    assert.equal(baseSlug(slug), expected, slug);
  }
});

test('baseSlug normalises case, spaces and legacy aliases, and leaves ordinary suffixes alone', () => {
  assert.equal(baseSlug('Space Trip'), 'space-trip');
  assert.equal(baseSlug('space-trip-ce24666e-4467-4a25-8658-0f86a0fdcb20'), 'space-trip');
  assert.equal(baseSlug('0h-h1'), '0hh1');
  assert.equal(baseSlug('flapcat-steampunk-2'), 'flapcat-steampunk-2');
  assert.equal(baseSlug('sudoku-20240101'), 'sudoku-20240101');
  assert.equal(baseSlug(''), '');
});

const CATALOG = [
  { slug: 'hextris', url: null },
  { slug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178', url: 'https://cdn/hextris/index.html' },
  { slug: '2048', url: 'https://cdn/2048/index.html' },
  { slug: 'mage-duel', url: null },
  { slug: 'gummy-blocks-018b6d5d-9048-40aa-b79a-b7e4435ddb9a', url: '' , external_web_url: 'https://cdn/gummy' },
];

test('resolveCatalogGame prefers the playable record over a bare placeholder', () => {
  assert.equal(resolveCatalogGame('hextris', CATALOG)?.slug, 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178');
  assert.equal(resolveCatalogGame('hextris-475aff99-6346-4ea4-b432-dc8aa51f2178', CATALOG)?.slug, 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178');
  assert.equal(resolveCatalogGame('HEXTRIS', CATALOG)?.slug, 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178');
});

test('resolveCatalogGame maps bare local slugs to legacy suffixed records', () => {
  assert.equal(resolveCatalogGame('gummy-blocks', CATALOG)?.slug, 'gummy-blocks-018b6d5d-9048-40aa-b79a-b7e4435ddb9a');
  assert.equal(resolveCatalogGame('2048', CATALOG)?.slug, '2048');
  assert.equal(resolveCatalogGame('mage-duel', CATALOG)?.slug, 'mage-duel');
});

test('resolveCatalogGame returns null for unknown games instead of a fallback', () => {
  assert.equal(resolveCatalogGame('does-not-exist', CATALOG), null);
  assert.equal(resolveCatalogGame('', CATALOG), null);
});

test('dedupeByBaseSlug keeps one record per game, preferring the canonical one, in first-seen order', () => {
  const out = dedupeByBaseSlug(CATALOG);
  assert.deepEqual(out.map((g) => g.slug), [
    'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178',
    '2048',
    'mage-duel',
    'gummy-blocks-018b6d5d-9048-40aa-b79a-b7e4435ddb9a',
  ]);
  // Records without a url still dedupe: the suffixed one wins.
  const recs = dedupeByBaseSlug([{ slug: 'hextris' }, { slug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178' }]);
  assert.deepEqual(recs.map((g) => g.slug), ['hextris-475aff99-6346-4ea4-b432-dc8aa51f2178']);
});
