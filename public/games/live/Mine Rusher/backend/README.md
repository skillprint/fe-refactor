# Mine Rusher: backend configuration

`game-scoring-config.json` is Mine Rusher's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `mine-rusher` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `mine-rusher-08ac08e4-61d5-4ac8-8cef-d29273cf8448`): paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON. Admin values win; auto-provisioning never overwrites them. Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
- The `Game` (id 62) is in marketplace's fixture but not in the live `map.json`, so check it exists on the live backend before relying on this.
- The game's catalog record has no moods or skills mapped yet. Tick them (relax, focus, grit, joy; timing, action, perceptual speed, attention), or session create rejects the requested mood.
