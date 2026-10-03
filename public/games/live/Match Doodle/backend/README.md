# Match Doodle: backend configuration

`game-scoring-config.json` is Match Doodle's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `match-doodle` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `match-doodle-2-…`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON. If a `pairs` parameter already exists, update its description and range (2-40) to match; the name is unchanged. Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
