import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaForPath, parseCoachMocks } from './mockAreas';

// Run with: npx tsx --test lib/models/coach/mockAreas.test.ts

const areas = (set: ReadonlySet<string>) => [...set].sort().join(',');
const ALL = 'auth,playbooks,reads';

test('unset mocks everything outside production and nothing in it', () => {
  assert.equal(areas(parseCoachMocks(undefined, 'development')), ALL);
  assert.equal(areas(parseCoachMocks(undefined, 'production')), '');
  assert.equal(areas(parseCoachMocks('   ', 'production')), '');
});

test('true/all and false/none behave as before the split', () => {
  assert.equal(areas(parseCoachMocks('true', 'production')), ALL);
  assert.equal(areas(parseCoachMocks('ALL', 'production')), ALL);
  assert.equal(areas(parseCoachMocks('false', 'development')), '');
  assert.equal(areas(parseCoachMocks('none', 'development')), '');
});

test('an area list mocks exactly those areas, ignoring typos', () => {
  assert.equal(areas(parseCoachMocks('playbooks', 'production')), 'playbooks');
  assert.equal(areas(parseCoachMocks(' playbooks , readz ', 'production')), 'playbooks');
  assert.equal(areas(parseCoachMocks('reads,playbooks', 'production')), 'playbooks,reads');
});

test('mocking sign-in mocks everything — a mock token authenticates nothing live', () => {
  assert.equal(areas(parseCoachMocks('auth', 'production')), ALL);
  assert.equal(areas(parseCoachMocks('playbooks,auth', 'production')), ALL);
});

test('paths map to the area whose endpoints serve them', () => {
  for (const path of ['/auth/set-password/', '/auth/forgot-password/']) {
    assert.equal(areaForPath(path), 'auth', path);
  }
  for (const path of ['/playbooks/', '/playbooks/pb-1/', '/playbooks/?status=draft', '/assignments/', '/assignments/as-1/remind/', '/catalogue/']) {
    assert.equal(areaForPath(path), 'playbooks', path);
  }
  for (const path of ['/context/', '/teams/', '/teams/1/roster/?days=30', '/players/4821/', '/players/4821/sessions/?limit=25', '/invites/']) {
    assert.equal(areaForPath(path), 'reads', path);
  }
});
