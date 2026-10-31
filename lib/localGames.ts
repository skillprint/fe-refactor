import { baseSlug } from '@/lib/gameSlug';
import { gameAssetUrl, isGamesCdnUrl } from '@/lib/gameAssets';

/**
 * Which games the portal can play, and where, comes from the backend record:
 * its `externalWebUrl` (catalog) / `url` (library, playbooks, next game) is
 * the game's page on the games CDN, e.g.
 * https://games.skillprint.co/live/Lumen/static/index.html, so a new game
 * needs no deploy here. The catalogue also lists games the portal can't open
 * (Last War, Plastoblasto, legacy S3 copies...), so every game list filters
 * on isPlayableGame.
 *
 * Legacy: the maps below were the source before the records pointed at the
 * CDN (marketplace #154). They answer only for records that don't yet, and
 * for bare slugs; remove them once every backend the portal talks to has
 * #154. Don't add games here.
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
    /** Where the game plays (catalog). */
    externalWebUrl?: string | null;
    external_web_url?: string | null;
    /** Where the game plays (library, playbooks, next game; the catalog sends it too). */
    url?: string | null;
}

const legacyBuildUrl = (slug: string): string | null => {
    const unifiedSlug = baseSlug(slug);
    if (INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug]) return gameAssetUrl(`inactive/${INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug]}/static/index.html`);
    if (SLUG_TO_DIR_MAP[unifiedSlug]) return gameAssetUrl(`live/${SLUG_TO_DIR_MAP[unifiedSlug]}/static/index.html`);
    return null;
};

/**
 * The game's page on the games CDN: the record's URL when it is on the CDN,
 * else the legacy map. Other URLs (the old packager's S3 copies, Simmer) are
 * not games this portal can run: they predate its SDK.
 */
export const gameBuildUrl = (game: GameBuildRef | string | null | undefined): string | null => {
    if (!game) return null;
    if (typeof game === 'string') return legacyBuildUrl(game);
    const recordUrl = [game.externalWebUrl, game.external_web_url, game.url].find((u): u is string => !!u && isGamesCdnUrl(u));
    if (recordUrl) return recordUrl;
    return game.slug ? legacyBuildUrl(game.slug) : null;
};

/** True when the game has a page on the games CDN, so it can be played here. */
export const isPlayableGame = (game: GameBuildRef | string | null | undefined) => Boolean(gameBuildUrl(game));

/**
 * The parameter manifest a build ships beside its page
 * (`<Game>/backend/game-scoring-config.json`). Not every game has one; a
 * missing one fails the fetch and the session starts without parameters.
 */
export const gameParameterManifestUrl = (gamePageUrl: string): string =>
    new URL('../backend/game-scoring-config.json', gamePageUrl).href;

/** True when the frontend can play this slug (any slug form). Prefer isPlayableGame with the record. */
export const hasLocalGameDir = (slug: string) => isPlayableGame(slug);

/** The entry page for a slug (any slug form). Prefer gameBuildUrl with the record. */
export const mapSlugToGamePath = (slug: string) =>
    gameBuildUrl(slug) ?? gameAssetUrl(`live/${slug}/static/index.html`);
