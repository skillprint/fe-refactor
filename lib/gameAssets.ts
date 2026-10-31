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
 * True when a URL is on a games CDN: production, staging, or the one this
 * deployment is configured with (e.g. the games repo's local server). A game
 * record's URL is played only when it is.
 */
export const isGamesCdnUrl = (url: string) => {
    try {
        const { hostname, origin } = new URL(url);
        return /^games(\.staging)?\.skillprint\.co$/.test(hostname)
            || (/^https?:/.test(GAMES_BASE_URL) && origin === new URL(GAMES_BASE_URL).origin);
    } catch {
        return false;
    }
};

/**
 * True when a postMessage came from a game frame. Games post from their CDN's
 * origin; the demo game and the sandbox's generated games from this site's.
 */
export const isGameMessageOrigin = (origin: string) =>
    origin === window.location.origin || origin === new URL(GAMES_BASE_URL, window.location.href).origin || isGamesCdnUrl(origin);
