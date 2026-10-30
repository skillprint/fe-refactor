// What Skillprint can tune, and the one place the game reads it from. Each
// entry is a skillprint-js-sdk ParameterDefinition; backend/export-config.mjs
// writes the backend's copy (backend/game-scoring-config.json) from this list.

import { ParameterDefinition, ParameterType } from '../vendor/skillprint-js-sdk/index.js';

export const PARAMETERS = [
  {
    parameterName: 'runSpeed',
    type: ParameterType.FLOAT,
    minValue: 0.6,
    maxValue: 1.8,
    defaultValue: 1,
    description: 'How fast the swarm flies down the path, as a multiple of the base speed (about 3.5 s from one row of gates to the next at 1.0). Higher values leave less time to work out each row and make the stage harder.',
    howSDKChangesIt: 'relax 0.65-0.8, focus 0.95-1.1, grit 1.3-1.5, joy 1.0-1.2. Applies at once, mid-row included. Move by at most 0.2 at a time.',
  },
  {
    parameterName: 'gateTrickiness',
    type: ParameterType.FLOAT,
    minValue: 0,
    maxValue: 1,
    defaultValue: 0.5,
    description: 'How close the results of a row\'s gates are, and how often the gate with the bigger-looking number is the worse one (30% of rows at 0, 80% at 1). Median gap between the best and second-best result: 40% at 0, 27% at 0.5, 8% at 1. Higher values demand real arithmetic and make the stage harder.',
    howSDKChangesIt: 'relax 0.15-0.3, focus 0.45-0.6, grit 0.75-0.9, joy 0.3-0.45. Takes effect from the next stage. Move by at most 0.2 per stage.',
  },
  {
    parameterName: 'numberScale',
    type: ParameterType.FLOAT,
    minValue: 0.5,
    maxValue: 3,
    defaultValue: 1,
    description: 'Scales the starting swarm (10-20 at 1.0) and the band the count is kept in (up to 80 on rung 1, 600 from rung 4, at 1.0), so the operands grow with it. Higher values mean bigger numbers to add, multiply and divide.',
    howSDKChangesIt: 'relax 0.5-0.8, focus 1.0, grit 1.5-2.5, joy 0.8-1.2. Takes effect from the next stage. Move by at most 0.5 per stage.',
  },
  {
    parameterName: 'beaconStrictness',
    type: ParameterType.FLOAT,
    minValue: 0.6,
    maxValue: 1,
    defaultValue: 0.9,
    description: 'The number carved on the beacon, as a share of the biggest swarm the stage allows (every best gate taken, no moths hit). At 1.0 only a flawless run lights it. Higher values make the stage harder.',
    howSDKChangesIt: 'relax 0.65-0.75, focus 0.85-0.92, grit 0.95-1.0, joy 0.75-0.85. Takes effect from the next stage. Move by at most 0.08 per stage.',
  },
  {
    parameterName: 'hazardDensity',
    type: ParameterType.FLOAT,
    minValue: 0,
    maxValue: 2,
    defaultValue: 1,
    description: 'How many moths drift between the rows of gates (about one per gap at 1.0, none at 0). A moth that touches the swarm eats fireflies worth 3-8% of the stage\'s best possible finish. Higher values add dodging on top of the sums and make the stage harder.',
    howSDKChangesIt: 'relax 0-0.4, focus 0.8-1.0, grit 1.4-1.8, joy 0.6-1.0. Applies to moths that appear from now on (a row or two ahead). Lower it first when the player is overloaded; the arithmetic is the point.',
  },
  {
    parameterName: 'levelOffset',
    type: ParameterType.INTEGER,
    minValue: -3,
    maxValue: 3,
    defaultValue: 0,
    description: 'Shifts the rung the next stage is built on, relative to how many beacons the player has lit. Each rung up adds a row (6 at rung 1, up to 12), larger operands and a bigger count band; rung 5 brings three gates per row and rung 6 two-step gates like "×2 −5". Higher values make the next stage harder.',
    howSDKChangesIt: 'relax -2 to -1, focus 0, grit +1 to +2, joy -1 to 0. Takes effect when the next stage is built, never mid-stage. Change it by one step per stage.',
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
