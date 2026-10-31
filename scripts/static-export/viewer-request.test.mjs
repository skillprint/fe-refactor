import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generate } from './gen-viewer-request.mjs';

// A small export: two shells beside static pages, one nested shell, one with
// two dynamic segments, and a game's own index.html under public/.
const PAGES = [
  '',
  'game/_',
  'game/_/review',
  'game/featured',
  'profile',
  'profile/_',
  'profile/stats',
  'profile/stats/_/_',
  'games/live/hextris',
];

function exportWith(pages) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'static-export-'));
  for (const page of pages) {
    fs.mkdirSync(path.join(out, page), { recursive: true });
    fs.writeFileSync(path.join(out, page, 'index.html'), '');
  }
  fs.writeFileSync(path.join(out, 'opengraph-image'), '');
  fs.writeFileSync(path.join(out, 'games', 'live', 'hextris', 'LICENSE'), '');
  fs.mkdirSync(path.join(out, '_next', 'static'), { recursive: true });
  fs.writeFileSync(path.join(out, '_next', 'static', 'BUILD_ID'), '');
  return out;
}

const { code, shells, statics, files } = generate(exportWith(PAGES));
const handler = new Function(`${code}\nreturn handler;`)();

function request(uri, query = {}) {
  const querystring = {};
  for (const [key, value] of Object.entries(query)) {
    querystring[key] = Array.isArray(value)
      ? { value: value[0], multiValue: value.map((v) => ({ value: v })) }
      : { value };
  }
  return handler({ request: { method: 'GET', uri, querystring, headers: {} } });
}

const served = (uri, query) => request(uri, query).uri;
const location = (uri, query) => {
  const res = request(uri, query);
  assert.equal(res.statusCode, 308);
  return res.headers.location.value;
};

test('tables come from the export', () => {
  assert.deepEqual(shells, ['/profile/stats/_/_/', '/game/_/review/', '/game/_/', '/profile/_/']);
  // Only static pages a shell could match; the game's own folder is not one.
  assert.deepEqual(statics, ['/game/featured/', '/profile/stats/']);
  // Extensionless files, outside the build's own assets and the games.
  assert.deepEqual(files, ['/opengraph-image']);
});

test('a dynamic value is served its shell, page and RSC payload alike', () => {
  assert.equal(served('/game/hextris/'), '/game/_/index.html');
  assert.equal(served('/game/hextris/index.html'), '/game/_/index.html');
  assert.equal(served('/game/hextris/index.txt'), '/game/_/index.txt');
  assert.equal(served('/game/hextris/review/'), '/game/_/review/index.html');
  assert.equal(served('/profile/stats/skills/memory/index.txt'), '/profile/stats/_/_/index.txt');
});

test('a static page wins over a shell', () => {
  assert.equal(served('/game/featured/'), '/game/featured/index.html');
  assert.equal(served('/profile/stats/'), '/profile/stats/index.html');
  assert.equal(served('/profile/stats/index.txt'), '/profile/stats/index.txt');
  assert.equal(served('/'), '/index.html');
  assert.equal(served('/games/live/hextris/'), '/games/live/hextris/index.html');
});

test('files pass through', () => {
  assert.equal(served('/_next/static/chunks/main.js'), '/_next/static/chunks/main.js');
  assert.equal(served('/games/live/hextris/game.js'), '/games/live/hextris/game.js');
});

test('a file without an extension is served at its trailing-slash URL, as on Vercel', () => {
  assert.equal(location('/opengraph-image', { abc: '' }), '/opengraph-image/?abc');
  assert.equal(served('/opengraph-image/'), '/opengraph-image');
});

test('a path without its trailing slash is redirected, query kept', () => {
  assert.equal(location('/game/hextris'), '/game/hextris/');
  assert.equal(location('/start', { t: 'x%20y', utm: '1' }), '/start/?t=x%20y&utm=1');
  assert.equal(location('/games', { tag: ['a', 'b'] }), '/games/?tag=a&tag=b');
});

test('old links are redirected, query kept', () => {
  assert.equal(location('/profile/skills/memory'), '/skills/memory/');
  assert.equal(location('/profile/skills/memory/', { x: '1' }), '/skills/memory/?x=1');
});

test('an unknown path is left for the 404 page', () => {
  assert.equal(served('/nope/'), '/nope/index.html');
  assert.equal(served('/game/hextris/nope/'), '/game/hextris/nope/index.html');
});
