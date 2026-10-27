/**
 * `GET /api/portal/home/highlights/?days=7&limit=6` — the games people are
 * playing lately, most played first, one entry per game (marketplace #149).
 * camelCase on the wire.
 *
 * `topScore` is the best game score set in the window — points, as the game
 * reported them, on no fixed scale — anonymised to whether it is the
 * viewer's; null when nothing in the window reported a score. `yourBest` is
 * the viewer's own best in the window, null without one.
 */
export interface HighlightGameRef {
  id: number;
  slug: string;
  name: string;
  thumbnail: string | null;
}

export interface HighlightTopScore {
  score: number;
  /** When the score was first reached. */
  achievedAt: string;
  isYou: boolean;
}

export interface HomeHighlightGame {
  game: HighlightGameRef;
  /** Plays in the window, guests included. */
  plays: number;
  /** Distinct signed-in players behind those plays. */
  players: number;
  topScore: HighlightTopScore | null;
  yourBest: number | null;
}

export interface HomeHighlights {
  periodDays: number;
  games: HomeHighlightGame[];
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Four busy games: one with the viewer's own top score, one nobody has scored on. */
export const generateMockHomeHighlights = (): HomeHighlights => ({
  periodDays: 7,
  games: [
    {
      game: { id: 42, slug: 'hextris', name: 'Hextris', thumbnail: null },
      plays: 42, players: 17,
      topScore: { score: 4820, achievedAt: daysAgo(1), isYou: false },
      yourBest: 3990,
    },
    {
      game: { id: 7, slug: '0hh1', name: '0hh1', thumbnail: null },
      plays: 31, players: 12,
      topScore: { score: 980, achievedAt: daysAgo(2), isYou: true },
      yourBest: 980,
    },
    {
      game: { id: 9, slug: 'fruit-boom', name: 'Fruit Boom', thumbnail: null },
      plays: 18, players: 9,
      topScore: { score: 2150, achievedAt: daysAgo(3), isYou: false },
      yourBest: null,
    },
    {
      game: { id: 11, slug: 'simon-says', name: 'Simon Says', thumbnail: null },
      plays: 9, players: 4,
      topScore: null,
      yourBest: null,
    },
  ],
});
