import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    applyScoreUpdate, applySnapshot, reportedGameOver, reportedScore, stampState, toJsonState,
    MAX_GAME_STATE_BYTES, STATE_META_KEY,
} from './gameState';

test('a nested state is kept whole, as JSON', () => {
    const state = { score: 12, board: [[1, 0], [0, 2]], player: { x: 3, y: 4 }, when: new Date(0) };
    assert.deepEqual(toJsonState(state), {
        score: 12, board: [[1, 0], [0, 2]], player: { x: 3, y: 4 }, when: '1970-01-01T00:00:00.000Z',
    });
});

test('non-objects, cycles and oversized states are refused', () => {
    assert.equal(toJsonState(null), null);
    assert.equal(toJsonState(5), null);
    assert.equal(toJsonState([1, 2]), null);
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    assert.equal(toJsonState(cycle), null);
    assert.equal(toJsonState({ big: 'x'.repeat(MAX_GAME_STATE_BYTES) }), null);
    assert.ok(toJsonState({ fits: 'x'.repeat(MAX_GAME_STATE_BYTES - 20) }));
});

test('a snapshot replaces the last state but keeps its score and game-over flag', () => {
    const prev = { score: 40, isGameOver: false, enemies: [{ x: 1 }] };
    assert.deepEqual(applySnapshot(prev, { enemies: [] }), { enemies: [], score: 40, isGameOver: false });
    assert.deepEqual(applySnapshot(prev, { score: 50, isGameOver: true }), { score: 50, isGameOver: true });
});

test('a snapshot drops a game-sent _skillprint key', () => {
    assert.deepEqual(applySnapshot(null, { score: 1, [STATE_META_KEY]: { source: 'frame' } }), { score: 1 });
});

test('a score update changes only score and isGameOver', () => {
    const prev = { score: 1, level: 3 };
    assert.deepEqual(applyScoreUpdate(prev, { score: 2, isGameOver: true, level: 9 }), { score: 2, level: 3, isGameOver: true });
    assert.deepEqual(applyScoreUpdate(null, { score: 'lots' }), {});
});

test('the score and game-over readers ignore wrong types', () => {
    assert.equal(reportedScore({ score: 7 }), 7);
    assert.equal(reportedScore({ score: '7' }), undefined);
    assert.equal(reportedScore({ score: Infinity }), undefined);
    assert.equal(reportedGameOver({ isGameOver: true }), true);
    assert.equal(reportedGameOver({ isGameOver: 'yes' }), false);
    assert.equal(reportedGameOver(null), false);
});

test('an uploaded state carries where and when it was taken', () => {
    assert.deepEqual(stampState({ score: 3 }, { source: 'frame', offsetMs: 1200 }),
        { score: 3, [STATE_META_KEY]: { source: 'frame', offsetMs: 1200 } });
    assert.equal(stampState(null, { source: 'latest', offsetMs: null }), null);
});
