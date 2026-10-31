import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameBuildUrl, gameParameterManifestUrl, isPlayableGame } from './localGames';

test('a record whose URL is on the games CDN plays from there, with no map entry needed', () => {
  const page = 'https://games.skillprint.co/live/Brand%20New%20Game/static/index.html';
  assert.equal(gameBuildUrl({ slug: 'brand-new-game', externalWebUrl: page }), page);
  assert.equal(gameBuildUrl({ slug: 'brand-new-game', url: page }), page);
  assert.equal(isPlayableGame({ slug: 'brand-new-game', url: 'https://games.staging.skillprint.co/live/X/static/index.html' }), true);
});

test('a record without a games CDN URL is not playable here, whatever its slug', () => {
  const legacyS3 = 'https://skillprint-games-production.s3.us-west-2.amazonaws.com/475aff99-6346-4ea4-b432-dc8aa51f2178/index.html';
  assert.equal(isPlayableGame({ slug: 'natural-bridges', externalWebUrl: 'https://i.simmer.io/@someone/game' }), false);
  assert.equal(isPlayableGame({ slug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178', externalWebUrl: legacyS3 }), false);
  assert.equal(isPlayableGame({ slug: 'hextris' }), false);
  assert.equal(gameBuildUrl(null), null);
});

test('the parameter manifest sits beside the game page', () => {
  assert.equal(
    gameParameterManifestUrl('https://games.skillprint.co/live/Market%20Day/static/index.html'),
    'https://games.skillprint.co/live/Market%20Day/backend/game-scoring-config.json',
  );
});
