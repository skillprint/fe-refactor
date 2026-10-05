import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playerLabel } from './playerLabel';

test('uses the display name when there is one', () => {
  assert.equal(playerLabel({ userId: 7, displayName: 'Ada L.' }), 'Ada L.');
});

test('falls back to the id for a missing, null or blank name', () => {
  assert.equal(playerLabel({ userId: 7 }), 'Player 7');
  assert.equal(playerLabel({ userId: 7, displayName: null }), 'Player 7');
  assert.equal(playerLabel({ userId: 7, displayName: '   ' }), 'Player 7');
});
