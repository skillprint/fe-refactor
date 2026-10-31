/**
 * Where game builds are served from: the games CDN, which the games repo
 * (skillprint/games) deploys with the layout live/<Game>/static/... and
 * inactive/<Game>/static/... Each Vercel environment sets
 * NEXT_PUBLIC_GAMES_BASE_URL (https://games.skillprint.co in production,
 * https://games.staging.skillprint.co in staging and previews); without it,
 * local dev uses the staging CDN. To work on a game, run the games repo's
 * server (`make`, http://localhost:8888) and point this at it.
 */
export const GAMES_BASE_URL = (process.env.NEXT_PUBLIC_GAMES_BASE_URL || 'https://games.staging.skillprint.co').replace(/\/+$/, '');

/** The URL of a file on the games CDN, e.g. gameAssetUrl('live/Hextris/static/index.html'). */
export const gameAssetUrl = (path: string) => `${GAMES_BASE_URL}/${path.replace(/^\/+/, '')}`;

/**
 * True when a postMessage came from a game frame. Games on the CDN post from
 * its origin; the demo game and the sandbox's generated games from this site's.
 */
export const isGameMessageOrigin = (origin: string) =>
    origin === window.location.origin || origin === new URL(GAMES_BASE_URL, window.location.href).origin;
