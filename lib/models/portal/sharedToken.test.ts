import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forgetToken, holdToken, sharedToken } from './sharedToken';

test('concurrent callers for one identity share a single request', async () => {
  forgetToken();
  let calls = 0;
  const create = () => {
    calls += 1;
    return Promise.resolve('guest-token');
  };
  const [a, b] = await Promise.all([sharedToken('guest:1', create), sharedToken('guest:1', create)]);
  assert.equal(calls, 1);
  assert.equal(a, 'guest-token');
  assert.equal(b, 'guest-token');
});

test("a guest never inherits the player's token after the player leaves", async () => {
  forgetToken();
  holdToken('player:42', 'player-token');
  assert.equal(await sharedToken('player:42', () => Promise.resolve('unused')), 'player-token');

  // Signed out without a reload: the next resolution is a guest.
  const token = await sharedToken('guest:new-uuid', () => Promise.resolve('fresh-guest-token'));
  assert.equal(token, 'fresh-guest-token');
});

test('forgetting a failed request lets the same identity retry', async () => {
  forgetToken();
  let calls = 0;
  const create = () => {
    calls += 1;
    return Promise.resolve(calls === 1 ? null : 'second-try');
  };
  assert.equal(await sharedToken('guest:1', create), null);
  forgetToken('guest:1');
  assert.equal(await sharedToken('guest:1', create), 'second-try');
  assert.equal(calls, 2);
});

test('forgetting another identity leaves the held one alone', async () => {
  forgetToken();
  holdToken('player:42', 'player-token');
  forgetToken('guest:1');
  assert.equal(await sharedToken('player:42', () => Promise.resolve('unused')), 'player-token');
});
