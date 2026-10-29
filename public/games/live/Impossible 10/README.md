# Impossible 10

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. It is a Construct 3 export (720x1280 portrait).

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is rounded and clamped to its range. Both hold across restarts. At their defaults the shim leaves the game's own rolls alone.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `spawnSpread` | integer | 2 - 6 (4) | How many different numbers a new block can show: uniformly, the `spawnSpread` highest values up to the game's current `maxBlock` (never below 1). 4 = the game's own roll. Applies to blocks spawned from now on. |
| `startBoardSpread` | integer | 2 - 6 (3) | Highest number on the starting board: values 1 to `startBoardSpread`, with 1 twice as likely as each of the others. 3 = the game's own board. Applies from the next game start or restart. |

How the numbers work (`ES_Game` sheet): a block's animation frame is its value minus one. Start of layout (the game's start and every restart) sets each of the 25 blocks to `choose(0,0,1,2)`: values 1 (50%), 2 or 3 (25% each). After a merge, the blocks above fall and the five launchers spawn new ones with frame `floor(random(maxBlock-4, maxBlock))`. That gives one of the four values `maxBlock-3` to `maxBlock`, each 25%. A frame below 0 clamps to 0, so value 1 is 50% while `maxBlock` is 3. A 10 is turned into a 9. `maxBlock` starts at 3 and goes up by one each time a merge makes a block above it. The game ends when no two neighbours match.

Spawn values (1-based) by setting, uniform over the listed values:

| `maxBlock` | 2 | 3 | 4 (game's own) | 5 | 6 |
|---|---|---|---|---|---|
| 3 (start) | 2-3 | 1-3 | 1 (50%), 2, 3 | 1-3 | 1-3 |
| 7 | 6-7 | 5-7 | 4-7 | 3-7 | 2-7 |

The shim polls for the Construct runtime, then:
- watches `instancecreate` on `block` while the Game layout runs, and re-rolls each new block's frame on the next `tick` (one frame after the game set it);
- listens to the Game layout's `afterlayoutstart`, which fires right after the start-of-layout events dealt the board. There it re-rolls the 25 blocks and drops them from the spawn queue.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: spawnSpread 2 (new blocks: top two numbers only)
- **Key 2**: spawnSpread 3
- **Key 3**: spawnSpread 4 (default)
- **Key 4**: spawnSpread 5
- **Key 5**: spawnSpread 6 (widest mix)
- **Key 6**: startBoardSpread 2 (easy start: 1s and 2s)
- **Key 7**: startBoardSpread 3 (default)
- **Key 8**: startBoardSpread 5 (mixed start)
- **Key 9**: hard mode: spawnSpread 6, startBoardSpread 6

## How it was tested

Headless Chrome against the static build. Spawns were forced by knocking random blocks off the board, so the launchers refilled it, with `maxBlock` pinned (test only). Each spawned block's value was read three ticks after it was created.

- `spawnSpread` 4 (default), `maxBlock` 3: 1 ×205, 2 ×92, 3 ×104 (the game's 50/25/25); `maxBlock` 7: 4-7 about 25% each.
- `spawnSpread` 2: `maxBlock` 3 → only 2 and 3; `maxBlock` 7 → only 6 and 7.
- `spawnSpread` 6: `maxBlock` 3 → 1-3 about a third each; `maxBlock` 7 → 2-7 about a sixth each. 9 clamps to 6; 2.6 rounds to 3 (5-7 at `maxBlock` 7).
- Starting boards (12 boards each): `startBoardSpread` 3 → 1 ×147, 2 ×78, 3 ×75 (the game's own); 2 → 1 ×193, 2 ×107; 6 → 1 ×95, 2-6 ×34-51 each.
- Real play with `spawnSpread` 2 and `startBoardSpread` 2: the board started with only 1s and 2s. Eight real taps merged groups (score 0 → 54), and all 28 new blocks were 2 or 3. After the game's own restart button, the board was again only 1s and 2s.
- A `startBoardSpread` of 0 sent before the game started clamps to 2. Unknown names and non-numeric values log a warning.

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
