#!/usr/bin/env node
/**
 * Writes game-scoring-config.json, the GameScoringConfig payload for the
 * Skillprint backend, from the game's own parameter list (static/src/params.js),
 * so the two never drift.
 *
 *   node "public/games/live/Mountain Appreciator/backend/export-config.mjs"
 *
 * The portal sends `sdk_game_parameters` on session start (gameConfig's
 * parameterManifest). `parameter_definitions`, `adjustment_instructions` and
 * `skill_adjustment_instructions` go to
 * PATCH /scoring/api/games/mountain-appreciator/scoring-config/.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARAMETERS } from '../static/src/params.js';

const here = dirname(fileURLToPath(import.meta.url));

const BACKEND_TYPE = { Float: 'number', Integer: 'integer', Boolean: 'boolean' };

const adjustment_instructions = `You are adjusting parameters for Mountain Appreciator, a 3D spot-the-difference game played on a pair of procedurally generated twin mountains.
The player orbits and zooms a shared camera around two side-by-side copies of one mountain and clicks the differences between them (trees, water, sky, wildlife, rock and ice, weather, traces of people). Each pair ends when every difference is found, when the light runs out at sunset (or sunrise on night pairs), or when the player lets the sun set early. Wrong clicks on the mountain cost daylight; holding Blink flicks between the twins but speeds up the sun.

Each frame is stamped top left with the pair number, score, "Found N of M" and the time left until dusk or dawn. Gold rings mark found differences, red dashed rings the ones missed at the end of a pair. Events: LEVEL_START (pair, rung, differences, hidden, night, noSunset), MATCH (each find, with daylightLeft), UNMATCH (a wrong click and its penaltySec), SKY_CLICK (a harmless click on empty sky), BLINK (ms held), LEVEL_COMPLETE (all found), LEVEL_FAILED (the light ran out) and LEVEL_QUIT (the player let it go), each with found, differences and points.

Five parameters are exposed:
- daylightScale (number, 0.5-2.0): multiplies the pair's daylight, 40 s plus 22 s per difference at 1.0. Higher is easier. Applies at once, stretching or shrinking the time left in proportion.
- missPenaltySec (number, 0-20): daylight lost per wrong click on the mountain. Higher is harder.
- blinkSunRate (number, 1-8): how many times faster the sun moves while Blink is held. Higher makes the comparison aid costlier.
- hitTolerance (number, 0.6-1.6): how close a click must land to a difference. Higher is more forgiving.
- levelOffset (integer, -3 to 3): shifts the difficulty rung of the NEXT pair: more differences (3 at rung 1, up to 7), subtler ones, and more hidden round the back of the mountain. Higher is harder. Never takes effect mid-pair.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': daylightScale ~1.5, missPenaltySec ~3, blinkSunRate ~2, hitTolerance ~1.3, levelOffset -1 to -2 — a long golden hour, forgiving clicks, few and obvious differences
- For 'focus': daylightScale ~1.0, missPenaltySec ~7, blinkSunRate ~4, hitTolerance ~1.0, levelOffset 0 — the game as designed: steady pressure that rewards careful looking
- For 'grit': daylightScale ~0.65, missPenaltySec ~13, blinkSunRate ~7, hitTolerance ~0.8, levelOffset +1 to +2 — short light, costly guesses, more and subtler differences, some hidden behind the mountain
- For 'awe': daylightScale ~1.4, missPenaltySec ~3, blinkSunRate ~2.5, hitTolerance ~1.2, levelOffset -1 to 0 — time to orbit and take in the whole mountain and sky; enough differences to keep the player exploring, never rushed

Consider the player's current performance: if flow score is low and cognitive
load is high, the game is likely too hard — ease off (raise daylightScale first, then hitTolerance, then lower missPenaltySec; lower levelOffset for the next pair if a pair ended with two or more missed). If UNMATCH events come in bursts, the player is guessing: raise hitTolerance only if the clicks land close to differences, otherwise raise missPenaltySec slightly. If arousal is low and attention is dropping, the player may be bored — increase challenge (lower daylightScale, then raise levelOffset by one for the next pair once a pair ends with every difference found and daylight to spare).

Always adjust gradually from the current parameter values to avoid jarring transitions: at most 0.25 on daylightScale, 3 s on missPenaltySec, 1.5 on blinkSunRate, 0.15 on hitTolerance and one step on levelOffset at a time. When LEVEL_START says noSunset is true the player chose to play without a clock: daylightScale, missPenaltySec and blinkSunRate have no effect, so adjust hitTolerance and levelOffset only.`;

const skill_adjustment_instructions = `Mountain Appreciator trains sustained visual attention, comparison of two near-identical scenes (pattern matching), spatial reasoning about a 3D form seen from moving viewpoints, and perceptual speed. Read "Found N of M", the score and the time left from the stamp at the top left of each frame; MATCH events carry the kind, tier (1 obvious to 3 subtle) and whether the difference was hidden round the back.

Per-skill levers (primary first):
- attention: lower daylightScale and raise missPenaltySec so the player must keep scanning rather than click around; ease off if a pair ends with half or more missed.
- pattern-matching: raise levelOffset (more and subtler differences) and blinkSunRate (less reliance on the blink comparator, more side-by-side comparison).
- spatial: raise levelOffset, which hides more differences round the back of the mountain and makes the player orbit to find them; keep hitTolerance at 1.0 or above so precision isn't the bottleneck.
- perceptual-speed: lower daylightScale toward 0.6-0.8 while holding levelOffset at 0, so the same differences must be found faster.

Move one or two parameters per adjustment, by the same small steps as the mood guidance, and change levelOffset only between pairs.`;

const definitions = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, {
  type: BACKEND_TYPE[p.type],
  min: p.minValue,
  max: p.maxValue,
  default: p.defaultValue,
  description: p.description,
  adjustment_guide: p.howSDKChangesIt,
}]));

const config = {
  game_slug: 'mountain-appreciator',
  is_enabled: true,
  parameter_definitions: definitions,
  adjustment_instructions,
  skill_adjustment_instructions,
  notes: 'Generated by backend/export-config.mjs from static/src/params.js, the list the game also hands to skillprint-js-sdk. Keys 1-9 in GameAdjustmentTester and static/iframeTest.html send the presets listed in GAME_PARAMETERS.MD.',
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
