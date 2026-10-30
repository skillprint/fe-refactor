/**
 * Where game builds (public/games/live, public/games/inactive) are served from.
 * By default that is this site's own /games folder. Set
 * NEXT_PUBLIC_GAMES_BASE_URL (e.g. https://games.skillprint.co) to load them
 * from the games CDN instead: it mirrors public/games, so a path under it is
 * the same in both places.
 */
export const GAMES_BASE_URL = (process.env.NEXT_PUBLIC_GAMES_BASE_URL || '/games').replace(/\/+$/, '');

/** The URL of a file under public/games, e.g. gameAssetUrl('live/Hextris/static/index.html'). */
export const gameAssetUrl = (path: string) => `${GAMES_BASE_URL}/${path.replace(/^\/+/, '')}`;

/**
 * True when a postMessage came from a game frame. Games on the CDN post from
 * its origin; local builds and the sandbox's generated games from this site's.
 */
export const isGameMessageOrigin = (origin: string) =>
    origin === window.location.origin || origin === new URL(GAMES_BASE_URL, window.location.href).origin;
