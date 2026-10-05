/**
 * `GET /api/portal/library/games/{slug}/badges/` (SKI-182) — the badges
 * playing this game works toward, with the player's standing on each.
 * camelCase on the wire. Knox auth; any slug form resolves; unknown game 404.
 *
 * A badge unlocks on mastery of one skill and a game trains the skills it is
 * tagged with, so these are the active talents for the game's skills, in
 * framework order. Reading never marks a badge seen.
 */
export interface GameBadge {
  /** Framework talent number (1-22). */
  number: number;
  name: string;
  slug: string;
  category: string | null;
  description: string;
  animalName: string;
  animalSpecies: string;
  animalFunFact: string;
  skillSlug: string;
  /** Mastery (0–1) needed to unlock. */
  unlockThreshold: number;
  points: number;
  unlocked: boolean;
  earnedAt: string | null;
  /** Composite mastery on the skill (0–1); the mastery it was won at once earned. */
  masteryScore: number;
  /** 0–1 toward the threshold; 1 once earned, 0 before the skill is measured. */
  progress: number;
  /** null until earned. */
  seen: boolean | null;
}

export interface LibraryGameBadgesResponse {
  /** Canonical slug of the game the badges were looked up for. */
  gameSlug: string;
  badges: GameBadge[];
}

export const generateMockLibraryGameBadges = (): LibraryGameBadgesResponse => ({
  gameSlug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178',
  badges: [
    {
      number: 9, name: 'Pattern Matching', slug: 'pattern-matching', category: 'Mental Agility',
      description: 'Spotting the repeat before it repeats.', animalName: 'Copycat Cuttlefish', animalSpecies: 'Cuttlefish',
      animalFunFact: 'Cuttlefish can change colour in under a second.', skillSlug: 'pattern-matching', unlockThreshold: 0.6, points: 20,
      unlocked: true, earnedAt: new Date(Date.now() - 2 * 86400000).toISOString(), masteryScore: 0.72, progress: 1, seen: true,
    },
    {
      number: 16, name: 'Planning', slug: 'planning', category: 'Executive Function',
      description: 'Thinking several moves ahead.', animalName: 'Gameplan Gorilla', animalSpecies: 'Gorilla',
      animalFunFact: 'Gorillas build a new nest every night.', skillSlug: 'planning', unlockThreshold: 0.6, points: 30,
      unlocked: false, earnedAt: null, masteryScore: 0.42, progress: 0.7, seen: null,
    },
    {
      number: 3, name: 'Timing', slug: 'timing', category: 'Attention',
      description: 'Acting at the right moment.', animalName: 'Brisk Bushbaby', animalSpecies: 'Bushbaby',
      animalFunFact: 'Bushbabies can leap two metres straight up.', skillSlug: 'timing', unlockThreshold: 0.6, points: 10,
      unlocked: false, earnedAt: null, masteryScore: 0, progress: 0, seen: null,
    },
  ],
});
