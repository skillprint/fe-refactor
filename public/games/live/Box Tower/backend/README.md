# Box Tower: backend configuration

`game-scoring-config.json` is Box Tower's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the game page fetches this file (`parameterManifest` for `box-tower` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones. The AI Guide doesn't send a manifest; it uses whatever config the backend already has.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `box-tower-…`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON. The parameter names are unchanged, so nothing needs deleting; update the ranges if they differ. Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
