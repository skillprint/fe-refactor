import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeParamsFromPath } from './routeParams';

test('reads each dynamic segment by position', () => {
  assert.deepEqual(routeParamsFromPath('/game/[slug]', '/game/hextris/'), { slug: 'hextris' });
  assert.deepEqual(routeParamsFromPath('/game/[slug]/review', '/game/hextris/review/'), { slug: 'hextris' });
  assert.deepEqual(
    routeParamsFromPath('/profile/stats/[type]/[slug]', '/profile/stats/skills/working-memory/'),
    { type: 'skills', slug: 'working-memory' },
  );
});

test('works with or without the trailing slash, and ignores a query', () => {
  assert.deepEqual(routeParamsFromPath('/coach/teams/[teamId]', '/coach/teams/42'), { teamId: '42' });
  assert.deepEqual(routeParamsFromPath('/coach/teams/[teamId]', '/coach/teams/42/?tab=roster'), { teamId: '42' });
});

test('leaves values encoded, as params has them', () => {
  assert.deepEqual(routeParamsFromPath('/bot/[playerId]', '/bot/island-ada%2Bbeta/'), { playerId: 'island-ada%2Bbeta' });
  assert.deepEqual(routeParamsFromPath('/skills/[slug]', '/skills/caf%C3%A9/'), { slug: 'caf%C3%A9' });
});

test('a missing value is empty', () => {
  assert.deepEqual(routeParamsFromPath('/game/[slug]', '/game/'), { slug: '' });
});
