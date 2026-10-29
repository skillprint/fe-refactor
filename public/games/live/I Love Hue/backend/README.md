# I Love Hue: backend configuration

`game-scoring-config.json` is I Love Hue's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `i-love-hue` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `i-love-hue-115ad80c-adb3-47fb-8be7-4b683133a94e`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON. Admin values win; auto-provisioning never overwrites them. Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
- The game's catalog record needs its moods and skills ticked, or session create rejects the requested mood.
