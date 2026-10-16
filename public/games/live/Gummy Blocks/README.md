# Gummy Blocks Skillprint Integration

This game is integrated with the Skillprint portal and the AI Guide: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. The shim also forwards pointer presses, which the AI Guide uses to open its session.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Numbers sent as strings are accepted.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `maxPieceCells` | integer | 3 - 9 (9) | Largest piece dealt, in cells: 3 = small pieces only, 4 adds the 2x2 and 4-bars, 5 adds 5-bars and big Ls (6-8 behave as 5), 9 adds the 3x3. Applies to the next pieces dealt. |
| `piecesToPlace` | integer | 1 - 3 (3) | Pieces placed before the tray refills its empty slots. 1 = always three to choose from; 3 = use up the tray first. Applies immediately. Out-of-range values (4-5, from the old config) are rejected, not clamped. |

Not offered to the model:
- `scoreMultiplier` (0.1-3) still works in the shim. It changes only the score, not difficulty, and rescales the score the portal reports, so the backend config leaves it out.
- `boardRows`, `boardCols` and `gameSpeed` (from marketplace migration 0009) are ignored: the board is built once for 10x10, and FPS doesn't matter in an untimed puzzle.

## Testing with keys 1-9 (GameAdjustmentTester)

Easy to hard, from small pieces with a tray that refills every placement (key 1) to the game as designed (key 9): `maxPieceCells` 3/3/4/4/5/5/9/9/9 with `piecesToPlace` 1/2/1/2/2/3/1/2/3.

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The game page sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. **The production config needs a one-time admin edit**; see `backend/README.md`.
