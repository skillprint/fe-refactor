# Cut The Rope

Portal slug `cut-the-rope`. `static/ctrr.js` is the Haxe export of the game; `static/index.html` defines the `logEvent` it calls for gameplay events (see `docs/engine-game-events.md`), `static/cutTheRopeScreenshot.js` sends screenshots, and `static/skillprintShim.js` holds the difficulty knobs.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range. Both apply at once, in the level in play, and hold across restarts and levels.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `gravity` | float | 0.5 - 2.0 (1.0) | Scales gravity on the candy and ropes; soap bubbles' lift scales with it, so bubbles still float. 2 = the candy falls twice as far in the same time (swings about 1.4x faster); 0.5 = half as far. |
| `ropeElasticity` | float | 1.0 - 2.0 (1.0) | How much ropes stretch and bounce. Each +0.25 halves the rope solver's passes (30 as shipped, 15, 8, 4, 2). |

How: ctrr.js keeps its classes inside a closure, so the shim can't reach them. Three marked one-line edits in ctrr.js read globals the shim sets, every physics step:
- `physics_ConstraintPoint.update` multiplies the gravity force by `window.__skillprintGravityScale`;
- `game_World.update` multiplies the bubble lift (`BUBBLE_IMPULSE_Y`) by the same factor. Without it, bubbles sink from about 1.3x gravity: the lift is a fixed impulse, balanced against gravity;
- `game_Bungee.update` uses `window.__skillprintRopeIterations` passes of the rope constraint solver instead of `relaxationTimes` (30). Fewer passes leave the rope's links further from their rest length, so the rope stretches under the candy and bounces back.

With the globals unset (no adjustment yet) the game runs exactly as shipped. Nothing in the game resets them, so they hold across restarts and levels.

Not offered: values of `ropeElasticity` below 1 (at 30 passes a hanging candy stretches its rope under 1%; 60 passes raises the candy by 0.6 px), `bungeeRestLength` (it sets the length of each rope link, not the rope's length or stretch), and the old shim's `scoreMultiplier` (score is not difficulty) and `timeLimitSeconds` (the game has no time limit). The old shim stored all four in `window.*` variables nothing read. Air-cushion puffs keep their strength at any gravity, so they push relatively harder when gravity is low.

## Testing

Headless Chrome against the static build, with a test-only copy of ctrr.js (served by request interception) that exposes the game's classes so the script can read the candy and ropes. Swipes and clicks are real mouse input.

Gravity, level 1-1: the rope is cut with a swipe, then the candy's fall is measured in game time.

| Step | Fall in 0.15 s (game px) | Fall in 0.25 s (game px) |
|---|---|---|
| No adjustment | 7.2 | 19.4 |
| `gravity` 1 | 7.1 | 19.3 |
| `gravity` 0.5 | 3.6 | 9.7 |
| `gravity` 2 | 14.3 | 38.7 |
| `gravity` 9 (clamps to 2) | 14.3 | 38.7 |
| `gravity` 0.1 (clamps to 0.5) | 3.6 | 9.7 |

Bubbles, level 1-5: both ropes cut so the candy drops into the bubble; height gained after capture (game px).

| Gravity | after 1 s | after 2 s | after 3 s |
|---|---|---|---|
| 1 | 6 | 135 | 269 |
| 2 | 69 | 328 | 596 |
| 0.5 | -17 (still slowing its fall) | 47 | 114 |

Rope stretch, level 1-1 (one rope; anchor-to-candy distance over rope length while the candy drops onto the rope at level start and settles):

| `ropeElasticity` | Solver passes | Peak stretch | Stretch at 3 s | Candy rests at y |
|---|---|---|---|---|
| no adjustment | 30 | 5.1% | 0.8% | 212.4 |
| 1 | 30 | 5.1% | 0.8% | 212.4 |
| 1.25 | 15 | 8.1% | 1.5% | 213.5 |
| 1.5 | 8 | 12.4% | 2.8% | 215.3 |
| 1.75 | 4 | 20.0% | 4.9% | 218.4 |
| 2 | 2 | 34.1% | 9.9% | 225.9 |
| 5 (clamps to 2) | 2 | 34.1% | 8.0% (still bouncing) | 223.2 |
| 0.3 (clamps to 1) | 30 | 5.1% | 0.8% | 212.4 |

Each level reload (`gotoLevel`, the same as a restart) kept the values; at level 1-2 `ropeElasticity` 2 still ran 2 passes and gravity stayed at 2. An unknown parameter (`scoreMultiplier`, `timeLimitSeconds`) or a non-numeric value logs a warning and changes nothing. The gameplay events from #122 still fire (LEVEL_START, ROPE_CUT, STAR_COLLECTED, LEVEL_COMPLETE).

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: gravity 0.5 (floaty, more time)
- **Key 2**: gravity 0.75
- **Key 3**: gravity 1 (default)
- **Key 4**: gravity 1.5
- **Key 5**: gravity 2 (heavy, tight timing)
- **Key 6**: ropeElasticity 1 (default, stiff)
- **Key 7**: ropeElasticity 1.5
- **Key 8**: ropeElasticity 2 (stretchy, bouncy)
- **Key 9**: both back to their defaults

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
