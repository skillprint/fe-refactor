/**
 * Canonical game slug helpers (SKI-180).
 *
 * The backend catalog mixes two slug schemes: bare (`hextris`, `2048`) and
 * legacy UUID-suffixed (`hextris-475aff99-6346-4ea4-b432-dc8aa51f2178`), three
 * of which are truncated at 50 characters
 * (`space-adventure-pinball-fff717d3-9edc-4534-a4a2-9b`). `Game.slug` is unique
 * and non-editable on the backend, so the frontend derives a stable "base slug"
 * instead of waiting for a rename.
 *
 * - `baseSlug` is the pure normaliser: lowercase, spaces to hyphens, UUID
 *   suffix stripped. Use it for local lookups (config, art, directory maps) and
 *   for grouping duplicates.
 * - `resolveCatalogGame` picks the canonical backend record for any slug form.
 *   Send its `slug` to the backend (session start, catalog detail), never the
 *   URL slug.
 */

// 8 hex chars, then 1-3 groups of 1-4 hex chars, then an optional final group
// of up to 12 hex chars. The final group is optional and the middle ones may be
// short so truncated suffixes still match.
const UUID_SUFFIX = /-[0-9a-f]{8}(?:-[0-9a-f]{1,4}){1,3}(?:-[0-9a-f]{1,12})?$/;

// Legacy spellings that predate the slug rules.
const ALIASES: Record<string, string> = {
  '0h-h1': '0hh1',
};

export function baseSlug(slug: string): string {
  const normalised = (slug || '').trim().toLowerCase().replace(/\s+/g, '-').replace(UUID_SUFFIX, '');
  return ALIASES[normalised] || normalised;
}

export interface CatalogSlugRecord {
  slug: string;
  url?: string | null;
  externalWebUrl?: string | null;
  external_web_url?: string | null;
}

export function isPlayableRecord(game: CatalogSlugRecord): boolean {
  return Boolean(game.url || game.externalWebUrl || game.external_web_url);
}

/**
 * Rank candidates that share a base slug: playable first, then the legacy
 * suffixed record (the real one when a bare placeholder duplicate exists),
 * then an exact match on the requested slug.
 */
function rank(game: CatalogSlugRecord, requested: string): number {
  let score = 0;
  if (isPlayableRecord(game)) score += 4;
  if (game.slug !== baseSlug(game.slug)) score += 2;
  if (game.slug === requested) score += 1;
  return score;
}

/**
 * Resolve any slug form (bare, suffixed, truncated, URL-decoded) to the
 * canonical catalog record, or null when the catalog has no such game.
 */
export function resolveCatalogGame<T extends CatalogSlugRecord>(input: string, catalog: T[]): T | null {
  const wanted = baseSlug(input);
  if (!wanted) return null;
  let best: T | null = null;
  let bestRank = -1;
  for (const game of catalog) {
    if (!game?.slug || baseSlug(game.slug) !== wanted) continue;
    const r = rank(game, input);
    if (r > bestRank) {
      best = game;
      bestRank = r;
    }
  }
  return best;
}

/** Keep one record per base slug, preferring the canonical one. Order of first appearance is kept. */
export function dedupeByBaseSlug<T extends CatalogSlugRecord>(games: T[]): T[] {
  const order: string[] = [];
  const best = new Map<string, T>();
  for (const game of games) {
    if (!game?.slug) continue;
    const key = baseSlug(game.slug);
    const current = best.get(key);
    if (!current) {
      order.push(key);
      best.set(key, game);
    } else if (rank(game, game.slug) > rank(current, current.slug)) {
      best.set(key, game);
    }
  }
  return order.map((key) => best.get(key)!);
}
