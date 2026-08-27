import { gameDetails } from './app/config/gameConfig';

const gameSlug = 'line-color';
const game = gameDetails[gameSlug];
const allGames = Object.entries(gameDetails).map(([slug, details]) => ({ slug, ...details }));
const moreLikeThis = allGames.filter(g => 
  g.slug !== gameSlug && 
  g.skills && game.skills && 
  g.skills.some((s: string) => game.skills.includes(s))
).slice(0, 5);

for (const g of moreLikeThis) {
  const mappedSkills = g.skills ? g.skills.map((s: any) => ({ id: s, name: s, dimension: 'cognition' })) : [];
  console.log(`Game: ${g.slug}, skills:`, mappedSkills);
}
