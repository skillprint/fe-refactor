# Cut The Rope: backend configuration

`game-scoring-config.json` is Cut The Rope's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `cut-the-rope` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Slug:** `cut-the-rope`, the portal slug. marketplace's `games_fixture.json` has no Cut The Rope record, so confirm the server's `Game` slug before the admin step and update `game_slug` here if it differs.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `cut-the-rope`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON. Admin values win; auto-provisioning never overwrites them. If the server already has a config for this game with other names (the old shim offered `scoreMultiplier` and `timeLimitSeconds`), remove them there: auto-provisioning only adds names.
- The game's catalog record needs its moods and skills ticked, or session create rejects the requested mood.
