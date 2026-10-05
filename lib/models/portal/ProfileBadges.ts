/** `GET /api/portal/profile/badges/` (SKI-130) — a portal-shaped read over Talent / UserTalent. */
export interface ProfileBadge {
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
  unlockThreshold: number;
  earnedAt: string;
  /** null when the awarding session has since been deleted. */
  gameSlug: string | null;
  gameName: string | null;
  reason: string;
  points: number;
  /** false until the post-session celebration has acknowledged it. */
  seen: boolean;
}

export interface ProfileBadgesResponse {
  totalUnlocked: number;
  totalBadges: number;
  totalPoints: number;
  badges: ProfileBadge[];
}

export const generateMockProfileBadges = (): ProfileBadgesResponse => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  return {
    totalUnlocked: 3,
    totalBadges: 22,
    totalPoints: 65,
    badges: [
      {
        number: 9, name: 'Pattern Matching', slug: 'pattern-matching', category: 'Mental Agility',
        description: 'Spotting the repeat before it repeats.', animalName: 'Copycat Cuttlefish', animalSpecies: 'Cuttlefish',
        animalFunFact: 'Cuttlefish can change colour in under a second.', skillSlug: 'pattern-matching', unlockThreshold: 0.6,
        earnedAt: today.toISOString(), gameSlug: 'hextris', gameName: 'Hextris',
        reason: 'Reached 72% mastery in Pattern Matching', points: 20, seen: false,
      },
      {
        number: 16, name: 'Planning', slug: 'planning', category: 'Executive Function',
        description: 'Thinking several moves ahead.', animalName: 'Gameplan Gorilla', animalSpecies: 'Gorilla',
        animalFunFact: 'Gorillas build a new nest every night.', skillSlug: 'planning', unlockThreshold: 0.6,
        earnedAt: twoDaysAgo.toISOString(), gameSlug: 'box-tower', gameName: 'Box Tower',
        reason: 'Reached 65% mastery in Planning', points: 30, seen: true,
      },
      {
        number: 4, name: 'Organizing', slug: 'organizing', category: 'Executive Function',
        description: 'Grouping before placing.', animalName: 'Building Beaver', animalSpecies: 'Beaver',
        animalFunFact: 'Beaver teeth never stop growing.', skillSlug: 'planning', unlockThreshold: 0.6,
        earnedAt: fiveDaysAgo.toISOString(), gameSlug: 'gummy-blocks', gameName: 'Gummy Blocks',
        reason: 'Reached 61% mastery in Organizing', points: 15, seen: true,
      },
    ],
  };
};
