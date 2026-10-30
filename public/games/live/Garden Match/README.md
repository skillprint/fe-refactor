# Garden Match

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (`LEVEL_START`, `SWIPE`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `LEVEL_RESTART`; see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. It is a Construct 3 export (`Garden Match Saga.c3p`) whose event sheets are bundled into `static/scripts/c3runtime.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range, and all three hold across levels and restarts.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `moveBudgetMultiplier` | float | 0.5 - 2.0 (1.0) | Scales the level's move budget (27-45 moves; never below 1). Changes the level in play at once (never leaving fewer than one move) and every level started or restarted after. |
| `targetMultiplier` | float | 0.5 - 1.5 (1.0) | Scales the three goal counts (7-25 each; never below 1). From the next level started or restarted. |
| `colorCount` | integer | 4 - 6 (6) | Most fruit colours that fall. A level's own count is kept when lower (levels 1-2 use 5), so 6 is the game as shipped. A goal fruit whose colour is cut is swapped for the lowest free colour still in play. From the next level started or restarted. |

How: each level is `static/level-N.json`, which GameScene's `load_level` fetches with the AJAX plugin on every start and restart. Its third cell is the settings array (`ArrayTemp2`) that `game_init` copies into the globals: goal fruit frames `At(0,1..3)`, goal counts `At(1,0..2)` → `Target1..3`, move budget `At(2,0)` → `moves`, colour count `At(3,0)` → `max_color` (new fruits are frame `round(random(1, max_color))`). The shim wraps `JSON.parse`, recognises a level file by its `"redfoc-sweetsaga"` marker and rewrites those settings before the event sheet reads them.

The game ends a level when `cur_moves` (moves used) equals `moves`, checked after each swap, so a mid-level move change is written to the `moves` global (and `ArrayTemp2`, in case `game_init` has not run yet) as at least `cur_moves + 1`. Goals and colours are not changed mid-level: cutting a colour could leave a goal fruit that never falls again.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: moveBudgetMultiplier 2 (twice the moves)
- **Key 2**: moveBudgetMultiplier 1 (default)
- **Key 3**: moveBudgetMultiplier 0.6 (fewer moves)
- **Key 4**: targetMultiplier 0.5 (half the goals)
- **Key 5**: targetMultiplier 1 (default)
- **Key 6**: targetMultiplier 1.5 (more goals)
- **Key 7**: colorCount 4 (fewest colours)
- **Key 8**: colorCount 6 (default)
- **Key 9**: hard mode: moveBudgetMultiplier 0.6, targetMultiplier 1.5, colorCount 6

Moves change at once; press restart (pause menu) or start another level to see goals and colours change.

Measured in headless Chrome (`level`: moves, goals, `max_color`, goal fruit frames, colours on the board):

| Step | Result |
|---|---|
| Level 3, defaults | 30 moves, goals 12/7/8, max_color 6, goal frames 5/1/6, board colours 1-6 |
| 2 swaps, then moveBudgetMultiplier 0.5 / 2 | moves 30 → 15 → 60 (13 / 58 left; counter updates) |
| cur_moves 20, moveBudgetMultiplier 0.5 | moves 21 (1 left, not 15); one more swap → gameover |
| Restart at 0.5 / targetMultiplier 1.5 / colorCount 4 | 15 moves, goals 18/11/12, max_color 4, goal frames 2/1/3, board colours 1-4 (also after 4 swaps with refills) |
| Next level (4) at the same | 14 moves, goals 12/15/15, max_color 4, goal frames 3/1/2, colours 1-4 |
| Level 4 restart at 2 / 0.5 / 5 | 54 moves, goals 4/5/5, max_color 5, goal frames 3/5/1, colours 1-5 |
| Level 1 at the same | 60 moves, goals 6/7/5, max_color 5 (its own), frames 3/4/2 unchanged |
| Back to defaults, levels 4 and 1 | 27 moves, 8/10/10, 6, 3/5/6; and 30 moves, 12/14/10, 5, 3/4/2 (as shipped) |
| colorCount 2, targetMultiplier 9, moveBudgetMultiplier 0.01 | clamped to 4, 1.5, 0.5 (level 4: 14 moves, 12/15/15, max_color 4) |
| Unknown name / non-numeric value | `console.warn`, nothing changed |

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
