#!/usr/bin/env node
/**
 * Writes game-scoring-config.json, the GameScoringConfig payload for the
 * Skillprint backend, from the game's own parameter list (static/src/params.js),
 * so the two never drift.
 *
 *   node public/games/live/Equilibrium/backend/export-config.mjs
 *
 * The portal sends `sdk_game_parameters` on session start (gameConfig's
 * parameterManifest). `parameter_definitions`, `adjustment_instructions` and
 * `skill_adjustment_instructions` go to
 * PATCH /scoring/api/games/equilibrium/scoring-config/.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARAMETERS } from '../static/src/params.js';

const here = dirname(fileURLToPath(import.meta.url));

const BACKEND_TYPE = { Float: 'number', Integer: 'integer', Boolean: 'boolean' };

const adjustment_instructions = `You are adjusting parameters for Equilibrium, a 3D puzzle about balancing a hanging mobile in the style of Alexander Calder.
Each mobile is one or more steel beams, each pivoting at its middle, with hooks at whole-number distances (1 to 5) either side; a beam can hang from another beam's hook. Some painted weights are riveted in place; the loose ones wait on a shelf, and the player drags or taps them onto free hooks. A beam is level when the weight × distance on its left equals its right, where a hanging beam weighs everything below it. A mobile is balanced when every loose weight is hung and every beam is level. With live tilt the beams swing as weights go on; without it they're held level until the player presses Release, and a failed release costs 30 points. A candle burns down on each mobile; if it goes out the solution is shown and the next mobile stays on the same rung.

Each frame is stamped top left with the mobile number, rung and score, the loose weights still on the shelf, the candle time left, and how many beams are level. Events: LEVEL_START (mobile, rung, beams, trayWeights, reach, maxWeight, liveTilt, hintLevel, candleSec), HANG (weight, beam, distance, side, torque = weight × distance, from, msSinceLast), UNHANG (weight, beam, distance, msSinceLast), MATCH (a beam has just become level: beam, torque, mass), RELEASE (balanced, offBeams), UNMATCH (a failed release: offBeams, penalty), LEVEL_COMPLETE (ms, moves, releases, failedReleases, candleLeft, points, score), LEVEL_FAILED (the candle went out: placed, trayLeft) and LEVEL_QUIT.

Five parameters are exposed:
- levelOffset (integer, -3 to 3): shifts the rung of the NEXT mobile: more beams (1 up to 4), longer arms (3 to 5 hooks a side) and more loose weights (1 up to 6). Higher is harder. Never takes effect mid-mobile.
- maxWeight (integer, 6-15): the largest weight in the NEXT mobile; bigger numbers mean bigger products to hold in mind. Higher is harder.
- hintLevel (integer, 0-2): 0 shows only the tilt; 1 writes each hanging sub-mobile's total weight on its wire; 2 also shows each arm's weight × distance total. Higher is easier. Applies at once.
- liveTilt (boolean): true lets the beams tilt as weights are hung, so trial and error works; false holds them level until Release, so the player must calculate first. false is harder. Applies at once.
- candleScale (number, 0.5-2.5): multiplies the candle, 45 s plus 25 s per loose weight. Higher is easier. Applies at once, stretching or shrinking the time left in proportion.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': liveTilt true, hintLevel 2, candleScale ~2.2, maxWeight ~7, levelOffset -2 to -1 — a slow, forgiving hang where the tilt and the sums show the way
- For 'focus': liveTilt true, hintLevel 0-1, candleScale ~1.0, maxWeight ~9, levelOffset 0 — the game as designed: read the tilt, do the arithmetic, keep pace with the candle
- For 'grit': liveTilt false, hintLevel 0, candleScale ~0.7, maxWeight 12-15, levelOffset +1 to +2 — plan the whole mobile in your head, then commit; bigger numbers, deeper mobiles, a short candle
- For 'awe': liveTilt true, hintLevel 1, candleScale ~1.8, maxWeight ~8, levelOffset -1 to 0 — time to watch the mobile swing and turn; deeper mobiles are fine as long as the arithmetic stays light

Consider the player's current performance: if flow score is low and cognitive
load is high, the mobile is likely too hard: ease off (raise candleScale first, then hintLevel, then switch liveTilt on; lower levelOffset or maxWeight for the next mobile after a LEVEL_FAILED). Many HANG/UNHANG pairs on the same weight with short msSinceLast mean the player is guessing: in held mode raise hintLevel by one; in live mode that guessing is fine, but if it goes on raise hintLevel. Repeated UNMATCH (failed releases) mean the player can't yet hold the whole mobile in mind: switch liveTilt on, or lower levelOffset. If arousal is low and attention is dropping, or mobiles are balanced with much of the candle left, increase challenge (lower hintLevel, then raise maxWeight by 3, then raise levelOffset by one, then switch liveTilt off).

Always adjust gradually from the current parameter values to avoid jarring transitions: at most one step on levelOffset and hintLevel, 3 on maxWeight and 0.3 on candleScale at a time, and switch liveTilt at most once per mobile. levelOffset and maxWeight only take effect on the next mobile.`;

const skill_adjustment_instructions = `Equilibrium trains mental arithmetic (multiplying weights by distances, adding torques along an arm, summing a sub-mobile's total weight) and the reasoning that turns it into placements: solving for a missing weight or distance, factoring a torque into weight × distance pairs that fit the free hooks, and working a nested mobile from the bottom up. Read the shelf, the candle and "Beams level N of M" from the stamp at the top left of each frame; HANG events carry the torque each placement adds and msSinceLast, the time spent deciding.

Per-skill levers (primary first):
- math: raise maxWeight (bigger products and sums) and lower hintLevel to 0 so no totals are shown; switch liveTilt off so the arithmetic has to be done rather than read off the tilt. Ease off by raising hintLevel when HANG/UNHANG churn shows the arithmetic is the bottleneck.
- deduction: switch liveTilt off and lower hintLevel, so each placement has to be reasoned out before Release; raise levelOffset so loose weights must be split between beams.
- planning: raise levelOffset (more beams hanging from beams, more loose weights) so the order of placement matters: a sub-mobile's weight has to be settled before its parent can balance; lower candleScale slightly once mobiles are solved with time to spare.

Move one or two parameters per adjustment, by the same small steps as the mood guidance; change levelOffset and maxWeight only between mobiles.`;

const definitions = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, {
  type: BACKEND_TYPE[p.type],
  min: p.minValue,
  max: p.maxValue,
  default: p.defaultValue,
  description: p.description,
  adjustment_guide: p.howSDKChangesIt,
}]));

const config = {
  game_slug: 'equilibrium',
  is_enabled: true,
  parameter_definitions: definitions,
  adjustment_instructions,
  skill_adjustment_instructions,
  notes: 'Generated by backend/export-config.mjs from static/src/params.js, the list the game also hands to skillprint-js-sdk. liveTilt is a boolean (min 0, max 1, as the backend stores booleans); the game accepts true/false, "true"/"false" and 1/0. Keys 1-9 in GameAdjustmentTester and static/iframeTest.html send the presets listed in GAME_PARAMETERS.MD.',
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
