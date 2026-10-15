# Photo Hunt: backend configuration

`game-scoring-config.json` is Photo Hunt's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `photo-hunt` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `photo-hunt-…`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON, and **delete the retired `seconds_on_clock`, `tilt_seconds` and `tilt_misses`** if they're there. (The shim still converts `seconds_on_clock` and accepts `tilt_misses`, but one name per lever keeps the model's choices clear.) Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
