// The customer's mood as a deterministic state machine: a patience level in
// [0, 1] that structural events push around, and a state read off it. The real
// engine (tau2-engine/app/affect.py) implements the same rules; the mock engine
// in this folder uses this copy so the game can be played with no backend.

export const STATES = ['calm', 'tense', 'angry', 'resigned'];

export const stateFor = (patience) => (patience > 0.66 ? 'calm' : patience > 0.33 ? 'tense' : patience > 0.1 ? 'angry' : 'resigned');

export const DEFAULT_TRIGGERS = {
  repeat_question: -0.2,
  latency_over_s: { s: 20, d: -0.1 },
  denial: -0.25,
  no_progress_turns: { n: 3, d: -0.15 },
  tool_error: -0.08,
};
export const DEFAULT_RECOVERY = { empathy: 0.1, progress: 0.2, alternative: 0.12 };

export const EMPATHY_RE = /\b(sorry|apolog|understand|frustrat|appreciate|thank you for (your )?patience|i hear you|that must be|i can see why|let me help|i('| a)m here)\b/i;
export const DENIAL_RE = /\b(can(')?t|cannot|unable|not able|unfortunately|won(')?t be able|isn(')?t possible|not possible|no longer|outside (of )?(the|our) policy|against (our )?policy|not eligible)\b/i;
export const QUESTION_RE = /\?\s*$|^(what|which|when|where|who|how|could you|can you|would you|do you|did you|have you|is it|are you)\b/i;

export function createAffect({ baseline = 'calm', patience = 0.7, hostility = 0.3 } = {}) {
  const start = Math.min(1, Math.max(0, patience));
  return {
    patience: start,
    state: baseline === 'calm' ? stateFor(start) : baseline,
    hostility: Math.min(1, Math.max(0, hostility)),
    minPatience: start,
    wasAngry: baseline === 'angry' || stateFor(start) === 'angry',
    trajectory: [],
    turnsWithoutProgress: 0,
    lastQuestions: [],
  };
}

/** Apply a named trigger; returns {from, to, trigger, patience} when the state changed, else null. */
export function push(affect, trigger, delta) {
  const scale = delta < 0 ? 0.6 + affect.hostility : 1.1 - affect.hostility * 0.5;
  const before = affect.state;
  affect.patience = Math.min(1, Math.max(0, affect.patience + delta * scale));
  affect.minPatience = Math.min(affect.minPatience, affect.patience);
  affect.state = stateFor(affect.patience);
  if (affect.state === 'angry') affect.wasAngry = true;
  return affect.state === before ? null : { from: before, to: affect.state, trigger, patience: affect.patience };
}

/** Record the mood at the end of a turn. */
export function record(affect, turn) {
  affect.trajectory.push({ turn, state: affect.state, patience: Math.round(affect.patience * 100) / 100 });
}

/** A crude "is this the same question again" check: same leading words within the last three questions. */
export function isRepeatQuestion(affect, text) {
  if (!QUESTION_RE.test(text.trim())) return false;
  const key = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 3).slice(0, 5).join(' ');
  const repeat = key.length > 8 && affect.lastQuestions.includes(key);
  affect.lastQuestions = [key, ...affect.lastQuestions].slice(0, 3);
  return repeat;
}

/** CSAT 1–5 from where the mood ended and whether the problem was solved. */
export function csatFor(affect, resolved) {
  const base = 1 + affect.patience * 3;              // 1..4 from patience
  const bonus = resolved ? 1 : 0;
  const recovered = affect.wasAngry && affect.state === 'calm' ? 0.5 : 0;
  return Math.max(1, Math.min(5, Math.round((base + bonus + recovered) * 2) / 2));
}
