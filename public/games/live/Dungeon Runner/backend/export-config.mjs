#!/usr/bin/env node
/**
 * Generates game-scoring-config.json — the GameScoringConfig payload for the Skillprint
 * backend (marketplace/api_backend/scoring/models.py) — from the game's own parameter
 * registry so the two never drift.
 *
 *   node "public/games/live/Dungeon Runner/backend/export-config.mjs"
 *
 * Paste `parameter_definitions`, `adjustment_instructions` and
 * `skill_adjustment_instructions` into the Django admin for the `dungeon-runner` game,
 * or load the file with a management command.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toBackendDefinitions, toSdkParameterInfos } from '../static/js/params.js';

const here = dirname(fileURLToPath(import.meta.url));

const adjustment_instructions = `Dungeon Runner is a first-person endless runner-shooter: the player auto-runs down a
3-lane dungeon corridor, dodges obstacles (barrels: jump or shoot; low beams and blades:
slide; pits: jump; gates: pick the open lane) and shoots imps (melee rushers) and
skeleton archers (ranged). The HUD shows HEALTH (bottom left), SCORE / metres / kills /
accuracy (top left), the current WEAPON and ammo (bottom right), and "SKILLPRINT" toasts
(top right) for adjustments already applied. Read health, accuracy, kills and the number
of visible enemies/hazards from the frames.

General rules:
- Change at most two parameters per chunk and prefer the smallest step that moves the
  player toward the target. The engine only applies one adjustment every 30 seconds, so
  each single change must be safe on its own.
- Never raise playerSpeed and enemySpawnRate in the same chunk.
- If health is below 30 or the player was hit twice or more since the last chunk, ease
  off first (hazardTelegraphTime up, enemyAggression down) before anything else.
- weaponType is a hard switch (0 pistol, 1 shotgun, 2 plasma); change it at most once
  per two minutes.

Target mood guidance:
- relax: playerSpeed 6-8, enemySpawnRate 0-1, enemyAggression <= 0.15, obstacleDensity
  <= 0.25, hazardTelegraphTime >= 1.8, lightLevel >= 1.1, weaponType 2. Bright, slow, safe.
- focus: playerSpeed 10-13, enemySpawnRate 2-4, obstacleDensity ~0.4,
  hazardTelegraphTime 0.8-1.2, lightLevel 0.5-0.7 (dim narrows attention), weaponType 0
  (precision). Keep the challenge steady; avoid big swings.
- grit: ramp playerSpeed toward 16, enemySpawnRate 5-8, enemySpeed 1.3-1.8,
  enemyAggression 0.7-1, obstacleDensity 0.7-1, hazardTelegraphTime 0.5-0.8, weaponType 1,
  weaponDamage 0.7-0.9. Push until the player struggles, ease off one notch, push again.
- joy: enemySpawnRate 5-8 with enemyHealth 1, enemySpeed <= 0.9, enemyAggression <= 0.3,
  obstacleDensity <= 0.3, weaponDamage >= 1.5, weaponType 2, lightLevel >= 1.0. Lots of
  easy kills and feedback.
- awe: playerSpeed 6-8, enemySpawnRate <= 1, enemyAggression <= 0.2, obstacleDensity
  <= 0.3, hazardTelegraphTime >= 1.6, lightLevel 0.2-0.35. Dark, slow, vast.
- curiosity: keep pace moderate and vary things: rotate weaponType, alternate lightLevel
  between 0.4 and 1.2 across chunks, obstacleDensity 0.3-0.6.
- creativity, collaborate, empathy: not a good fit for this game; behave like focus.`;

const skill_adjustment_instructions = `Dungeon Runner trains reaction, timing and aiming under pressure. Use a sawtooth: raise
the primary lever for the target skill while the player copes, ease off one step after
they fail, then raise again. Read accuracy (top-left HUD), hits taken (health drops) and
kills from the frames.

Per-skill levers (primary first):
- perceptual-speed: hazardTelegraphTime down toward 0.4 (only while accuracy > 70% and
  health is not dropping), then playerSpeed up. Ease off when the player is hit twice.
- timing: obstacleDensity up to 0.8-1.0, enemySpeed up to 1.6. Ease off after
  collisions or pit falls.
- attention: enemySpawnRate up to 6-8 mixed with obstacles, lightLevel down to 0.4-0.5.
  Ease off when accuracy falls under 50%.
- action: enemyHealth up to 3-4, weaponType 1, enemySpawnRate 4-6. Ease off when
  accuracy falls under 40%.
- spatial / visualization: obstacleDensity up, hazardTelegraphTime 0.8-1.0 so lane
  changes must be planned early. Ease off after pit falls or gate hits.
- planning: enemySpawnRate moderate, weaponType 1 (limited ammo), obstacleDensity 0.6.
- task-switching: alternate weaponType every chunk and alternate between high
  obstacleDensity / low enemySpawnRate and the reverse.
- other skills: behave like focus mood guidance.`;

const config = {
  game_slug: 'dungeon-runner',
  is_enabled: true,
  parameter_definitions: toBackendDefinitions(1),
  adjustment_instructions,
  skill_adjustment_instructions,
  notes: 'Generated from public/games/live/Dungeon Runner/static/js/params.js by backend/export-config.mjs. Tier 2 parameters (see GAME_PARAMETERS.MD) are implemented in the game and can be added later.',
  // Same information in the shape the SDK sends as `game_parameters` on session create.
  sdk_game_parameters: toSdkParameterInfos(1),
};

const out = join(here, 'game-scoring-config.json');
writeFileSync(out, JSON.stringify(config, null, 2) + '\n');
console.log(`wrote ${out} (${Object.keys(config.parameter_definitions).length} parameters)`);
