#!/usr/bin/env node
/**
 * Writes game-scoring-config.json, the GameScoringConfig payload for the
 * Skillprint backend, from the game's own parameter list (static/src/params.js),
 * so the two never drift.
 *
 *   node "public/games/live/Elixir/backend/export-config.mjs"
 *
 * The portal sends `sdk_game_parameters` on session start (gameConfig's
 * parameterManifest). `parameter_definitions`, `adjustment_instructions` and
 * `skill_adjustment_instructions` go to
 * PATCH /scoring/api/games/elixir/scoring-config/.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARAMETERS } from '../static/src/params.js';

const here = dirname(fileURLToPath(import.meta.url));

const BACKEND_TYPE = { Float: 'number', Integer: 'integer', Boolean: 'boolean' };

const adjustment_instructions = `You are adjusting parameters for Elixir, a 3D proportional-reasoning game set at an alchemist's candlelit bench.
Each potion is a recipe of one to three layers written as fractions, decimals, percents, ratios or amounts in a flask of stated capacity ("Moonwater — fill to 3/8 of the flask", "another 25%", "This flask holds 240 drops: 90 drops", "2 : 3, 3/4 of the flask in all", "3 parts to Emberwine's 2"). The flask is a straight glass cylinder marked only at empty and full (plus optional faint ticks), so the player must turn each measure into a height and pour to it by eye: hold to pour, release to stop, no draining. Enter moves to the next ingredient, then serves. On serving, each layer is graded against the exact line (Perfect within 1 %, Fine 3 %, Fair 6 % of the flask at tolerance 1.0, else Spoiled) and gold lines show where it should have ended. An hourglass runs per potion; when it empties the potion is served as it stands.

Each frame is stamped top left with the potion number, rung and score, the recipe text, the current layer and the flask's level (the target is never shown before serving), and the hourglass. Events: LEVEL_START (potion, rung, layers with their text and exact targets, capacity, hourglassSec), POUR_START / POUR_STOP (one per pour gesture, taps under 250 ms apart merged, with level, amount poured and ms), MATCH for each layer graded Perfect or Fine and UNMATCH for Fair or Spoiled (target, level, errorPct, grade, layerMs, msToServe), LEVEL_COMPLETE on serving (grades, points, streak) and LEVEL_FAILED when the hourglass ran out.

Five parameters are exposed:
- pourRate (number, 0.4-2.0): how fast the liquid rises; the flask fills in 6 s divided by this. Higher makes stopping on the line harder. Applies at once.
- tolerance (number, 0.5-2.0): scales the grade bands. Higher is more forgiving. Applies at the next serve.
- gradations (integer, 0-10): faint ticks at every 1/n of the flask (0 none). More ticks give the eye something to measure against. Applies at once.
- brewTimeScale (number, 0.5-2.5): multiplies the hourglass (15 s plus 9 s per layer). Higher gives more time. Applies at once, in proportion.
- levelOffset (integer, -3 to 3): shifts the rung of the NEXT recipe: one easy fraction (1), fifths/decimals/percents (2), two layers (3), drops (4), ratios (5), three mixed layers (6), ratios over part of the flask and millilitres (7), litres with ratios on a middle pour (8-9). Higher is harder. Never takes effect mid-potion.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': pourRate ~0.6, tolerance ~1.5, gradations 4, brewTimeScale ~2.1, levelOffset -1 to -2 — an unhurried pour, quarter marks to lean on, forgiving grades, simple recipes
- For 'focus': pourRate ~1.0, tolerance ~1.0, gradations 0-2, brewTimeScale ~1.0, levelOffset 0 — the game as designed: work the measure out, then pour it cleanly
- For 'grit': pourRate ~1.5, tolerance ~0.7, gradations 0, brewTimeScale ~0.65, levelOffset +1 to +2 — a fast tap, tight grades, no ticks, short sand and harder recipes
- For 'awe': pourRate ~0.7, tolerance ~1.3, gradations 2-4, brewTimeScale ~1.8, levelOffset -1 to 0 — time to watch the layers rise and glow and the shelf fill under the moon; never rushed

Consider the player's current performance: if flow score is low and cognitive load is high, the recipe is likely too hard — ease off (raise brewTimeScale first, then add gradations, then lower levelOffset for the next potion). If errors are consistently in one direction (all positive: overshooting) the pour may be too fast for their reactions: lower pourRate before changing tolerance. If errors are large but layerMs is short, the player is guessing rather than computing: raise brewTimeScale and lower levelOffset rather than tolerance. If arousal is low and attention is dropping, the player may be bored — increase challenge (remove gradations, then raise levelOffset by one once a potion is served with every layer Perfect or Fine, then tighten tolerance).

Always adjust gradually from the current parameter values to avoid jarring transitions: at most 0.3 on pourRate, 0.25 on tolerance, one notch on gradations (0, 2, 4, 5, 10), 0.3 on brewTimeScale and one step on levelOffset at a time.`;

const skill_adjustment_instructions = `Elixir trains proportional reasoning and number sense (math): converting fractions, decimals, percents, ratios and capacities to a single position on a line, and adding them; mental visualization of that position on an unmarked cylinder; and timing the release of a continuous pour. Read the recipe and the level from the stamp at the top left of each frame; MATCH and UNMATCH events carry each layer's exact target, the level reached and the signed error.

Per-skill levers (primary first):
- math: raise levelOffset (decimals and percents, then capacities, then ratios and multi-step recipes) while keeping pourRate at or below 1.0 and gradations at 0, so the error comes from the arithmetic, not the hand; ease off with levelOffset if layers on ratio or capacity recipes go Spoiled while simple fractions stay Fine.
- visualization: set gradations to 0 and tolerance toward 0.7-0.8 so the player must place the line by eye; ease off by adding 2 or 4 gradations.
- timing: raise pourRate toward 1.4-1.8 with levelOffset at 0 or below, so the same measures must be stopped on more sharply; lower it if errors are consistently positive by more than 3 %.

Move one or two parameters per adjustment, by the same small steps as the mood guidance, and change levelOffset only between potions.`;

const definitions = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, {
  type: BACKEND_TYPE[p.type],
  min: p.minValue,
  max: p.maxValue,
  default: p.defaultValue,
  description: p.description,
  adjustment_guide: p.howSDKChangesIt,
}]));

const config = {
  game_slug: 'elixir',
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
