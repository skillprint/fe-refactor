import type { Adjustment } from './skillprintSdk';

/**
 * A polled session's `telemetry` holds more than adjustments: since events
 * ride on uploads (skillprint-js-sdk #9), it also holds the game's own
 * events (`{event, timestamp, ...}`), which have no `adjustment`. Only entries
 * that carry one are parameter changes.
 */
const asAdjustment = (item: unknown): Adjustment | null => {
    const adj = (item as { adjustment?: unknown } | null)?.adjustment as Partial<Adjustment> | undefined;
    if (!adj || typeof adj !== 'object' || typeof adj.parameterName !== 'string' || !adj.parameterName) return null;
    return adj as Adjustment;
};

const decidedAt = (adj: Adjustment): number => {
    const t = new Date(adj.createDate).getTime();
    return Number.isFinite(t) ? t : 0;
};

/** Identifies one adjustment across polls (the list is cumulative). */
export const adjustmentId = (adj: Adjustment): string =>
    `${adj.gameSlug}-${adj.createDate}-${adj.parameterName}`;

/**
 * Adjustments in `telemetry` not yet in `applied`, oldest first. Doesn't mark
 * them: call {@link markApplied} once they've actually been sent.
 */
export const pendingAdjustments = (
    telemetry: readonly unknown[] | null | undefined,
    applied: ReadonlySet<string>,
): Adjustment[] => {
    if (!Array.isArray(telemetry)) return [];
    const pending: Adjustment[] = [];
    for (const item of telemetry) {
        const adj = asAdjustment(item);
        if (adj && !applied.has(adjustmentId(adj))) pending.push(adj);
    }
    // Stable sort keeps the backend's order for adjustments decided together.
    return pending.sort((a, b) => decidedAt(a) - decidedAt(b));
};

/**
 * The newest value for each parameter, in the order they were decided. Older
 * values for the same parameter are superseded and never sent, so a game
 * never ends up on a stale value.
 */
export const latestPerParameter = (adjustments: readonly Adjustment[]): Adjustment[] => {
    const latest = new Map<string, Adjustment>();
    for (const adj of adjustments) {
        latest.delete(adj.parameterName); // re-insert so Map order = decision order
        latest.set(adj.parameterName, adj);
    }
    return [...latest.values()];
};

export const markApplied = (adjustments: readonly Adjustment[], applied: Set<string>): void => {
    for (const adj of adjustments) applied.add(adjustmentId(adj));
};
