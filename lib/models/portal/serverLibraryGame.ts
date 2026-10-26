import { getApiBaseUrl } from '../../../app/utils/cookieUtils';
import { PRODUCTION_SITE_URL } from '../../siteUrl';
import type { LibraryGameDetail } from './LibraryGameDetail';

/**
 * One library game, fetched on the server (page metadata, preview images).
 *
 * The endpoint is public for the portal's origin, so the server presents the
 * production origin: it is this very app asking. Results are cached for a
 * while; a game's name and artwork rarely change.
 */
export async function fetchLibraryGame(slug: string): Promise<LibraryGameDetail | null> {
  if (!slug) return null;
  try {
    const res = await fetch(`${getApiBaseUrl()}api/portal/library/games/${encodeURIComponent(slug)}/`, {
      headers: { Accept: 'application/json', Origin: PRODUCTION_SITE_URL },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as LibraryGameDetail;
  } catch (err) {
    console.error('[share] library game fetch failed:', err);
    return null;
  }
}

/** The best artwork a record has, if any. */
export function libraryGameImage(game: Pick<LibraryGameDetail, 'screenshot' | 'thumbnail'>): string | null {
  return game.screenshot || game.thumbnail || null;
}
