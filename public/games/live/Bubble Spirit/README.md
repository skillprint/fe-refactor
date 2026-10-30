# Bubble Spirit

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. `static/app.min.js` is built from `unminified/app.max.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range. All three apply to the level in play and hold across levels and restarts.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `shotLimitScale` | float | 0.5 - 2.0 (1.0) | Scales the shot limit of the 36 levels that have one (never below 5); unlimited levels stay unlimited. In play, the shots left change by the same amount (never below 1). |
| `specialBubbleRate` | float | 0.0 - 2.0 (1.0) | Scales each level's chance that the next bubble is a special one (bomb or rainbow), capped at 100%. Takes effect from the next bubble drawn. |
| `aimGuide` | integer | 0 - 1 (1) | 0 hides the aiming line and its bounce preview; 1 shows them. Immediate. |

How: `app.min.js` is a classic script, so its state is global: `aLevelData` (the 50 levels from `json/levelData.json`), `levelNum`, `bubblesToFire` (shots left), `launcher` (the cannon, rebuilt each level) and `_levelReset()`, which sets up a level on start and restart. The shim rewrites `@bLimit` and `@specialChance` in `aLevelData` from a pristine copy, and wraps `_levelReset` so the data is in place before a level reads it and the new `launcher` gets an `aimLineAlpha` that reads 0 while the guide is off.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: shotLimitScale 2 (twice the shots)
- **Key 2**: shotLimitScale 1.5
- **Key 3**: shotLimitScale 1 (default)
- **Key 4**: shotLimitScale 0.6 (fewer shots)
- **Key 5**: specialBubbleRate 0 (no specials)
- **Key 6**: specialBubbleRate 1 (default)
- **Key 7**: specialBubbleRate 2 (twice the specials)
- **Key 8**: aimGuide 0 (no aiming line)
- **Key 9**: aimGuide 1 (aiming line back on)

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
