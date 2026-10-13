# Brick Out: backend configuration

`game-scoring-config.json` is Brick Out's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `brick-out` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `brick-out-…`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON, and **delete any retired parameters** (`MAX_VELOCITY_LIMIT`, `MIN_VELOCITY_LIMIT`, `TIME_BOUNCE_BALL`, or their camelCase forms) so the model can't choose them. Admin values win; auto-provisioning never overwrites them. Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
- The game's catalog record needs its moods and skills ticked, or session create rejects the requested mood.
