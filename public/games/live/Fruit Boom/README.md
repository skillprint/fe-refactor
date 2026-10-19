# Fruit Boom Skillprint Integration

A Construct 3 game on `../_shared/skillprintC3.js`, which owns the game clock, screenshots (preserved drawing buffer), input forwarding and the event-sheet `logEvent` forwarder (see `Documentation.txt` for the events). Difficulty knobs and score reporting are in `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately; all three hold across restarts.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `speedModifier` | float | 0.6 - 1.5 (1) | Game clock (`SkillprintC3.setSpeed`). Fruit flight, gravity and the spawn timer scale with it. Event times and screenshot `capturedAt` stay on the real clock. |
| `spawnIntervalMultiplier` | float | 0.5 - 2 (1) | Multiplies the sheet's `Spawn_Time` ramp (4 s, then 2 s at 10 points, 1 s at 15, 0.5 s at 30, 0.4 s at 80), re-applied every tick. Higher is calmer. |
| `bombDensity` | float | 0 - 1 (1) | Share of spawned bombs kept. A bomb is recognisable a tick after it spawns, after the sheet has logged its `SPAWN`, so a removed bomb is logged as `BOMB_REMOVED {id, score}` with the same `id`. |

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `speedModifier` 0.6 (slow motion)
- **Key 2**: `speedModifier` 1.0 (default)
- **Key 3**: `speedModifier` 1.5 (fastest)
- **Key 4**: `spawnIntervalMultiplier` 2.0 (half as many launches)
- **Key 5**: `spawnIntervalMultiplier` 1.0 (default)
- **Key 6**: `spawnIntervalMultiplier` 0.5 (twice as many)
- **Key 7**: `bombDensity` 0 (no bombs)
- **Key 8**: `bombDensity` 1.0 (default)
- **Key 9**: hard mode: `speedModifier` 1.4, `spawnIntervalMultiplier` 0.6, `bombDensity` 1

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The game page sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. **The production config needs a one-time admin edit**; see `backend/README.md`.
