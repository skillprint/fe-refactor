import { baseSlug } from '@/lib/gameSlug';
import { gameAssetUrl } from '@/lib/gameAssets';

/**
 * Which games the portal can play and where each build lives on the games
 * CDN come from the backend record: `buildDir` (e.g. `live/Lumen`) and
 * `hasParameterManifest` (marketplace #154), so a new game needs no deploy
 * here. The catalogue also lists games with no build (Last War, Plastoblasto,
 * Natural Bridges...); opening one would iframe a 403, so every game list
 * filters on isPlayableGame.
 *
 * Legacy: the maps below were the source before the record carried
 * `buildDir`. They answer only for records that don't send the field yet
 * (a backend without #154) and for bare slugs; remove them once every
 * backend the portal talks to has it. Don't add games here.
 */
export const SLUG_TO_DIR_MAP: Record<string, string> = {
    '0hh1': '0hh1',
    '2048': '2048',
    'alchemy': 'Alchemy',
    'box-tower': 'Box Tower',
    'brick-out': 'Brick Out',
    'bubble-spirit': 'Bubble Spirit',
    'change-word': 'Change Word',
    'colorize-2': 'Colorize 2',
    'flapcat-steampunk': 'Flapcat Steampunk',
    'flapcat-steampunk-2': 'Flapcat Steampunk 2',
    'fruit-boom': 'Fruit Boom',
    'fruit-sorting': 'Fruit Sorting',
    'garden-match': 'Garden Match',
    'gems-of-hanoi': 'Gems of Hanoi',
    'gummy-blocks': 'Gummy Blocks',
    'hextris': 'Hextris',
    'hiding-master': 'Hiding Master',
    'i-love-hue': 'I Love Hue',
    'impossible-10': 'Impossible 10',
    'katana-fruits': 'Katana Fruits',
    'mahjong-deluxe': 'Mahjong Deluxe',
    'match-doodle': 'Match Doodle',
    'mine-rusher': 'Mine Rusher',
    'photo-hunt': 'Photo Hunt',
    'snake-attack': 'Snake Attack',
    'space-adventure-pinball': 'Space Adventure Pinball',
    'space-trip': 'Space Trip',
    'stacks-tower': 'Stacks Tower',
    'star-puzzles': 'Star Puzzles',
    'sumagi': 'Sumagi',
    // The backend record is `mage-duel`; the build folder kept its 2D suffix.
    'mage-duel': 'mage-duel-2d',
    // Legacy catalog records whose base slug carries a `-2` (SKI-180). Remove with the map in SKI-168.
    'match-doodle-2': 'Match Doodle',
    'sumagi-2': 'Sumagi',
    'fruit-sorting-2': 'Fruit Sorting',
    'sweet-memory-2': 'Sweet Memory',
    'sweet-memory': 'Sweet Memory',
    'ultimate-sudoku': 'Ultimate Sudoku',
    'whack-em-all': "Whack 'em All",
    'doodle-god-next': 'Doodle God Next',
    'cut-the-rope': 'Cut The Rope',
    'omnomrun': 'Omnomrun',
    'dungeon-runner': 'Dungeon Runner',
    'simon-says': 'Simon Says',
    'solitaire': 'Solitaire',
    'reaction-time': 'Reaction Time',
    'dual-n-back': 'Dual N-Back',
    'stroop-test': 'Stroop Test',
    'typing-speed': 'Typing Speed',
    'guided-breathing': 'Guided Breathing',
    'procedural-maze': 'Procedural Maze',
    'order-rush': 'Order Rush',
    // Unity WebGL build from the trails_webar repo (TMT -> Build WebGL (Release)).
    'trails-webar': 'Trails',
    // Three.js game from game-builder (games/mountain-appreciator).
    'mountain-appreciator': 'Mountain Appreciator',
    // Three.js math games, each importing skillprint-js-sdk like Mountain Appreciator.
    'equilibrium': 'Equilibrium',
    'firefly-gates': 'Firefly Gates',
    'elixir': 'Elixir',
    // Three.js games from the coverage batch (skills/moods the catalogue lacked), each on skillprint-js-sdk.
    'lumen': 'Lumen',
    'flockwork': 'Flockwork',
    'broadsheet': 'Broadsheet',
    'wayfinder': 'Wayfinder',
    'hearthlight': 'Hearthlight',
    'jelly-juggle': 'Jelly Juggle',
    'xenoflora': 'Xenoflora',
    'chronicle': 'Chronicle',
    'glide': 'Glide',
    'cache': 'Cache',
    'treehouse-telegraph': 'Treehouse Telegraph',
    'viewpoints': 'Viewpoints',
    'bandstand': 'Bandstand',
    'switchyard': 'Switchyard',
    'kind-words-cafe': 'Kind Words Cafe',
    'blockwright': 'Blockwright',
    'tidepool': 'Tidepool',
    'lookout': 'Lookout',
    'gearworks': 'Gearworks',
    'market-day': 'Market Day',
    'waggle': 'Waggle',
    'rootwords': 'Rootwords'
};

export const INACTIVE_SLUG_TO_DIR_MAP: Record<string, string> = {
    'airport-rush': 'Airport Rush',
    'circle-word': 'Circle Word',
    'color-bump': 'Color Bump',
    'crossy-chicken': 'Crossy Chicken',
    'jigsaw-puzzle': 'Jigsaw Puzzle',
    'jumper-frog': 'Jumper Frog',
    'miner-block': 'Miner Block',
    'pipe-flow': 'Pipe Flow',
    'slide': 'Slide',
    'sweet-candy-saga': 'Sweet Candy Saga',
    'twenty-one': 'Twenty-One',
    'unlock-blox': 'Unlock Blox',
    'word-search': 'Word Search',
    'zig-zag-switch': 'Zig Zag Switch'
};

/** A backend game record, or any part of one that names the game. */
export interface GameBuildRef {
    slug?: string | null;
    /** Folder on the games CDN, from the record; `''`/null when it has no build. */
    buildDir?: string | null;
    hasParameterManifest?: boolean | null;
}

const legacyBuildDir = (slug: string): string | null => {
    const unifiedSlug = baseSlug(slug);
    if (INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug]) return `inactive/${INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug]}`;
    if (SLUG_TO_DIR_MAP[unifiedSlug]) return `live/${SLUG_TO_DIR_MAP[unifiedSlug]}`;
    return null;
};

/**
 * The game's folder on the games CDN: the record's `buildDir` when the
 * backend sends one (even empty: then it has no build), else the legacy map.
 */
export const gameBuildDir = (game: GameBuildRef | string | null | undefined): string | null => {
    if (!game) return null;
    if (typeof game === 'string') return legacyBuildDir(game);
    if (game.buildDir !== undefined) return game.buildDir || null;
    return game.slug ? legacyBuildDir(game.slug) : null;
};

/** True when the game has a build on the games CDN, so it can be played here. */
export const isPlayableGame = (game: GameBuildRef | string | null | undefined) => Boolean(gameBuildDir(game));

/** The game's entry page on the games CDN, or null when it has no build. */
export const gameBuildUrl = (game: GameBuildRef | string | null | undefined): string | null => {
    const dir = gameBuildDir(game);
    return dir ? gameAssetUrl(`${dir}/static/index.html`) : null;
};

/**
 * The game's parameter manifest, whose `sdk_game_parameters` go on session
 * start, or undefined when it has none. Legacy: without the record's flag,
 * the static game config says.
 */
export const gameParameterManifestUrl = (
    game: GameBuildRef | null | undefined,
    legacyManifest?: string,
): string | undefined => {
    if (game?.hasParameterManifest === undefined || game?.hasParameterManifest === null) return legacyManifest;
    const dir = gameBuildDir(game);
    return game.hasParameterManifest && dir ? gameAssetUrl(`${dir}/backend/game-scoring-config.json`) : undefined;
};

/** True when the frontend can play this slug (any slug form). Prefer isPlayableGame with the record. */
export const hasLocalGameDir = (slug: string) => isPlayableGame(slug);

/** The entry page for a slug (any slug form). Prefer gameBuildUrl with the record. */
export const mapSlugToGamePath = (slug: string) =>
    gameBuildUrl(slug) ?? gameAssetUrl(`live/${slug}/static/index.html`);
