// The mood a game session optimises for. The backend rejects a session whose
// target mood is not one of the game's catalog moods, so the choice has to be
// made against that list, not assumed.

export const MOOD_SLUGS = [
  'relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe',
] as const;

export type MoodSlug = (typeof MOOD_SLUGS)[number];

const DEFAULT_MOOD: MoodSlug = 'focus';

export function isMoodSlug(value: unknown): value is MoodSlug {
  return typeof value === 'string' && (MOOD_SLUGS as readonly string[]).includes(value);
}

/** A catalog mood: the catalog API sends `{ slug, name }` objects; plain slugs are accepted too. */
export type CatalogMood = string | { slug?: string | null } | null | undefined;

/**
 * Pick the session's target mood.
 *
 * 1. The mood the caller asked for (`?mood=` from a routine or the benchmark),
 *    when the game carries it.
 * 2. Otherwise `focus`, when the game carries it.
 * 3. Otherwise the game's first catalog mood.
 *
 * With no catalog moods (a game the catalog doesn't know), the request or
 * `focus` is passed through and the backend decides.
 */
export function chooseTargetMood(requested: string | null | undefined, gameMoods: readonly CatalogMood[] | null | undefined): MoodSlug {
  const wanted = typeof requested === 'string' ? requested.trim().toLowerCase() : '';
  const moods = (gameMoods || [])
    .map((m) => (typeof m === 'string' ? m : m?.slug || ''))
    .map((m) => m.toLowerCase())
    .filter(isMoodSlug);

  if (moods.length === 0) return isMoodSlug(wanted) ? wanted : DEFAULT_MOOD;
  if (isMoodSlug(wanted) && moods.includes(wanted)) return wanted;
  if (moods.includes(DEFAULT_MOOD)) return DEFAULT_MOOD;
  return moods[0];
}
