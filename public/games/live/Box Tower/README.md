# Box Tower Skillprint Integration

This game is integrated with the Skillprint portal and the AI Guide: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. The shim also forwards pointer presses, which the AI Guide uses to open its session.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately. The shim re-applies them when a new game starts, because `CGame` resets `STACK_VELOCITY` from its start-up data.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `stackVelocity` | float | 2 - 20 (5) | Pixels the moving box travels per frame at 30 fps: 5 crosses the tower in about 4 s, 20 in about 1 s. |
| `perfectRange` | float | 0 - 15 (1) | How far off, in pixels, a drop can land and still count as perfect (the box snaps into place instead of being cut). |

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `stackVelocity` 3 (slow)
- **Key 2**: `stackVelocity` 5 (default)
- **Key 3**: `stackVelocity` 8
- **Key 4**: `stackVelocity` 12
- **Key 5**: `stackVelocity` 20 (max)
- **Key 6**: `perfectRange` 0 (any misalignment is cut)
- **Key 7**: `perfectRange` 1 (default)
- **Key 8**: `perfectRange` 8 (forgiving)
- **Key 9**: hard mode: `stackVelocity` 15, `perfectRange` 0

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The game page sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
