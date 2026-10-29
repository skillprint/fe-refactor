// What Skillprint can tune, and the one place the game reads it from. Each
// entry is a skillprint-js-sdk ParameterDefinition; backend/export-config.mjs
// writes the backend's copy (backend/game-scoring-config.json) from this list.

import { ParameterDefinition, ParameterType } from '../vendor/skillprint-js-sdk/index.js';

export const PARAMETERS = [
  {
    parameterName: 'daylightScale',
    type: ParameterType.FLOAT,
    minValue: 0.5,
    maxValue: 2,
    defaultValue: 1,
    description: 'How long the light lasts on a pair, as a multiple of 40 s plus 22 s per difference (100 s for three differences at 1.0). Higher values give more time and make the pair easier.',
    howSDKChangesIt: 'relax 1.4-1.7, focus 0.9-1.1, grit 0.6-0.75, awe 1.3-1.6. Applies at once; the sun keeps its place in the sky, so the time left grows or shrinks in proportion. Move by at most 0.25 at a time.',
  },
  {
    parameterName: 'missPenaltySec',
    type: ParameterType.FLOAT,
    minValue: 0,
    maxValue: 20,
    defaultValue: 7,
    description: 'Seconds of daylight a wrong click on the mountain costs. Higher values punish guessing and make the pair harder.',
    howSDKChangesIt: 'relax 2-4, focus 6-8, grit 11-15, awe 2-4. Applies to the next wrong click. Raise it when the player clicks around at random; lower it when misses come in bursts of frustration.',
  },
  {
    parameterName: 'blinkSunRate',
    type: ParameterType.FLOAT,
    minValue: 1,
    maxValue: 8,
    defaultValue: 4,
    description: 'How many times faster the sun moves while the player holds Blink to flick between the twins. Higher values make the comparison aid costlier and the pair harder.',
    howSDKChangesIt: 'relax 1.5-2.5, focus 3.5-4.5, grit 6-8, awe 2-3. Applies at once, including mid-blink.',
  },
  {
    parameterName: 'hitTolerance',
    type: ParameterType.FLOAT,
    minValue: 0.6,
    maxValue: 1.6,
    defaultValue: 1,
    description: 'Scales how close a click must land to a difference to count: both its radius on the mountain and its smallest size on screen. Higher values are more forgiving and make the pair easier.',
    howSDKChangesIt: 'relax 1.25-1.45, focus 0.95-1.05, grit 0.7-0.85, awe 1.15-1.3. Applies to the next click. Raise it when near-miss clicks keep landing just beside a difference.',
  },
  {
    parameterName: 'levelOffset',
    type: ParameterType.INTEGER,
    minValue: -3,
    maxValue: 3,
    defaultValue: 0,
    description: 'Shifts the difficulty rung the next pair is built on, relative to how many pairs the player has walked. Each rung up brings more differences (3 at rung 1, one more every two rungs, up to 7), subtler ones, and more hidden round the back of the mountain. Higher values make the next pair harder.',
    howSDKChangesIt: 'relax -2 to -1, focus 0, grit +1 to +2, awe -1 to 0. Takes effect when the next pair is built, never mid-pair. Change it by one step per pair.',
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
