# Change Word Skillprint Integration

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately. The knobs scale the game's own word-length tiers (3-6 letters) rather than replacing them.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `timeMultiplier` | float | 0.5 - 2 (1.0) | Time per word as a multiple of each tier's own (30-60 s). Applies to the word in play (its remaining time scales too) and every later word. |
| `rampMultiplier` | float | 0 - 2 (1.0) | How fast time per word shrinks after each solved word, as a multiple of each tier's own step (3 s down to 1 s). 0 = constant time. |
| `hintsPerStage` | integer | 0 - 10 (5) | Hints of each kind per tier; refills or removes the current tier's hints now. |

Retired: `timer` (one time per word in ms for every tier, which only took effect at the next tier). The shim still converts it to `timeMultiplier` against the current tier.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `timeMultiplier` 2.0 (twice the time)
- **Key 2**: `timeMultiplier` 1.5
- **Key 3**: `timeMultiplier` 1.0 (default)
- **Key 4**: `timeMultiplier` 0.75
- **Key 5**: `timeMultiplier` 0.5 (half the time)
- **Key 6**: `rampMultiplier` 0 (time stops shrinking)
- **Key 7**: `rampMultiplier` 2 (time shrinks twice as fast)
- **Key 8**: `hintsPerStage` 10 (refill hints)
- **Key 9**: hard mode: `timeMultiplier` 0.5, `rampMultiplier` 2, `hintsPerStage` 0

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
