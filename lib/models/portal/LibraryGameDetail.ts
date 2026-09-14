/**
 * `GET /api/portal/library/games/{slug}/` (SKI-179). camelCase on the wire.
 * Any slug form (bare, legacy-suffixed, truncated, placeholder) resolves to the
 * canonical record; an unknown game is a 404.
 */
import type { LibraryGame } from './LibraryGame';

export interface LibraryTag {
  slug: string;
  name: string;
}

export interface LibraryGameDetail extends Omit<LibraryGame, 'skills' | 'moods'> {
  longDescription: string;
  skills: LibraryTag[];
  moods: LibraryTag[];
}

export const generateMockLibraryGameDetail = (): LibraryGameDetail => ({
  id: 42,
  name: "Hextris",
  slug: "hextris-475aff99-6346-4ea4-b432-dc8aa51f2178",
  baseSlug: "hextris",
  shortDescription: "A fast-paced puzzle game",
  longDescription: "Hextris challenges players to rotate a hexagon and match falling blocks by colour before they stack past the edge.",
  thumbnail: null,
  screenshot: "https://cdn.example.com/static/images/Hextris.png",
  suggestedDurationSeconds: 180,
  orientation: "portrait",
  url: "https://cdn.example.com/media/hextris/index.html",
  isActive: true,
  isPlayableInPwa: true,
  isPubliclyListed: true,
  genres: ["Hyper-Casual", "Arcade"],
  category: "Hyper-Casual",
  difficulty: null,
  instructions: "Rotate the hexagon with the arrow keys so each falling block lands on a matching colour. Three in a row clears them.",
  skills: [{ slug: "attention", name: "Attention" }, { slug: "pattern-matching", name: "Pattern Matching" }],
  moods: [{ slug: "focus", name: "Focus" }]
});
