# Flapcat Steampunk 2: backend configuration

`game-scoring-config.json` is Flapcat Steampunk 2's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Auto-provisioning:** the portal fetches this file (`parameterManifest` for `flapcat-steampunk-2` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` creates the config on first play and **adds** new parameter names. It never removes or overwrites existing ones.
- **No backend `Game` yet.** marketplace has no Flapcat Steampunk 2 record (the fixture has only `flapcat-steampunk-…`), so the portal can't start a session for it and this manifest isn't used yet. `game_slug` is the portal slug; replace it with the real slug once the `Game` exists, then paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` in Django admin (Scoring → Game Scoring Configs).
- The game's catalog record needs its moods and skills ticked, or session create rejects the requested mood.
