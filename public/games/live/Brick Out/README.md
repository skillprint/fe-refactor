# Brick Out Skillprint Integration

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `ballSpeed` | float | 0.6 - 1.6 (1.0) | Base ball speed multiplier, applied to the balls in play and kept through lost balls and new levels. Speed power-ups move the ball within 0.5x-1.5x of it. |
| `bonusDropRate` | float | 0 - 2 (1.0) | Multiplies each level's power-up drop chance (0 = none). |
| `maxBallSpawn` | integer | 1 - 6 (4) | Most balls in play from the multi-ball power-up. |

Retired (they never changed difficulty): `MAX_VELOCITY_LIMIT` / `MIN_VELOCITY_LIMIT` only bounded the speed power-ups, and `TIME_BOUNCE_BALL` is a collision debounce. The shim warns if it receives them.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `ballSpeed` 0.6 (very slow)
- **Key 2**: `ballSpeed` 0.8 (slow)
- **Key 3**: `ballSpeed` 1.0 (default)
- **Key 4**: `ballSpeed` 1.3 (fast)
- **Key 5**: `ballSpeed` 1.6 (very fast)
- **Key 6**: `bonusDropRate` 0 (no power-ups)
- **Key 7**: `bonusDropRate` 1, `maxBallSpawn` 4 (default power-ups)
- **Key 8**: `bonusDropRate` 2, `maxBallSpawn` 6 (lots of power-ups, big multi-ball)
- **Key 9**: hard mode: `ballSpeed` 1.6, `bonusDropRate` 0.3, `maxBallSpawn` 1

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. Paste `adjustment_instructions` and `skill_adjustment_instructions` into Django admin for mood/skill guidance (see `backend/README.md`).
