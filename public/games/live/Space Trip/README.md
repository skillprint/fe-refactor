# Space Trip Skillprint Integration

A Construct 3 game on `../_shared/skillprintC3.js`, which owns the game clock, screenshots (preserved drawing buffer), input forwarding and the event-sheet `logEvent` forwarder (see `Documentation.txt` for the events). Difficulty knobs are in `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately; all three hold across restarts.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `speedModifier` | float | 0.6 - 1.5 (1) | Game clock (`SkillprintC3.setSpeed`). Obstacles, spawns, fuel burn and the astronaut's movement all scale with it. Event times and screenshot `capturedAt` stay on the real clock. |
| `fuelBurnMultiplier` | float | 0.5 - 2 (1) | Fuel burn per second of game time. The event sheet burns 0.25 per tick, so a 120 Hz display would burn twice as fast; the shim re-bases it to 15 units per second (a full 896 tank lasts about a minute at 1x), times this multiplier. |
| `meteoriteDensity` | float | 0.25 - 1 (1) | Share of spawned meteorites kept. Planets and satellites are unaffected. |

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `speedModifier` 0.6 (slow motion)
- **Key 2**: `speedModifier` 1.0 (default)
- **Key 3**: `speedModifier` 1.5 (fastest)
- **Key 4**: `fuelBurnMultiplier` 0.5 (fuel lasts twice as long)
- **Key 5**: `fuelBurnMultiplier` 1.0 (default)
- **Key 6**: `fuelBurnMultiplier` 2.0 (fuel lasts half as long)
- **Key 7**: `meteoriteDensity` 0.25 (a quarter of the meteorites)
- **Key 8**: `meteoriteDensity` 1.0 (default)
- **Key 9**: hard mode: `speedModifier` 1.4, `fuelBurnMultiplier` 1.6, `meteoriteDensity` 1

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The game page sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically, **once a backend `Game` record exists for Space Trip**. See `backend/README.md`.
