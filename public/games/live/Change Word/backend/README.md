# Change Word: backend configuration

`game-scoring-config.json` is Change Word's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `change-word` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `change-word-…`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON, and **delete the retired `timer` parameter** if it's there. (The shim still converts `timer` to `timeMultiplier`, but one name per lever keeps the model's choices clear.) Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
