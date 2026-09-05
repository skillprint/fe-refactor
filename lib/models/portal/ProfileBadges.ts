export interface ProfileBadge {
  slug: string;
  name: string;
  skill: string;
  art: string;
  game_slug: string;
  gameTitle: string;
  gameArt: string;
  reason: string;
  unlocked_at: string;
  points: number;
}

export const generateMockProfileBadges = (): ProfileBadge[] => {
  const today = new Date();
  
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);

  return [
    {
      slug: 'cuttlefish',
      name: 'Copycat Cuttlefish',
      skill: 'Pattern Matching',
      art: '/assets/images/badges/collection/cuttlefish/cuttlefish-badge-cool-green-gear.svg',
      game_slug: 'hextris',
      gameTitle: 'Hextris',
      gameArt: '/assets/images/games/game-hextris.svg',
      reason: 'You kept clearing sets while the outer ring was closing in, and your accuracy never dropped with the pace.',
      unlocked_at: today.toISOString(),
      points: 20
    },
    {
      slug: 'gorilla',
      name: 'Gameplan Gorilla',
      skill: 'Planning',
      art: '/assets/images/badges/collection/gorilla/gorilla-badge-skills-pink-star.svg',
      game_slug: 'box-tower',
      gameTitle: 'Box Tower',
      gameArt: '/assets/images/games/game-box-tower.svg',
      reason: 'Every block placed where the next one could still land. The tower held because the plan did.',
      unlocked_at: twoDaysAgo.toISOString(),
      points: 30
    },
    {
      slug: 'beaver',
      name: 'Building Beaver',
      skill: 'Organizing',
      art: '/assets/images/badges/collection/beaver/beaver-badge-mindset-violet-flower.svg',
      game_slug: 'gummy-blocks',
      gameTitle: 'Gummy Blocks',
      gameArt: '/assets/images/games/game-gummy-blocks.svg',
      reason: 'You cleared the board by grouping before placing, and never boxed yourself into a corner.',
      unlocked_at: fiveDaysAgo.toISOString(),
      points: 15
    }
  ];
};
