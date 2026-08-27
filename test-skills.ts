import { gameDetails } from './app/config/gameConfig';
for (const [slug, details] of Object.entries(gameDetails)) {
  if (details.skills && typeof details.skills[0] !== 'string') {
    console.log(`Game ${slug} has non-string skills:`, details.skills);
  }
}
