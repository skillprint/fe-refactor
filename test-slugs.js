const { SLUG_TO_DIR_MAP } = require('./slug-test.js'); // Assuming I can run a modified version

function unified(slug) {
    if (slug.indexOf('0hh1') >= 0) return '0hh1';
    if (slug.indexOf('2048') >= 0) return '2048';
    if (slug.indexOf('alchemy') >= 0) return 'alchemy';
    if (slug.indexOf('box-tower') >= 0) return 'box-tower';
    if (slug.indexOf('brick-out') >= 0) return 'brick-out';
    if (slug.indexOf('bubble-spirit') >= 0) return 'bubble-spirit';
    if (slug.indexOf('change-word') >= 0) return 'change-word';
    if (slug.indexOf('colorize-2') >= 0) return 'colorize-2';
    if (slug.indexOf('flapcat-steampunk-2') >= 0) return 'flapcat-steampunk-2';
    if (slug.indexOf('flapcat-steampunk') >= 0) return 'flapcat-steampunk';
    if (slug.indexOf('fruit-boom') >= 0) return 'fruit-boom';
    if (slug.indexOf('fruit-sorting') >= 0) return 'fruit-sorting';
    if (slug.indexOf('garden-match') >= 0) return 'garden-match';
    if (slug.indexOf('gems-of-hanoi') >= 0) return 'gems-of-hanoi';
    if (slug.indexOf('gummy-blocks') >= 0) return 'gummy-blocks';
    if (slug.indexOf('hextris') >= 0) return 'hextris';
    if (slug.indexOf('hiding-master') >= 0) return 'hiding-master';
    if (slug.indexOf('i-love-hue') >= 0) return 'i-love-hue';
    if (slug.indexOf('impossible-10') >= 0) return 'impossible-10';
    if (slug.indexOf('katana-fruits') >= 0) return 'katana-fruits';
    if (slug.indexOf('mahjong-deluxe') >= 0) return 'mahjong-deluxe';
    if (slug.indexOf('match-doodle') >= 0) return 'match-doodle';
    if (slug.indexOf('mine-rusher') >= 0) return 'mine-rusher';
    if (slug.indexOf('photo-hunt') >= 0) return 'photo-hunt';
    if (slug.indexOf('snake-attack') >= 0) return 'snake-attack';
    if (slug.indexOf('space-adventure-pinball') >= 0) return 'space-adventure-pinball';
    if (slug.indexOf('space-trip') >= 0) return 'space-trip';
    if (slug.indexOf('stacks-tower') >= 0) return 'stacks-tower';
    if (slug.indexOf('star-puzzles') >= 0) return 'star-puzzles';
    if (slug.indexOf('sumagi') >= 0) return 'sumagi';
    if (slug.indexOf('sweet-memory') >= 0) return 'sweet-memory';
    if (slug.indexOf('ultimate-sudoku') >= 0) return 'ultimate-sudoku';
    if (slug.indexOf('whack-em-all') >= 0) return 'whack-em-all';

    return slug;
}

const dirMap = {
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
    'sweet-memory': 'Sweet Memory',
    'ultimate-sudoku': 'Ultimate Sudoku',
    'whack-em-all': "Whack 'em All"
};

function mapPath(slug) {
    const un = unified(slug);
    const dir = dirMap[un];
    if (dir) return `/games/live/${dir}/static/index.html`;
    return `/games/live/${slug}/static/index.html`;
}

console.log("match-doodle:", mapPath("match-doodle"));
console.log("Match Doodle:", mapPath("Match Doodle"));
console.log("0hh1:", mapPath("0hh1"));
console.log("0h h1:", mapPath("0h h1"));
console.log("Ohh1:", mapPath("Ohh1"));
