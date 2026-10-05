# Dungeon Runner — backend configuration

The Skillprint backend (marketplace repo, `api_backend/scoring/models.py::GameScoringConfig`) decides parameter adjustments from gameplay screenshots. It needs three things for the `dungeon-runner` game:

1. `parameter_definitions` — the adjustable parameters with type, min, max, default, description and `adjustment_guide`.
2. `adjustment_instructions` — how to reason about mood-targeted sessions.
3. `skill_adjustment_instructions` — how to reason about skill-targeted sessions.

All three live in `game-scoring-config.json`, generated from the game's own parameter registry:

```bash
node "public/games/live/Dungeon Runner/backend/export-config.mjs"
```

## Registering the game

1. Create the game in the backend catalog (Django admin → Games) with slug `dungeon-runner`, name "Dungeon Runner", orientation landscape, exit button TOP_RIGHT.
2. On that game, tick the **moods** and **skills** it supports. Session create validates `targetMood` / `targetSkill` against these lists, so an empty list rejects every session with `Mood 'Focus' is not available for game 'dungeon-runner'. Available moods: []`.
   Suggested moods: relax, focus, grit, joy, awe, curiosity. Suggested skills: perceptual-speed, timing, attention, action, spatial, planning, task-switching.
3. Parameter definitions are auto-provisioned: the portal fetches this folder's `game-scoring-config.json` (see `parameterManifest` in `app/config/gameConfig.ts`) and sends `sdk_game_parameters` as `gameParameters` on session create; `games/views.py::_merge_game_parameters` creates the `GameScoringConfig` on first play. That path stores `default = min` and no mood/skill guidance, so for the best adjustments also open Django admin → Scoring → Game Scoring Configs → dungeon-runner and paste `parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions` from the JSON (admin values win; auto-provisioning never overwrites them).

## Runtime contract (unchanged from other games)

- The portal forwards `screenshot` messages from the iframe to `/games/api/record-session/{id}/` and polls `/games/api/sessions/{id}/`.
- The newest `telemetry[].adjustment` is posted into the iframe as `{ type: 'ADJUST_GAME', data: { parameterName, parameterValue } }` at most once every 30 s.
- The game applies it through `window.adjustGame`, clamps to the defined range, and shows a "SKILLPRINT" toast on the HUD.
