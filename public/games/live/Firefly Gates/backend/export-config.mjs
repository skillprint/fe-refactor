#!/usr/bin/env node
/**
 * Writes game-scoring-config.json, the GameScoringConfig payload for the
 * Skillprint backend, from the game's own parameter list (static/src/params.js),
 * so the two never drift.
 *
 *   node "public/games/live/Firefly Gates/backend/export-config.mjs"
 *
 * The portal sends `sdk_game_parameters` on session start (gameConfig's
 * parameterManifest). `parameter_definitions`, `adjustment_instructions` and
 * `skill_adjustment_instructions` go to
 * PATCH /scoring/api/games/firefly-gates/scoring-config/.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARAMETERS } from '../static/src/params.js';

const here = dirname(fileURLToPath(import.meta.url));

const BACKEND_TYPE = { Float: 'number', Integer: 'integer', Boolean: 'boolean' };

const adjustment_instructions = `You are adjusting parameters for Firefly Gates, a 3D arithmetic runner.
The player steers a swarm of fireflies down a forest path. Rows of two gates (three from rung 5) stand across the path, each showing an operation: +12, −8, ×3, ÷2 (division rounds down), and from rung 6 two-step gates like "×2 −5". Flying through a gate applies it to the swarm's count. Every operation keeps order (a bigger swarm in never gives a smaller swarm out), so taking the gate that leaves more at each row is always best; rows pair close results and often make the gate with the bigger-looking number the worse one, so the player has to do the sums. Moths drift between rows and eat part of the swarm on contact. At the end of each stage stands a beacon carved with a number; arriving with at least that many fireflies lights it. A stage fails if the swarm arrives short or reaches zero.

Each frame is stamped top left with the stage, rung and score, the swarm count and the beacon's number, and the next row's gates. The swarm's count also floats in glowing numerals under the swarm. Events: LEVEL_START (stage, rung, rows, gatesPerRow, start, beacon, best possible), MATCH (the best gate taken) and UNMATCH (a worse one), each with before, after, chosen, others, otherResults, best, lost, trap (the bigger-looking number was the worse gate), decisionMs and timeAvailableMs; GENERIC_NEGATIVE (a moth bite: before, lost, after); LEVEL_COMPLETE (beacon lit) and LEVEL_FAILED (reason "beacon" or "swarm-lost"), each with final, beacon, best, optimalGates, rows, mothHits, points; LEVEL_QUIT; GAME_PAUSE / GAME_RESUME; GAME_END.

Six parameters are exposed:
- runSpeed (number, 0.6-1.8): forward speed, about 3.5 s between rows at 1.0. Higher is harder. Applies at once.
- gateTrickiness (number, 0-1): how close the gates' results are and how often the bigger-looking number is the worse gate (30% of rows at 0, 80% at 1). Higher is harder. From the next stage.
- numberScale (number, 0.5-3): size of the starting swarm and of the numbers the count lives in. Higher means bigger arithmetic. From the next stage.
- beaconStrictness (number, 0.6-1.0): the beacon's number as a share of the best possible finish. Higher is harder; 1.0 needs a flawless run. From the next stage.
- hazardDensity (number, 0-2): moths per gap between rows. Higher adds dodging. Applies to moths that appear from now on; 0 clears those ahead.
- levelOffset (integer, -3 to 3): shifts the rung of the NEXT stage: more rows (6 to 12), bigger operands and count band, three gates per row from rung 5, two-step gates from rung 6. Higher is harder. Never mid-stage.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': runSpeed ~0.7, gateTrickiness ~0.2, numberScale ~0.6-0.8, beaconStrictness ~0.7, hazardDensity ~0.3, levelOffset -1 to -2 — an unhurried glide where the sums are friendly and the beacon forgives a slip
- For 'focus': runSpeed ~1.0, gateTrickiness ~0.5, numberScale ~1.0, beaconStrictness ~0.9, hazardDensity ~1.0, levelOffset 0 — the game as designed: steady rows that reward working each sum out
- For 'grit': runSpeed ~1.4, gateTrickiness ~0.85, numberScale ~1.5-2.5, beaconStrictness ~0.97, hazardDensity ~1.5, levelOffset +1 to +2 — fast rows of near-equal results where the bigger number usually lies, and a beacon that wants nearly every best gate
- For 'joy': runSpeed ~1.1, gateTrickiness ~0.35, numberScale ~1.0, beaconStrictness ~0.8, hazardDensity ~0.8, levelOffset -1 to 0 — a lively pace where the swarm grows big and bright and most beacons light

Consider the player's current performance: if flow score is low and cognitive load is high, the game is likely too hard — ease off (lower runSpeed first, then hazardDensity, then gateTrickiness and beaconStrictness for the next stage). Read MATCH and UNMATCH: UNMATCH on rows with trap true means the player is comparing the printed numbers instead of the results — lower gateTrickiness a step rather than speeding up. Short decisionMs with many UNMATCH means guessing under time pressure: lower runSpeed. GENERIC_NEGATIVE in bursts means the moths are crowding out the arithmetic: lower hazardDensity. If arousal is low and nearly every gate is a MATCH with plenty of timeAvailableMs, the player may be bored — raise runSpeed, then gateTrickiness or numberScale, then levelOffset by one for the next stage once a beacon is lit with a surplus.

Always adjust gradually from the current parameter values to avoid jarring transitions: at most 0.2 on runSpeed, 0.2 on gateTrickiness, 0.5 on numberScale, 0.08 on beaconStrictness, 0.5 on hazardDensity and one step on levelOffset at a time. gateTrickiness, numberScale, beaconStrictness and levelOffset only take effect when the next stage is built, so change them once per stage.`;

const skill_adjustment_instructions = `Firefly Gates trains mental arithmetic and number sense under time pressure (math): comparing the results of two operations on the same number (n×3 against n+40, n−8 against n÷2), with perceptual speed (reading a row as it emerges from the mist and committing before it arrives) and action (steering through the right gate while dodging moths). Read the swarm count, the next row and the beacon from the stamp at the top left of each frame; MATCH and UNMATCH events carry every number involved, whether the row was a trap, and how long the player had.

Per-skill levers (primary first):
- math: raise gateTrickiness (closer results, more rows where the bigger-looking number lies), then numberScale (bigger operands), then levelOffset (three-gate rows from rung 5, two-step gates from rung 6). Keep runSpeed at or below 1.1 so accuracy, not reaction, is what's measured.
- perceptual-speed: raise runSpeed toward 1.3-1.5 while holding gateTrickiness near 0.5, so the same sums must be read and decided faster.
- action: raise hazardDensity toward 1.5 and runSpeed a little, so steering and dodging carry more of the load; keep gateTrickiness moderate.

Move one or two parameters per adjustment, by the same small steps as the mood guidance, and change the next-stage parameters only between stages.`;

const definitions = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, {
  type: BACKEND_TYPE[p.type],
  min: p.minValue,
  max: p.maxValue,
  default: p.defaultValue,
  description: p.description,
  adjustment_guide: p.howSDKChangesIt,
}]));

const config = {
  game_slug: 'firefly-gates',
  is_enabled: true,
  parameter_definitions: definitions,
  adjustment_instructions,
  skill_adjustment_instructions,
  notes: 'Generated by backend/export-config.mjs from static/src/params.js, the list the game also hands to skillprint-js-sdk. Keys 1-9 in GameAdjustmentTester and static/iframeTest.html send the presets listed in the README.',
  sdk_game_parameters: PARAMETERS.map((p) => ({
    name: p.parameterName,
    type: p.type,
    description: p.description,
    adjustment_guide: p.howSDKChangesIt,
    min_value: String(p.minValue),
    max_value: String(p.maxValue),
  })),
};

writeFileSync(join(here, 'game-scoring-config.json'), `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${join(here, 'game-scoring-config.json')}`);
