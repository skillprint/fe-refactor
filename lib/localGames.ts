import { isGamesCdnUrl } from '@/lib/gameAssets';

/**
 * Which games the portal can play, and where, comes from the backend record:
 * its `externalWebUrl` (catalog) / `url` (library, playbooks, next game) is
 * the game's page on the games CDN, e.g.
 * https://games.skillprint.co/live/Lumen/static/index.html. Adding a game is a
 * games-repo deploy plus a record; nothing here changes. The catalogue also
 * lists games the portal can't open (Last War, Plastoblasto, Simmer games...),
 * so every game list filters on isPlayableGame.
 */

/** A backend game record, or any part of one that names the game. */
export interface GameBuildRef {
    slug?: string | null;
    /** Where the game plays (catalog). */
    externalWebUrl?: string | null;
    external_web_url?: string | null;
    /** Where the game plays (library, playbooks, next game; the catalog sends it too). */
    url?: string | null;
}

/**
 * The game's page on the games CDN, from its record, or null. Other URLs (the
 * old packager's S3 copies, Simmer) are not games this portal can run: they
 * predate its SDK.
 */
export const gameBuildUrl = (game: GameBuildRef | null | undefined): string | null =>
    [game?.externalWebUrl, game?.external_web_url, game?.url].find((u): u is string => !!u && isGamesCdnUrl(u)) ?? null;

/** True when the game has a page on the games CDN, so it can be played here. */
export const isPlayableGame = (game: GameBuildRef | null | undefined) => Boolean(gameBuildUrl(game));

/**
 * The parameter manifest a build ships beside its page
 * (`<Game>/backend/game-scoring-config.json`). Not every game has one; a
 * missing one fails the fetch and the session starts without parameters.
 */
export const gameParameterManifestUrl = (gamePageUrl: string): string =>
    new URL('../backend/game-scoring-config.json', gamePageUrl).href;
