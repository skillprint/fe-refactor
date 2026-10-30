# Star Puzzles

A one-stroke puzzle by blit games: draw over every line of a star figure without lifting the pointer or using a line twice. It is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range; all three hold across rounds, retries and returning to a round from the menu.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `puzzleDifficulty` | float | -1 - 1 (-1) | Which puzzle each round serves, by edge count (lines to draw, 4-16). -1 (any negative value) keeps the game's own order, round N = puzzle N. 0-1 is a quantile of edge count: the 60 puzzles are ranked by edge count (ties by position), and round N serves one of the 10 puzzles nearest rank q × 59, cycling through those 10 as rounds advance. 0: 4-9 lines, 0.25: 10-11, 0.5: 11-12, 0.75: 12-13, 1: 13-16. Takes effect from the next puzzle built; the puzzle in play and its retries stay as they are. |
| `snapRadius` | integer | 15 - 45 (30) | How close, in game units, the pointer must pass to a star for the line to connect (a star's white disc has radius 16). 30 is the game's own value. Read on every frame of a drag, so it applies immediately. |
| `startHint` | integer | 0 - 1 (0) | 1 draws a yellow ring around the two stars a solution has to start from (the stars with an odd number of lines). In the 20 puzzles where every star has an even number of lines any star works, so none is ringed. Applies to the puzzle in play and every later one. |

How: the puzzles are the strings in `oCONFIG.puzzles` (`static/config.js`), and `GameManager.doGetPuzzle(level)` (`static/js/game/GameManager.js`) parses puzzle `level` each time `GameScene` builds a round. The shim waits for `GameManager` (created once the assets load) and wraps `doGetPuzzle` to pick the puzzle number. `snapRadius` and `startHint` need two one-line hooks in `static/js/scenes/GameScene.js`, each marked `Skillprint hook`:

- `doUpdate`: `if(d < (window.skillprintSnapRadius || 30))` instead of the literal 30, so the game behaves as before without the shim.
- `doCreateLevel`: after the stars are created, `window.skillprintOnLevel(dots, puzzle)` hands the round's stars to the shim, which counts each star's lines and adds a ring (a `createjs.Shape` child of the star, not clickable) to the odd ones.

Note for analysis: with `puzzleDifficulty` on, the events' `level` is the round number, not the puzzle number.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: puzzleDifficulty 0 (fewest lines, 4-9)
- **Key 2**: puzzleDifficulty 0.5 (11-12 lines)
- **Key 3**: puzzleDifficulty 1 (most lines, 13-16)
- **Key 4**: puzzleDifficulty -1 (the game's own order, default)
- **Key 5**: snapRadius 15 (pointer must cross the star)
- **Key 6**: snapRadius 30 (default)
- **Key 7**: snapRadius 45 (forgiving)
- **Key 8**: startHint 1 (ring the start stars)
- **Key 9**: startHint 0 (no hint, default)

## How it was tested

Headless Chrome on the static files (720×900 viewport), with real mouse drags: the test solves rounds by dragging along an Euler path computed from `config.js`, and reads the round from the scene (stars, lines drawn on the board, lines connected, rings).

- Default: rounds 1, 2, 3 (solved in turn) serve puzzles 1, 2, 3 (4, 5, 7 lines); round 20 = puzzle 20, round 45 = puzzle 45.
- `puzzleDifficulty` 1: round 1 → puzzle 58 (13 lines), solved → round 2 puzzle 59 (13), solved → round 3 puzzle 17 (14); round 20 → 16 lines, round 45 → 14. 0: rounds 1, 2, 5, 10, 20, 45 serve 4-9 lines. 0.5: rounds 1, 5, 20, 45 serve 11-12. A failed try and the retry keep the same puzzle; reopening round 3 serves the same puzzle. 7 clamps to 1; -0.3 is off.
- `snapRadius`: dragging toward a star and stopping at a given distance from it connects at 10, 22, 28 units and not at 36 by default; only at 10 with 15; up to 40 (not 48) with 45. 100 clamps to 45, 3 to 15.
- `startHint`: turned on mid-round, it rings exactly the odd stars (round 4: stars 27 and 393); starting from a ringed star solves; the rings follow to the next rounds, stay after a failed try, are absent on an all-even puzzle (round 10) and are removed by 0.
