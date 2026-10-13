/**
 * The Skillprint station at ASU's ReMix the Future 2026 (MIX Center, Mesa,
 * Oct 15–18). A host sits a visitor at a PC on /asu, the visitor plays one of
 * four games for about three minutes, the results show their Skillprint, and
 * the host hands over a printed sticker that fits the game.
 *
 * Stickers are physical: none of them is a backend badge. Their art lives at
 * /assets/images/badges/asu-remix/ and matches the Sticker Mule print files.
 */

export const REMIX_URL = 'https://tech.asu.edu/remixthefuture';

export interface StationSticker {
  id: string;
  name: string;
  animal: string;
  art: string;
  /** The cognition skill that makes this the best match, or null for a bonus sticker. */
  skill: string | null;
}

const ART = '/assets/images/badges/asu-remix';

export const STICKERS: Record<string, StationSticker> = {
  'play-attention': { id: 'play-attention', name: 'Play Attention!', animal: 'Fixated Fennec Fox', art: `${ART}/09-play-attention.svg`, skill: 'attention' },
  'focus': { id: 'focus', name: 'Focus', animal: 'Fixated Fennec Fox', art: `${ART}/01-focus.svg`, skill: 'attention' },
  'response-control': { id: 'response-control', name: 'Response Control', animal: 'Cool Chimpanzee', art: `${ART}/02-response-control.svg`, skill: 'attention' },
  'keen-eye': { id: 'keen-eye', name: 'Keen Eye', animal: 'Watchful Wolf', art: `${ART}/04-keen-eye.svg`, skill: 'perceptual-speed' },
  'reaction-time': { id: 'reaction-time', name: 'Reaction Time', animal: 'Hurried Hare', art: `${ART}/03-reaction-time.svg`, skill: 'timing' },
  'visualization': { id: 'visualization', name: 'Visualization', animal: 'Picturing Porpoise', art: `${ART}/05-visualization.svg`, skill: 'visualization' },
  'leverage-our-place': { id: 'leverage-our-place', name: 'Leverage Our Place', animal: 'Canny Coyote', art: `${ART}/08-leverage-our-place.svg`, skill: null },
};

/** Different games a visitor plays before the Leverage Our Place bonus. */
export const BONUS_GAME_COUNT = 3;

/** Input a game takes, drawn as an icon on the how-to-play screen. */
export type StationControl = 'arrow-keys' | 'mouse' | 'touch' | 'swipe';

export interface StationGame {
  slug: string;
  name: string;
  description: string;
  /** Shown under the description when the game needs something the host should know. */
  hint?: string;
  tone: 'pink' | 'mint' | 'green' | 'blue' | 'yellow' | 'purple';
  /** Stickers this game can earn, the default pick first. */
  stickers: string[];
  /** The how-to-play screen shown before the game loads. */
  howToPlay: {
    goal: string;
    steps: string[];
    /** The input the game takes, e.g. "Arrow keys". */
    controls: string;
    controlIcons: StationControl[];
  };
}

/** In the order the host script lists them. */
export const STATION_GAMES: StationGame[] = [
  {
    slug: 'hextris',
    name: 'Hextris',
    description: 'Rotate the hexagon to match the falling colored blocks.',
    hint: 'Played with the arrow keys.',
    tone: 'purple',
    stickers: ['visualization'],
    howToPlay: {
      goal: 'Keep the blocks from piling up past the edge of the board.',
      steps: [
        'Colored blocks slide in toward the hexagon in the middle.',
        'Press the left and right arrow keys to turn the hexagon so each block lands where you want it.',
        'Three or more blocks of the same color touching clear away. Picture where each block will land before it gets there.',
      ],
      controls: 'Left and right arrow keys',
      controlIcons: ['arrow-keys'],
    },
  },
  {
    slug: 'box-tower',
    name: 'Box Tower',
    description: 'Drop each box at the right moment to build the tallest tower.',
    tone: 'yellow',
    stickers: ['reaction-time'],
    howToPlay: {
      goal: 'Build the tallest tower you can.',
      steps: [
        'A box slides back and forth above the top of the tower.',
        'Click or tap to drop it.',
        'Time each drop so the box lands on the one below. Miss, and the tower falls.',
      ],
      controls: 'Click or tap',
      controlIcons: ['mouse', 'touch'],
    },
  },
  {
    slug: 'fruit-boom',
    name: 'Fruit Boom',
    description: 'Slice the fruit as it flies and steer clear of the bombs.',
    tone: 'pink',
    stickers: ['play-attention', 'focus', 'response-control', 'keen-eye'],
    howToPlay: {
      goal: 'Slice as much fruit as you can without hitting a bomb.',
      steps: [
        'Fruit flies up from the bottom of the screen.',
        'Swipe across a fruit to slice it. Don\'t let any fall.',
        'Bombs fly up too. Hold back and let them pass.',
      ],
      controls: 'Swipe with the mouse or a finger',
      controlIcons: ['mouse', 'swipe'],
    },
  },
  {
    slug: 'space-trip',
    name: 'Space Trip',
    description: 'Fly through space, dodging rocks and grabbing fuel before the tank runs dry.',
    tone: 'blue',
    stickers: ['keen-eye', 'reaction-time'],
    howToPlay: {
      goal: 'Fly as far as you can before your fuel runs out.',
      steps: [
        'Hold the pointer where you want your astronaut to fly.',
        'Dodge the rocks coming toward you.',
        'Grab fuel along the way before the tank runs dry.',
      ],
      controls: 'Move the mouse or your finger',
      controlIcons: ['mouse', 'touch'],
    },
  },
];

export function stationGame(slug: string): StationGame | undefined {
  return STATION_GAMES.find((game) => game.slug === slug);
}

/**
 * The sticker to hand over: of the game's stickers, the one whose skill scored
 * highest this session. Ties, and a session with no scores yet, keep the
 * game's own order.
 */
export function pickSticker(gameSlug: string, cognition: { slug: string; score: number }[]): StationSticker | null {
  const game = stationGame(gameSlug);
  if (!game) return null;
  const scoreOf = (skill: string | null) => cognition.find((metric) => metric.slug === skill)?.score ?? -1;
  let best = STICKERS[game.stickers[0]];
  for (const id of game.stickers.slice(1)) {
    if (scoreOf(STICKERS[id].skill) > scoreOf(best.skill)) best = STICKERS[id];
  }
  return best;
}

// Which games this visitor has played, for the bonus sticker. Kept per
// browser identity, so the next visitor (a new guest) starts from none.
const PLAYED_KEY = 'asu_station_played';

export function readPlayedGames(userId: string | null): string[] {
  try {
    const raw = localStorage.getItem(PLAYED_KEY);
    if (!raw) return [];
    const held = JSON.parse(raw) as { userId: string | null; games: string[] };
    return held.userId === userId && Array.isArray(held.games) ? held.games : [];
  } catch {
    return [];
  }
}

export function recordPlayedGame(userId: string | null, gameSlug: string): string[] {
  const games = readPlayedGames(userId);
  if (!games.includes(gameSlug)) games.push(gameSlug);
  try {
    localStorage.setItem(PLAYED_KEY, JSON.stringify({ userId, games }));
  } catch {
    // Storage can be blocked; the bonus is the host's call anyway.
  }
  return games;
}

export function clearPlayedGames(): void {
  try {
    localStorage.removeItem(PLAYED_KEY);
  } catch {
    // Nothing to clear.
  }
}
