import { baseSlug } from '@/lib/gameSlug';
import { gameAssetUrl } from '@/lib/gameAssets';

/**
 * The games this frontend can play, keyed by base slug, and each one's folder
 * on the games CDN (the games repo's live/ and inactive/). The backend
 * catalogue also lists games with no build there (Last War, Plastoblasto,
 * Natural Bridges...); opening one would iframe a 403, so every game list
 * filters on hasLocalGameDir.
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

/** True when the frontend ships a local build for this slug (any slug form). */
export const hasLocalGameDir = (slug: string) => {
    const unifiedSlug = baseSlug(slug);
    return Boolean(SLUG_TO_DIR_MAP[unifiedSlug] || INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug]);
};

export const mapSlugToGamePath = (slug: string) => {
    const unifiedSlug = baseSlug(slug);

    const inactiveDir = INACTIVE_SLUG_TO_DIR_MAP[unifiedSlug];
    if (inactiveDir) return gameAssetUrl(`inactive/${inactiveDir}/static/index.html`);

    const dir = SLUG_TO_DIR_MAP[unifiedSlug];
    if (dir) return gameAssetUrl(`live/${dir}/static/index.html`);
    return gameAssetUrl(`live/${slug}/static/index.html`);
};
