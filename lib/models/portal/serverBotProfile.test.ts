import { test } from 'node:test';
import assert from 'node:assert/strict';
import { botDisplayName, botProfilePath, fetchBotProfile, isBotPlayerId } from './serverBotProfile';
import { generateMockProfileAggregate } from './ProfileAggregate';
import { generateMockPaginatedSession } from './PaginatedSession';

process.env.NEXT_PUBLIC_API_KEY = 'partner-key';

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/** A backend that knows `known` player ids, recording every call. */
function fakeBackend(known: Record<string, string>, opts: { failSessions?: boolean } = {}) {
  const calls: Call[] = [];
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const headers = (init.headers ?? {}) as Record<string, string>;
    calls.push({ url, method: init.method ?? 'GET', headers, body: init.body as string | undefined });

    if (url.endsWith('/partners/api/users/auth/token/')) {
      const { internalId } = JSON.parse(String(init.body));
      return known[internalId] ? json(200, { token: known[internalId] }) : json(404, { detail: 'Not found.' });
    }
    if (url.endsWith('/api/portal/profile/')) return json(200, generateMockProfileAggregate());
    if (url.includes('/api/portal/sessions/')) {
      return opts.failSessions ? json(500, {}) : json(200, generateMockPaginatedSession());
    }
    return json(404, {});
  }) as typeof fetch;

  return { calls, fetchImpl };
}

test('only island-* ids are bot ids', () => {
  for (const id of ['island-ada', 'island-agent', 'island-jeremybot-ii', 'island-hana_2']) {
    assert.equal(isBotPlayerId(id), true, id);
  }
  // A human on the island keeps their own Skillprint id; guests are UUIDs.
  for (const id of ['ada', 'island-', 'Island', 'jeremy@mageduel.com', '6f1c2a5e-0b1d-4c9a-9a57-3c1e0e0e2f11', 'island-../x', 'island-a b', '', null, undefined]) {
    assert.equal(isBotPlayerId(id as string), false, String(id));
  }
});

test('the page path is predictable from the player id', () => {
  assert.equal(botProfilePath('island-ada'), '/bot/island-ada/');
  assert.equal(botProfilePath('island-agent'), '/bot/island-agent/');
});

test("a bot goes by its persona's name, not the backend's partner username", () => {
  assert.equal(botDisplayName('island-ada'), 'Ada');
  assert.equal(botDisplayName('island-jeremybot-ii'), 'Jeremybot Ii');
  assert.equal(botDisplayName('island-ada', 'partner-abc123-island-ada'), 'Ada');
  assert.equal(botDisplayName('island-ada', '  '), 'Ada');
  assert.equal(botDisplayName('island-ada', 'Ada Lovelace'), 'Ada Lovelace');
});

test("reads the bot's profile and sessions with its own token, minted with the partner key", async () => {
  const { calls, fetchImpl } = fakeBackend({ 'island-ada': 'ada-token' });
  const bot = await fetchBotProfile('island-ada', fetchImpl);

  assert.ok(bot);
  assert.equal(bot.playerId, 'island-ada');
  assert.equal(bot.profile.totals.sessions, generateMockProfileAggregate().totals.sessions);
  assert.equal(bot.sessions.length, generateMockPaginatedSession().results.length);

  const [token, ...reads] = calls;
  assert.equal(token.method, 'POST');
  assert.equal(token.headers.Authorization, 'Api-Key partner-key');
  assert.deepEqual(JSON.parse(token.body!), { internalId: 'island-ada' });
  assert.equal(reads.length, 2);
  for (const read of reads) assert.equal(read.headers.Authorization, 'Token ada-token');
});

test('an unknown bot is not found, and is never created', async () => {
  const { calls, fetchImpl } = fakeBackend({});
  assert.equal(await fetchBotProfile('island-nobody', fetchImpl), null);
  assert.ok(calls.every((c) => !c.url.includes('/users/add/')));
  assert.ok(calls.every((c) => !c.url.includes('/api/portal/')));
});

test("a human's player id is never looked up", async () => {
  const { calls, fetchImpl } = fakeBackend({ 'jeremy@mageduel.com': 'human-token' });
  assert.equal(await fetchBotProfile('jeremy@mageduel.com', fetchImpl), null);
  assert.equal(calls.length, 0);
});

test('a failed session list still shows the profile', async () => {
  const { fetchImpl } = fakeBackend({ 'island-ada': 'ada-token' }, { failSessions: true });
  const bot = await fetchBotProfile('island-ada', fetchImpl);
  assert.ok(bot);
  assert.deepEqual(bot.sessions, []);
});
