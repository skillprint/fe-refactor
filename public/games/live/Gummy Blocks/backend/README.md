# Gummy Blocks: backend configuration

`game-scoring-config.json` is Gummy Blocks' `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the game page fetches this file (`parameterManifest` for `gummy-blocks` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` **adds** new parameter names (here `maxPieceCells`). It never removes or overwrites existing ones. The AI Guide doesn't send a manifest; it uses whatever config the backend already has.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `gummy-blocks-…`). This matters more here than for other games, because the config seeded by migration 0009 is wrong for the current game:
  - **Delete** `boardRows`, `boardCols` and `gameSpeed` (the game ignores them) and `scoreMultiplier` (not a difficulty knob).
  - **Replace** `piecesToPlace`: 0009 gives it a 1-5 range and describes it backwards ("pieces available", more = easier), so the model sends 4-5 for relax, which the game rejects. In the game it's 1-3 and higher is harder.
  - **Paste** `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON; 0009's instructions also describe board sizes and FPS.
  - Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
- **Legacy rules:** until marketplace#121 merges, the legacy rule engine (`generate_gummyblocks_adjustment` in `scoring/hextrix.py`) can still run for this game when the model returns no valid update, sending the 0009 parameter set. The shim ignores the board and speed names and rejects `piecesToPlace` 4-5.
