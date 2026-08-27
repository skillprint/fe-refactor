export const mapLocalGameSlugToServerGameSlug = (slug: string) => {
    const map: any = {
        '/games/live/Change Word/static/index.html': 'change-word-0bc38905-8138-43f2-9ff5-a01a5f038782',
        'change-word': 'change-word-0bc38905-8138-43f2-9ff5-a01a5f038782'
    }

    console.log("Mapped: ", slug, map[slug]);

    return map[slug] || slug;
}

export const unifiedSlugFromBESlug = (slug: string) => {
    const lowerSlug = slug.toLowerCase().replace(/\s+/g, '-');
    if (lowerSlug.indexOf('0hh1') >= 0 || lowerSlug.indexOf('0h-h1') >= 0) return '0hh1';
    if (lowerSlug.indexOf('2048') >= 0) return '2048';
    if (lowerSlug.indexOf('alchemy') >= 0) return 'alchemy';
    if (lowerSlug.indexOf('box-tower') >= 0) return 'box-tower';
    if (lowerSlug.indexOf('brick-out') >= 0) return 'brick-out';
    if (lowerSlug.indexOf('bubble-spirit') >= 0) return 'bubble-spirit';
    if (lowerSlug.indexOf('change-word') >= 0) return 'change-word';
    if (lowerSlug.indexOf('colorize-2') >= 0) return 'colorize-2';
    if (lowerSlug.indexOf('crossy-chicken') >= 0) return 'crossy-chicken';
    if (lowerSlug.indexOf('flapcat-steampunk-2') >= 0) return 'flapcat-steampunk-2';
    if (lowerSlug.indexOf('flapcat-steampunk') >= 0) return 'flapcat-steampunk';
    if (lowerSlug.indexOf('fruit-boom') >= 0) return 'fruit-boom';
    if (lowerSlug.indexOf('fruit-sorting') >= 0) return 'fruit-sorting';
    if (lowerSlug.indexOf('garden-match') >= 0) return 'garden-match';
    if (lowerSlug.indexOf('gems-of-hanoi') >= 0) return 'gems-of-hanoi';
    if (lowerSlug.indexOf('gummy-blocks') >= 0) return 'gummy-blocks';
    if (lowerSlug.indexOf('hextris') >= 0) return 'hextris';
    if (lowerSlug.indexOf('hiding-master') >= 0) return 'hiding-master';
    if (lowerSlug.indexOf('i-love-hue') >= 0) return 'i-love-hue';
    if (lowerSlug.indexOf('impossible-10') >= 0) return 'impossible-10';
    if (lowerSlug.indexOf('katana-fruits') >= 0) return 'katana-fruits';
    if (lowerSlug.indexOf('mahjong-deluxe') >= 0) return 'mahjong-deluxe';
    if (lowerSlug.indexOf('match-doodle') >= 0) return 'match-doodle';
    if (lowerSlug.indexOf('mine-rusher') >= 0) return 'mine-rusher';
    if (lowerSlug.indexOf('photo-hunt') >= 0) return 'photo-hunt';
    if (lowerSlug.indexOf('snake-attack') >= 0) return 'snake-attack';
    if (lowerSlug.indexOf('space-adventure-pinball') >= 0) return 'space-adventure-pinball';
    if (lowerSlug.indexOf('space-trip') >= 0) return 'space-trip';
    if (lowerSlug.indexOf('stacks-tower') >= 0) return 'stacks-tower';
    if (lowerSlug.indexOf('star-puzzles') >= 0) return 'star-puzzles';
    if (lowerSlug.indexOf('sumagi') >= 0) return 'sumagi';
    if (lowerSlug.indexOf('sweet-memory') >= 0) return 'sweet-memory';
    if (lowerSlug.indexOf('ultimate-sudoku') >= 0) return 'ultimate-sudoku';
    if (lowerSlug.indexOf('whack-em-all') >= 0) return 'whack-em-all';
    if (lowerSlug.indexOf('line-color') >= 0) return 'line-color';
    if (lowerSlug.indexOf('plastoblasto') >= 0) return 'plastoblasto';
    if (lowerSlug.indexOf('doodle-god-next') >= 0) return 'doodle-god-next';
    if (lowerSlug.indexOf('cut-the-rope') >= 0) return 'cut-the-rope';
    if (lowerSlug.indexOf('omnomrun') >= 0) return 'omnomrun';
    return lowerSlug;
}
