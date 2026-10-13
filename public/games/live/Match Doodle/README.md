# Match Doodle Skillprint Integration

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied to the level in play as well as every later level.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `pairs` | integer | 2 - 40 (5) | Pairs of cards in the heap. Replaces the built-in 5, 10, ... 40 progression. In a level, new pairs are dealt into the heap, or pairs with both cards still in the heap are taken out (never the card on the drop pad or one in the player's hand). Logs `OBJECTIVES_CHANGED`. |
| `clusterSpread` | float | 0.5 - 2 (1.0) | Heap size as a multiple of the game's own (which grows with the card count). Lower = denser heap, more overlap. In a level, the heap is scaled about its centre. |
| `cardRotation` | integer | 0 - 180 (180) | Largest tilt of a heap card in degrees (0 = upright). In a level, the heap is re-tilted. Dragged cards still spin a little. |

`pairs` keeps its old name; it used to take effect only at the next level.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `pairs` 3
- **Key 2**: `pairs` 10
- **Key 3**: `pairs` 25
- **Key 4**: `clusterSpread` 0.5 (dense heap)
- **Key 5**: `clusterSpread` 1.0 (default)
- **Key 6**: `clusterSpread` 2.0 (spread out)
- **Key 7**: `cardRotation` 0 (upright)
- **Key 8**: `cardRotation` 180 (default)
- **Key 9**: hard mode: `pairs` 40, `clusterSpread` 0.5, `cardRotation` 180

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
