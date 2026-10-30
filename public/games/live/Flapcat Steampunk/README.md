# Flapcat Steampunk

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, and difficulty knobs via `static/skillprintShim.js`. It is a Construct 3 export (1280x720 landscape).

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range. They hold across runs: the shim reapplies them to every wall pair the game spawns.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `wallSpeed` | float | 0.6 - 1.6 (1.0) | Wall scroll speed as a multiple of the game's 300 px/s. Pairs keep their spacing, so they also come more often. Applies to the walls on screen. |
| `gapSize` | integer | 140 - 320 (200) | Opening between a pair of walls, in px. Applies to pairs spawned from now on. The scoring sensor stretches with it, so every way through still scores. |
| `gapVariation` | float | 0.0 - 1.5 (1.0) | How far the opening moves between pairs, as a multiple of the game's own (`wall_create`'s Sine magnitude, re-rolled to about 90-120 px as it plays). 0 = every opening at the same height. |

How the walls work: pairs spawn from `wall_create`, an emitter that bobs up and down (Sine) off-screen to the right. `wall_up` sits above its top image point and `wall_down` below its bottom one, 200 px apart, with `point_cat` (the scoring sensor) between them. All three scroll left with the `wall` family's Bullet behavior. A new pair spawns when a `point_cat` reaches `wall_create_go`, so pairs are a fixed distance apart.

`static/scripts/main.js` runs the Construct runtime on the page (`useWorker: false`, as Flapcat Steampunk 2 does) so the shim can reach it; in a worker it couldn't.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: gapVariation 0 (every opening at the same height)
- **Key 2**: wallSpeed 0.7 (slow)
- **Key 3**: wallSpeed 1.0 (default)
- **Key 4**: wallSpeed 1.3 (fast)
- **Key 5**: wallSpeed 1.6 (very fast)
- **Key 6**: gapSize 280 (wide openings)
- **Key 7**: gapSize 200, gapVariation 1 (default openings)
- **Key 8**: gapSize 150 (narrow openings)
- **Key 9**: hard mode: wallSpeed 1.4, gapSize 150, gapVariation 1.5

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
