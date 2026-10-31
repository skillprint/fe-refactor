// The parameters the backend may adjust mid-session (ADJUST_GAME), and the
// game's current values. `backend/game-scoring-config.json` is generated from
// this list; keep the two in step.

export const PARAMETERS = [
  {
    name: 'customer_patience', type: 'Float', min: 0.2, max: 1, default: 0.7,
    description: 'Starting patience of each new customer, 0.2 (already on edge) to 1 (relaxed). Lower values reach anger sooner and make the ticket harder.',
    adjustment_guide: 'relax 0.85-1.0, focus 0.6-0.75, grit 0.3-0.45, empathy 0.4-0.55. Applies to the next ticket. Move by at most 0.15 at a time.',
  },
  {
    name: 'hostility', type: 'Float', min: 0, max: 1, default: 0.3,
    description: 'How fast patience drains on a setback (a denial, a repeated question, a slow reply) and how sharp the customer\'s wording gets. Higher is harder.',
    adjustment_guide: 'relax 0-0.15, focus 0.25-0.4, grit 0.6-0.8, empathy 0.5-0.7. Applies to the next ticket. Move by at most 0.2 at a time.',
  },
  {
    name: 'ambiguity', type: 'Float', min: 0, max: 1, default: 0.3,
    description: 'How much of what the customer knows they withhold until asked. At 0 the opener states the problem fully; at 1 the agent has to draw every detail out. Higher is harder and rewards good questions.',
    adjustment_guide: 'relax 0-0.2, focus 0.3-0.5, grit 0.6-0.9, curiosity 0.5-0.8. Applies to the next ticket.',
  },
  {
    name: 'concurrency', type: 'Integer', min: 1, max: 3, default: 1,
    description: 'How many tickets are open at once. Above 1 the agent switches between conversations with separate customers, names and order numbers. Higher is harder and loads working memory and attention.',
    adjustment_guide: 'relax 1, focus 2, grit 3, collaborate 2. Applies at once: a raise pulls the next ticket from the queue immediately. Change by one step at a time.',
  },
  {
    name: 'policy_complexity', type: 'Integer', min: 1, max: 3, default: 1,
    description: 'Which version of the policy document applies: 1 is short with no exceptions, 3 is long with exceptions and limits the agent must check. Higher is harder.',
    adjustment_guide: 'relax 1, focus 1-2, grit 3. Applies to the next ticket.',
  },
  {
    name: 'incongruence_rate', type: 'Float', min: 0, max: 1, default: 0,
    description: 'Probability that a ticket\'s customer sounds angrier than their words read: the text stays neutral and only the voice carries the mood. Only matters with voice on. Higher tests emotional attunement.',
    adjustment_guide: 'empathy 0.5-1.0, otherwise 0-0.2. Applies to the next ticket.',
  },
  {
    name: 'speech_rate', type: 'Float', min: 0.8, max: 1.3, default: 1,
    description: 'Speaking rate of the customer voice. Higher is faster and harder to follow.',
    adjustment_guide: 'relax 0.9, focus 1.0, grit 1.15-1.3. Applies to the next spoken line.',
  },
  {
    name: 'interruption_rate', type: 'Float', min: 0, max: 1, default: 0,
    description: 'Probability that the customer talks over the agent\'s reply in voice mode. Higher tests turn-taking under pressure. No effect in text mode.',
    adjustment_guide: 'relax 0, focus 0-0.2, grit 0.4-0.7. Applies to the next ticket.',
  },
  {
    name: 'policy_switch', type: 'Integer', min: 0, max: 1, default: 0,
    description: 'When 1, the next ticket carries a mid-conversation policy update (a banner and a changed rule) the agent must notice and apply. Tests cognitive flexibility.',
    adjustment_guide: 'grit 1, curiosity 1, otherwise 0. Applies to the next ticket.',
  },
];

export const tuning = Object.fromEntries(PARAMETERS.map((p) => [p.name, p.default]));

const byName = new Map(PARAMETERS.map((p) => [p.name, p]));

/** Clamp and apply one parameter; returns the value applied, or null when the name or value is unusable. */
export function setParameter(name, raw) {
  const p = byName.get(name);
  if (!p) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  let v = Math.min(p.max, Math.max(p.min, n));
  if (p.type === 'Integer') v = Math.round(v);
  tuning[name] = v;
  return v;
}

/** The parameters as the engine wants them (camelCase on the wire). */
export function engineParams() {
  return {
    customerPatience: tuning.customer_patience,
    hostility: tuning.hostility,
    ambiguity: tuning.ambiguity,
    concurrency: tuning.concurrency,
    policyComplexity: tuning.policy_complexity,
    incongruenceRate: tuning.incongruence_rate,
    speechRate: tuning.speech_rate,
    interruptionRate: tuning.interruption_rate,
    policySwitch: tuning.policy_switch,
  };
}
