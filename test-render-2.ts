import { gameDetails } from './app/config/gameConfig';

const gameSlug = 'line-color';
const game = gameDetails[gameSlug];
const allGames = Object.entries(gameDetails).map(([slug, details]) => ({ slug, ...details }));
const moreLikeThis = allGames.filter(g => 
  g.slug !== gameSlug && 
  g.skills && game.skills && 
  g.skills.some((s: any) => game.skills.includes(s))
).slice(0, 5);

moreLikeThis.forEach(g => {
  if (g.skills) {
    g.skills.forEach(s => {
      console.log(`typeof s: ${typeof s}, s: ${JSON.stringify(s)}`);
    });
  }
});
