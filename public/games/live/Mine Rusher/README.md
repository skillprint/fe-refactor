# Mine Rusher

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. It is a Construct 3 export (720x1280 portrait).

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range. Both apply mid-run and hold across runs (Retry).

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `speedMultiplier` | float | 0.6 - 1.8 (1.0) | Path scroll and ball roll speed as a multiple of the game's own (131.25 px/s down, 252 px/s sideways). Both scale together, so the ball still follows the diagonal path. Immediate. |
| `speedRampPerTap` | float | 0 - 3 (0) | Adds a speed-up the game doesn't have: each tap adds this percentage of the starting speed, up to 2.5x the game's own speed. Each run starts again at `speedMultiplier`. A change applies to the taps that follow, so the speed never jumps. |

How the game moves (`GameEvents` sheet): once the first tap sets `movON` to 1, every tick the tiles, coins and start platform move down by `ydecrease*dt` and the ball moves sideways by `xdecrease*dt`. Each tap flips the sign of `xdecrease` (`xdecrease -= 2*xdecrease`). Start of layout sets `ydecrease = 187.5*0.7` and `xdecrease = 360*0.7`, and nothing changes them during a run. `GameSpeed` grows every tick, but it is only read at start of layout, while it is still 0.7, so the original game has no speed-up. Retry resets the globals and restarts the layout.

The shim polls for the Construct runtime, then listens to `tick`. While `movON` is 1 it captures the game's `ydecrease` and `|xdecrease|` at the start of the run and writes them back every tick, multiplied by `speedMultiplier` x (1 + ramp). The sign of `xdecrease` (the ball's direction) is kept, and each sign flip counts as a tap and adds `speedRampPerTap`% to the ramp. It writes nothing before the first tap or after a run ends, so the game's own values are back on Retry.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: speedMultiplier 0.7 (slow)
- **Key 2**: speedMultiplier 0.85
- **Key 3**: speedMultiplier 1.0 (default)
- **Key 4**: speedMultiplier 1.3 (fast)
- **Key 5**: speedMultiplier 1.6 (very fast)
- **Key 6**: speedRampPerTap 0 (default: constant speed)
- **Key 7**: speedRampPerTap 1 (gentle speed-up)
- **Key 8**: speedRampPerTap 2.5 (steep speed-up)
- **Key 9**: hard mode: speedMultiplier 1.3, speedRampPerTap 2

## How it was tested

Headless Chrome against the static build. A test-only autopilot flipped `xdecrease` the way a tap does to keep runs alive; speeds were measured from tile and ball positions over game time.

- Defaults: `ydecrease` 131.25, `xdecrease` ±252; tiles measured at 131.25 px/s (the original game's values).
- `speedMultiplier` 1.5 mid-run: tiles 196.9 px/s, ball 372 px/s; 0.7: tiles 91.9 px/s. Out of range: 5 → 1.8, 0.1 → 0.6.
- `speedRampPerTap` 2: no jump when set; after 4, 9, 12, 18, 24 turns the speed was 1.08, 1.18, 1.24, 1.36, 1.48x, matching 1 + 0.02 x turns. With `speedMultiplier` 1.8 and `speedRampPerTap` 3 it stops at 2.5x.
- Set through `ADJUST_GAME` before the runtime loaded: `speedMultiplier` 1.4 applied from the first tap; `speedRampPerTap` 10 clamped to 3 (one tap → 1.442x). Unknown names and non-numeric values log a warning.
- Retry: the game's own 131.25 / 252 are back until the first tap; then the next run starts at the set `speedMultiplier` (1.2x), and two real taps with 1%/tap give 1.22x.

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
