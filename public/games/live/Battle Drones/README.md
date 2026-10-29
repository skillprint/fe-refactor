# Battle Drones

Battle Drones is by Simon Willison: https://github.com/simonw/battledrones (Apache License 2.0, see LICENSE).

`static/` is a build of upstream commit ca4f13b with Skillprint's changes, which connect the game to the
Skillprint portal (tuning, screenshots, score, telemetry events). Those changes and the build are in
`scripts/battle-drones/` in the skillprint-rewrite repository: `skillprint.patch` lists every file changed.
`backend/game-scoring-config.json` holds the backend's parameter definitions and mood instructions.
`battle-drones.jpg` is upstream's menu key art, resized.
