# Photo Hunt Skillprint Integration

This game is integrated with the Skillprint portal: screenshots via `SkillprintLib`, gameplay events via `logEvent` (see `Documentation.txt`), and difficulty knobs via `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and applied immediately, to the puzzle in play and every later one.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `timeMultiplier` | float | 0.25 - 2 (1.0) | Time per puzzle as a multiple of the puzzle's own (120 s for all 12 today). The puzzle in play rescales: its time left keeps the same fraction of the clock, including while paused or still loading. |
| `missPenaltySeconds` | float | 0 - 10 (0) | Seconds taken off the clock by each wrong tap. The miss's `TAP` event then carries `penalty_ms`. A penalty can run the clock out (`LEVEL_FAILED`). |
| `tiltMisses` | integer | 1 - 10 (3) | Wrong taps allowed within 1 s before taps lock for 1 s ("TILT!", logged as a `TILT` event). The lockout fires on the (tiltMisses + 1)th quick miss. |

Retired:
- `seconds_on_clock` was never read: every puzzle sets its own time in `puzzles/puzzles.xml`. The shim converts it to `timeMultiplier` against the current puzzle's time.
- `tilt_seconds`: ignored with a warning. The tilt window stays 1 s.
- `tilt_misses` is renamed `tiltMisses`; the old name still works.

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: `timeMultiplier` 2.0 (4 min per puzzle)
- **Key 2**: `timeMultiplier` 1.5
- **Key 3**: `timeMultiplier` 1.0 (default)
- **Key 4**: `timeMultiplier` 0.75
- **Key 5**: `timeMultiplier` 0.5
- **Key 6**: `timeMultiplier` 0.25 (30 s per puzzle)
- **Key 7**: `missPenaltySeconds` 0 (default)
- **Key 8**: `missPenaltySeconds` 5
- **Key 9**: hard mode: `timeMultiplier` 0.4, `missPenaltySeconds` 5, `tiltMisses` 1

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
