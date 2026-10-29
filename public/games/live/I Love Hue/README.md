# I Love Hue

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (`SWAP`, see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`. It is a Construct 3 export whose game scripts (`Board.js`, `MainScene.js`... in `ILoveHue.c3p`) are bundled into `static/scripts/c3runtime.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range. **Both apply from the next level started or restarted**, not to the board in play.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `shuffleShare` | float | 0.25 - 1.0 (1.0) | Share of a level's movable tiles that start shuffled. The rest start in place and are pinned with a dot. Seeded by the level number, so a level looks the same each time at a given value. |
| `colorContrast` | float | 0.5 - 1.5 (1.0) | Scales each tile's colour difference from the level's average colour. Lower = neighbours harder to tell apart. |

How: the 50 levels live in `static/game_data.json`. Each map entry has a `realCoordinate` (where the tile belongs), a `swapCoordinate` (where the shuffle puts it) and `isFixed`; the game's shuffle is a permutation of the movable tiles. The game keeps the parsed JSON and reads a level's map each time the level starts, so the shim catches that parse (its only `{levels: [...]}`) and rewrites every level in place from a pristine copy whenever a knob changes. Pinning a tile takes it out of its shuffle cycle (a → b → c → a without b becomes a → c → a), so the rest is still a valid shuffle; the shim pins as many tiles as it can while at least the requested share, and never fewer than two tiles, stays shuffled.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: shuffleShare 0.25 (a few tiles shuffled)
- **Key 2**: shuffleShare 0.5
- **Key 3**: shuffleShare 0.75
- **Key 4**: shuffleShare 1 (default)
- **Key 5**: colorContrast 1.5 (vivid)
- **Key 6**: colorContrast 1.25
- **Key 7**: colorContrast 1 (default)
- **Key 8**: colorContrast 0.75
- **Key 9**: hard mode: shuffleShare 1, colorContrast 0.5

Press a key, then the restart button (or pick a level) to see it.

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
