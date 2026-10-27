import { getApiBaseUrl } from '../../../app/utils/cookieUtils';
import { PRODUCTION_SITE_URL } from '../../siteUrl';

/**
 * `GET /games/api/talents/`: the badge catalog (a badge is a Talent).
 * Public for the portal's origin, so a shared badge page can be rendered
 * for a visitor who is not signed in. camelCase on the wire.
 */
export interface Talent {
  number: number;
  name: string;
  slug: string;
  category: string | null;
  description: string;
  animalName: string;
  animalSpecies: string;
  animalFunFact: string;
  skillSlug: string;
  unlockThreshold: number;
  points: number;
}

export async function fetchTalents(): Promise<Talent[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}games/api/talents/`, {
      headers: { Accept: 'application/json', Origin: PRODUCTION_SITE_URL },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json?.results || [];
  } catch (err) {
    console.error('[share] talent catalog fetch failed:', err);
    return [];
  }
}

/** One badge by slug, or null for a slug the catalog does not know. */
export async function fetchTalent(slug: string): Promise<Talent | null> {
  if (!slug) return null;
  const talents = await fetchTalents();
  return talents.find((t) => t.slug === slug) || null;
}
