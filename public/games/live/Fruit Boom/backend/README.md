# Fruit Boom: backend configuration

`game-scoring-config.json` is Fruit Boom's `GameScoringConfig` (marketplace `api_backend/scoring/models.py`): `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`, plus `sdk_game_parameters`.

- **Game record.** Nothing in marketplace's code creates a Fruit Boom `Game`; `game_slug` here is the slug from the games fixture and the portal's cover image. Confirm the record and its slug in production (Django admin → Games).
- **Auto-provisioning:** the game page fetches this file (`parameterManifest` for `fruit-boom` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create. `games/views.py::_merge_game_parameters` **adds** new parameter names. It never removes or overwrites existing ones. The AI Guide doesn't send a manifest; it uses whatever config the backend already has.
- **Do once in Django admin** (Scoring → Game Scoring Configs → `fruit-boom-…`). Marketplace migration 0009 seeds a Fruit Ninja config for every slug starting `fruit-` (Fruit Sorting got it too):
  - **Delete** `fruitSpawnRate`, `bombSpawnChance`, `pointsPerFruit` and `gameSpeedMultiplier`. The game reads none of them.
  - **Paste** `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON; 0009's instructions describe the old parameters.
  - Alternatively, `PATCH /scoring/api/games/<slug>/scoring-config/` with the same fields.
- **Legacy rules:** `generate_fruit_ninja_adjustment` in `scoring/hextrix.py` also targets `fruit-` slugs. Since marketplace#121 it only runs for games without an enabled config (once #121 is in production).
