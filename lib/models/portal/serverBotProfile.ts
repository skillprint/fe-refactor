import { getApiBaseUrl } from '../../../app/utils/cookieUtils';
import { titleFromSlug } from '../../skillIcons';
import type { ProfileAggregate } from './ProfileAggregate';
import type { PaginatedSession, SessionSummaryItem } from './PaginatedSession';

/**
 * A bot's profile: an AI agent from LLM Island, which plays under a partner
 * player id like any game integration's player and is scored the same way.
 *
 * The island names its agents `island-<persona>` (`island-ada`, and
 * `island-agent` for its default bot); a human playing on the island keeps
 * their own Skillprint id. So the prefix is what makes a player id a bot's,
 * and only those ids get a public page: a human's profile stays behind their
 * own session.
 *
 * The bot's token is minted here, on the server, with the partner key, and
 * never reaches the browser; the page gets the portal payloads it reads.
 * Nothing here creates a player: an id the backend does not know is a 404,
 * not a new account.
 */

export const BOT_PLAYER_PREFIX = 'island-';

/** Partner ids the island writes: the prefix, then a persona id. */
const BOT_PLAYER_ID = /^island-[a-z0-9][a-z0-9_-]{0,63}$/i;

export function isBotPlayerId(playerId: string | null | undefined): playerId is string {
  return typeof playerId === 'string' && BOT_PLAYER_ID.test(playerId);
}

/** The public page for a bot. LLM Island links here from its character cards. */
export function botProfilePath(playerId: string): string {
  return `/bot/${encodeURIComponent(playerId)}/`;
}

/**
 * The name a bot goes by. The backend has no first name for a partner player
 * and substitutes the internal username (`partner-<org>-<id>`, SKI-188), so
 * the persona id in the player id is the better name: `island-ada` is "Ada".
 */
export function botDisplayName(playerId: string, firstName?: string | null): string {
  const name = (firstName ?? '').trim();
  if (name && !/^partner-[a-z0-9]+-/i.test(name)) return name;
  return titleFromSlug(playerId.slice(BOT_PLAYER_PREFIX.length).replace(/_/g, '-')) || 'Bot';
}

export interface BotProfile {
  playerId: string;
  name: string;
  /** `GET /api/portal/profile/` as the bot. */
  profile: ProfileAggregate;
  /** `GET /api/portal/sessions/?limit=50` as the bot, newest first. */
  sessions: SessionSummaryItem[];
}

type Fetch = typeof fetch;

function partnerKey(): string {
  return process.env.SKILLPRINT_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
}

/**
 * The bot's token from the partner key, or null when the backend does not
 * know the id (or the key is missing). Only the read: no `users/add/`.
 */
export async function fetchBotToken(playerId: string, fetchImpl: Fetch = fetch): Promise<string | null> {
  const key = partnerKey();
  if (!key) return null;
  try {
    const res = await fetchImpl(`${getApiBaseUrl()}partners/api/users/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Api-Key ${key}` },
      body: JSON.stringify({ internalId: playerId }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.token === 'string' && json.token ? json.token : null;
  } catch (err) {
    console.error('[bot] token fetch failed:', err);
    return null;
  }
}

async function readAsBot<T>(path: string, token: string, fetchImpl: Fetch): Promise<T | null> {
  try {
    const res = await fetchImpl(`${getApiBaseUrl()}api/portal${path}`, {
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[bot] ${path} fetch failed:`, err);
    return null;
  }
}

/**
 * Everything the bot page shows, or null for an id that is not a bot's or
 * that the backend does not know. The lifetime profile is required; the
 * session list degrades to empty.
 */
export async function fetchBotProfile(playerId: string, fetchImpl: Fetch = fetch): Promise<BotProfile | null> {
  if (!isBotPlayerId(playerId)) return null;
  const token = await fetchBotToken(playerId, fetchImpl);
  if (!token) return null;

  const [profile, sessions] = await Promise.all([
    readAsBot<ProfileAggregate>('/profile/', token, fetchImpl),
    readAsBot<PaginatedSession>('/sessions/?limit=50', token, fetchImpl),
  ]);
  if (!profile) return null;

  return {
    playerId,
    name: botDisplayName(playerId, profile.user?.firstName),
    profile,
    sessions: sessions?.results ?? [],
  };
}
