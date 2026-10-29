// What Skillprint can tune, and the one place the game reads it from. Each
// entry is a skillprint-js-sdk ParameterDefinition; backend/export-config.mjs
// writes the backend's copy (backend/game-scoring-config.json) from this list.

import { ParameterDefinition, ParameterType } from '../vendor/skillprint-js-sdk/index.js';

export const PARAMETERS = [
  {
    parameterName: 'levelOffset',
    type: ParameterType.INTEGER,
    minValue: -3,
    maxValue: 3,
    defaultValue: 0,
    description: 'Shifts the difficulty rung the next mobile is built on, relative to how many mobiles the player has balanced. Each rung up brings more beams hanging from one another (1 at rung 1, up to 4), longer arms (3 to 5 hooks a side) and more loose weights to hang (1 at rung 1, up to 6). Higher values make the next mobile harder.',
    howSDKChangesIt: 'relax -2 to -1, focus 0, grit +1 to +2, awe -1 to 0. Takes effect when the next mobile is built, never mid-mobile. Change it by one step per mobile.',
  },
  {
    parameterName: 'maxWeight',
    type: ParameterType.INTEGER,
    minValue: 6,
    maxValue: 15,
    defaultValue: 9,
    description: 'The largest number painted on a weight in the next mobile. Bigger weights mean bigger products and sums to hold in mind (weight × distance up to 75), so higher values make the arithmetic harder without changing the mobile\'s shape.',
    howSDKChangesIt: 'relax 6-8, focus 9-10, grit 12-15, awe 7-9. Takes effect when the next mobile is built. Move by at most 3 at a time.',
  },
  {
    parameterName: 'hintLevel',
    type: ParameterType.INTEGER,
    minValue: 0,
    maxValue: 2,
    defaultValue: 0,
    description: 'How much of the arithmetic the mobile shows. 0: only the tilt of the beams. 1: each hanging sub-mobile\'s total weight is written on its wire. 2: also each arm\'s running total of weight × distance at the beam\'s ends. Higher values make the mobile easier.',
    howSDKChangesIt: 'relax 2, focus 0-1, grit 0, awe 1. Applies at once. Raise it by one when the player keeps hanging and unhanging the same weights without progress; lower it when they solve with time to spare.',
  },
  {
    parameterName: 'liveTilt',
    type: ParameterType.BOOLEAN,
    minValue: 0,
    maxValue: 1,
    defaultValue: true,
    description: 'Whether the beams tilt as weights are hung (true), so trial and error is visible, or are held level until the player presses Release (false), so the player must work out the balance before testing it. A failed Release costs points. false makes the mobile harder.',
    howSDKChangesIt: 'relax true, focus true, grit false, awe true. Applies at once: false clamps every beam level, true lets them swing. Switch it at most once per mobile.',
  },
  {
    parameterName: 'candleScale',
    type: ParameterType.FLOAT,
    minValue: 0.5,
    maxValue: 2.5,
    defaultValue: 1,
    description: 'How long the candle burns on a mobile, as a multiple of 45 s plus 25 s per loose weight (95 s for two weights at 1.0). When it burns out the mobile is lost and its solution shown. Higher values give more time and make the mobile easier.',
    howSDKChangesIt: 'relax 1.8-2.5, focus 0.9-1.2, grit 0.6-0.8, awe 1.5-2. Applies at once; the flame keeps its place, so the time left grows or shrinks in proportion. Move by at most 0.3 at a time.',
  },
];

const definitions = new Map(PARAMETERS.map((p) => [p.parameterName, new ParameterDefinition(p)]));

/** The values in force right now, by parameter name. */
export const tuning = Object.fromEntries(PARAMETERS.map((p) => [p.parameterName, p.defaultValue]));

const listeners = [];
export function onParameter(fn) { listeners.push(fn); }

// Booleans take true/false, "true"/"false" and 1/0, as the tester, the
// backend and a hand-typed harness value each send them; anything else is
// refused rather than read as true.
function toBoolean(raw) {
  if (typeof raw === 'boolean') return raw;
  const s = String(raw).trim().toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  return null;
}

// Out-of-range values are clamped rather than refused: an adjustment a little
// past the end of a range should still move the game the way it asked.
export function setParameter(name, raw) {
  const def = definitions.get(name);
  if (!def) return null;
  let value;
  if (def.type === ParameterType.BOOLEAN) {
    value = toBoolean(raw);
    if (value == null) return null;
  } else {
    value = Number.parseFloat(String(raw));
    if (!Number.isFinite(value)) return null;
    value = Math.min(def.maxValue, Math.max(def.minValue, value));
    if (def.type === ParameterType.INTEGER) value = Math.round(value);
  }
  const before = tuning[name];
  tuning[name] = value;
  for (const fn of listeners) fn(name, value, before);
  return value;
}
