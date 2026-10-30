// Elixir's tutorial: four short steps in the candlelit alcove, each learned by
// doing. Pure data: the practice recipes (in the generator's shape, so the card,
// the grading and the frame stamp read them like any other) and what the coach
// says. main.js runs it.

import { F } from './recipes.js';

const ING = { moonwater: 'Moonwater', emberwine: 'Emberwine', nightshade: 'Nightshade', sunmilk: 'Sunmilk' };

function layer(ingredient, mode, frac, parts) {
  const text = parts.map((p) => (typeof p === 'string' ? p : `${p.n}/${p.d}`)).join('');
  return {
    ingredient, name: ING[ingredient], mode,
    target: frac, ...(mode === 'add' ? { amount: frac } : {}),
    measure: { parts, text },
    text: `${ING[ingredient]} — ${text}`,
  };
}

function recipe(title, layers, intro = [], capacity = null) {
  const introLines = intro.map((t) => ({ parts: [t], text: t }));
  return { rung: 0, seed: 0, title, intro: introLines, capacity, layers, text: [...intro, ...layers.map((l) => l.text)] };
}

// Steps 1 and 2 share a flask: Moonwater to ½, then Emberwine up to ¾.
export const FIRST = recipe('A First Measure', [
  layer('moonwater', 'to', F(1, 2), ['fill to ', { n: 1, d: 2 }, ' of the flask']),
  layer('emberwine', 'to', F(3, 4), ['up to ', { n: 3, d: 4 }, ' of the flask']),
]);

// Steps 3 and 4 share another: 50 of 200 drops, then up to 150.
export const SECOND = recipe('Drops and Lines', [
  layer('nightshade', 'add', F(1, 4), ['50 drops']),
  layer('sunmilk', 'to', F(3, 4), ['up to 150 drops']),
], ['This flask holds 200 drops.'], { amount: 200, unit: 'drops' });

/** The tutorial's pour, whatever pourRate the session has: the flask fills in about 8.5 s. */
export const TUTORIAL_RATE = 0.7;
/** How close the guided first pour has to stop, in fractions of the flask. */
export const FIRST_WINDOW = 0.03;

export const STEPS = [
  {
    name: 'pour',
    title: 'Pour',
    text: 'Hold anywhere on the stage, or <b>Space</b>, to pour. Let go to stop. Fill the flask to the dotted line at <b>½</b>.',
    note: 'Quick taps nudge the level up a little.',
  },
  {
    name: 'by-eye',
    title: 'A line nobody drew',
    text: 'Now pour <b>Emberwine up to ¾</b> of the flask, with no dotted line. Press <b>Check</b> (or Enter) when you think it’s right.',
    note: 'The flask is marked only at 0 and full.',
  },
  {
    name: 'forms',
    title: 'Recipes come in many forms',
    text: 'Fractions, decimals, percents, ratios, and drops. This flask holds <b>200 drops</b>: pour <b>50 drops</b> of Nightshade. What part of the flask is that? Then press <b>Next ingredient</b> (or Enter).',
    note: 'There’s no draining: an overshoot stays in the flask.',
  },
  {
    name: 'serve',
    title: 'Serve it',
    text: 'Last layer: <b>Sunmilk up to 150 drops</b>. Then press <b>Serve</b> (or Enter).',
    note: 'In a real potion the hourglass up here is running. When the sand runs out, the potion is served as it stands.',
  },
];
