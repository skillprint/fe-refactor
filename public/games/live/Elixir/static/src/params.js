// What Skillprint can tune, and the one place the game reads it from. Each
// entry is a skillprint-js-sdk ParameterDefinition; backend/export-config.mjs
// writes the backend's copy (backend/game-scoring-config.json) from this list.

import { ParameterDefinition, ParameterType } from '../vendor/skillprint-js-sdk/index.js';

export const PARAMETERS = [
  {
    parameterName: 'pourRate',
    type: ParameterType.FLOAT,
    minValue: 0.4,
    maxValue: 2,
    defaultValue: 1,
    description: 'How fast the liquid rises while the tap is held: the empty flask fills in 6 s divided by this (6 s at 1.0, 15 s at 0.4, 3 s at 2.0). Higher values make stopping on the mark harder.',
    howSDKChangesIt: 'relax 0.5-0.7, focus 0.9-1.1, grit 1.4-1.7, awe 0.6-0.8. Applies at once, mid-pour included. Move by at most 0.3 at a time.',
  },
  {
    parameterName: 'tolerance',
    type: ParameterType.FLOAT,
    minValue: 0.5,
    maxValue: 2,
    defaultValue: 1,
    description: 'Scales the grade bands for each layer: Perfect within 1 %, Fine within 3 %, Fair within 6 % of the flask at 1.0. Higher values are more forgiving and make potions easier.',
    howSDKChangesIt: 'relax 1.4-1.7, focus 0.9-1.1, grit 0.6-0.8, awe 1.2-1.4. Applies at the next serve. Move by at most 0.25 at a time.',
  },
  {
    parameterName: 'gradations',
    type: ParameterType.INTEGER,
    minValue: 0,
    maxValue: 10,
    defaultValue: 0,
    description: 'Faint tick marks on the front of the flask at every 1/n (0 none, 2 halves, 4 quarters, 10 tenths). More ticks give the eye more to measure against and make potions easier.',
    howSDKChangesIt: 'relax 4 or 5, focus 0-2, grit 0, awe 2-4. Applies at once. Prefer 0, 2, 4, 5 or 10, which line up with the recipes; step down one notch at a time.',
  },
  {
    parameterName: 'brewTimeScale',
    type: ParameterType.FLOAT,
    minValue: 0.5,
    maxValue: 2.5,
    defaultValue: 1,
    description: 'Multiplies the hourglass for each potion: 15 s plus 9 s per layer at 1.0 (24 s for one layer, 42 s for three). When it runs out the potion is served as it stands. Higher values give more time and make potions easier.',
    howSDKChangesIt: 'relax 1.8-2.4, focus 0.9-1.1, grit 0.55-0.75, awe 1.5-2.0. Applies at once; the sand left grows or shrinks in proportion. Move by at most 0.3 at a time.',
  },
  {
    parameterName: 'levelOffset',
    type: ParameterType.INTEGER,
    minValue: -3,
    maxValue: 3,
    defaultValue: 0,
    description: 'Shifts the rung the next recipe is written for, relative to how many potions the player has served. Rungs climb from one easy fraction, through decimals, percents, two and three layers, flasks measured in drops and millilitres, to ratios. Higher values make the next recipe harder.',
    howSDKChangesIt: 'relax -2 to -1, focus 0, grit +1 to +2, awe -1 to 0. Takes effect with the next potion, never mid-potion. Change it by one step per potion.',
  },
];

const definitions = new Map(PARAMETERS.map((p) => [p.parameterName, new ParameterDefinition(p)]));

/** The values in force right now, by parameter name. */
export const tuning = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, p.defaultValue]));

const listeners = [];
export function onParameter(fn) { listeners.push(fn); }

// Out-of-range values are clamped rather than refused: an adjustment a little
// past the end of a range should still move the game the way it asked.
export function setParameter(name, raw) {
  const def = definitions.get(name);
  if (!def) return null;
  let value = def.convertValue(raw);
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  value = Math.min(def.maxValue, Math.max(def.minValue, value));
  if (def.type === ParameterType.INTEGER) value = Math.round(value);
  const before = tuning[name];
  tuning[name] = value;
  for (const fn of listeners) fn(name, value, before);
  return value;
}
