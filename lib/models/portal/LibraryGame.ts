/**
 * `GET /api/portal/library/games/` — one record per game (SKI-179). camelCase
 * on the wire. The list is already filtered to active, PWA-playable, publicly
 * listed games and folded to one record per base slug, so a slug here is the
 * canonical one to send to the backend.
 */
export interface LibraryGame {
  id: number;
  name: string;
  /** Canonical backend slug; may carry a legacy UUID suffix. */
  slug: string;
  /** Slug without the legacy suffix; the frontend's local lookup key. */
  baseSlug: string;
  shortDescription: string;
  thumbnail: string | null;
  screenshot: string | null;
  suggestedDurationSeconds: number | null;
  orientation: string;
  /** Hosted game entry point; "" for a placeholder record. */
  url: string;
  isActive: boolean;
  isPlayableInPwa: boolean;
  isPubliclyListed: boolean;
  genres: string[];
  category: string | null;
  difficulty: string | null;
  /** How to play, as authored on the backend; "" until written. */
  instructions: string;
  /** Skill slugs (the detail carries `{slug, name}` objects instead). */
  skills: string[];
  /** Mood slugs. */
  moods: string[];
}

export const generateMockLibraryGames = (): LibraryGame[] => ([
  {
    id: 42,
    name: "Hextris",
    slug: "hextris-475aff99-6346-4ea4-b432-dc8aa51f2178",
    baseSlug: "hextris",
    shortDescription: "A fast-paced hexagonal puzzle game",
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
    instructions: "",
    skills: ["attention", "pattern-matching"],
    moods: ["focus", "grit"]
  }
]);
