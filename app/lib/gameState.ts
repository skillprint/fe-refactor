// What a game reports about itself. The portal sends it to the backend with
// every screenshot (`game_state<n>`, stored per frame in
// GameChunkAnalysis.game_states), where it pairs with the frames as data for
// scoring and for training game-playing models; the results dialog reads its
// `score` and `isGameOver`.
//
// A game reports state in two ways (public/games/GAME_STATE.md):
// - With each screenshot: the frame scripts call `window.skillprintGameState()`
//   as they capture, so the state is exactly that frame's.
// - As `gameState` messages: a full snapshot whenever the game likes, sent with
//   the next frames that carry no state of their own. `GAME_SCORE_UPDATE` only
//   updates `score` / `isGameOver`.

/** Bigger states are dropped: about 30 frames' worth of JPEG. */
export const MAX_GAME_STATE_BYTES = 128 * 1024;

/** The key the portal adds to each uploaded state. Games shouldn't use it. */
export const STATE_META_KEY = '_skillprint';

export type GameState = Record<string, unknown>;

/** Where an uploaded state came from, and when it was taken. */
export interface GameStateMeta {
    /** 'frame': taken with this screenshot. 'latest': the last report before it. */
    source: 'frame' | 'latest';
    /** When the state was taken, in ms from session start (null if unknown). */
    offsetMs: number | null;
}

/**
 * A JSON copy of `data` if it is a plain object whose JSON fits in `maxBytes`,
 * else null. postMessage can carry things JSON can't (cycles, Maps, BigInts);
 * the upload is JSON, so this is the form the backend would store.
 */
export function toJsonState(data: unknown, maxBytes: number = MAX_GAME_STATE_BYTES): GameState | null {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    let json: string | undefined;
    try {
        json = JSON.stringify(data);
    } catch {
        return null;
    }
    if (!json || new TextEncoder().encode(json).length > maxBytes) return null;
    const copy = JSON.parse(json);
    return copy && typeof copy === 'object' && !Array.isArray(copy) ? copy : null;
}

/** The state's score, if it is a finite number. */
export function reportedScore(state: GameState | null | undefined): number | undefined {
    const score = state?.score;
    return typeof score === 'number' && Number.isFinite(score) ? score : undefined;
}

/** Whether the state says the game is over. */
export function reportedGameOver(state: GameState | null | undefined): boolean {
    return state?.isGameOver === true;
}

/**
 * The game's new state after a full snapshot. The snapshot replaces the last
 * one, so entities that are gone don't linger; a snapshot without `score` or
 * `isGameOver` keeps the last values, which the results dialog relies on.
 */
export function applySnapshot(prev: GameState | null, snapshot: GameState): GameState {
    const next: GameState = { ...snapshot };
    delete next[STATE_META_KEY];
    if (reportedScore(next) === undefined && reportedScore(prev) !== undefined) next.score = prev!.score;
    if (typeof next.isGameOver !== 'boolean' && typeof prev?.isGameOver === 'boolean') next.isGameOver = prev.isGameOver;
    return next;
}

/** The game's new state after a score update: only `score` and `isGameOver` change. */
export function applyScoreUpdate(prev: GameState | null, data: unknown): GameState {
    const next: GameState = { ...(prev ?? {}) };
    const update = (data && typeof data === 'object' ? data : {}) as GameState;
    const score = reportedScore(update);
    if (score !== undefined) next.score = score;
    if (typeof update.isGameOver === 'boolean') next.isGameOver = update.isGameOver;
    return next;
}

/** The state as uploaded: the game's own fields plus where and when it was taken. */
export function stampState(state: GameState | null, meta: GameStateMeta): GameState | null {
    if (!state) return null;
    return { ...state, [STATE_META_KEY]: meta };
}
