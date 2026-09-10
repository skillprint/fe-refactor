/** `GET /api/portal/sessions/{session_id}/` — full breakdown of one session. camelCase on the wire. */

export interface SessionDimensionScore {
  slug: string;
  score: number;
  confidence: number;
  isTarget?: boolean;
  isExercisedByGame?: boolean;
  /**
   * SKI-132: true when the game emitted no cognition scores and the backend
   * substituted an estimate from play time. Estimates are capped low, carry
   * low confidence, are never persisted, and must be labelled in the UI.
   */
  isEstimated?: boolean;
}

export interface SessionPersonalityScore {
  trait: string;
  score: number;
  confidence: number;
}

export interface SessionMoodSection {
  targetMood: string | null;
  targetScore: number | null;
  targetConfidence: number | null;
  allMoods: SessionDimensionScore[];
}

export interface SessionDetail {
  sessionId: string;
  game: { id: number; name: string; slug: string };
  startedAt: string;
  /** null while scoring is still in flight. */
  endedAt: string | null;
  durationSeconds: number;
  mood: SessionMoodSection | null;
  /** [] while scoring is still in flight; poll until it populates. */
  cognition: SessionDimensionScore[];
  personality: SessionPersonalityScore[] | null;
}

export const generateMockSessionDetail = (): SessionDetail => ({
  sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  game: { id: 42, name: 'Hextris', slug: 'hextris' },
  startedAt: new Date(Date.now() - 330000).toISOString(),
  endedAt: new Date().toISOString(),
  durationSeconds: 330,
  mood: {
    targetMood: 'focus',
    targetScore: 72,
    targetConfidence: 0.85,
    allMoods: [
      { slug: 'focus', score: 72, confidence: 0.85, isTarget: true },
      { slug: 'relax', score: 58, confidence: 0.71, isTarget: false },
    ],
  },
  cognition: [
    { slug: 'attention', score: 81, confidence: 0.9, isExercisedByGame: true, isEstimated: false },
    { slug: 'pattern-matching', score: 38, confidence: 0.2, isExercisedByGame: true, isEstimated: true },
    // Skills the game does not exercise come back scored but untouched (SKI-140).
    { slug: 'planning', score: 0, confidence: 0, isExercisedByGame: false, isEstimated: false },
    { slug: 'deduction', score: 0, confidence: 0, isExercisedByGame: false, isEstimated: false },
  ],
  personality: [{ trait: 'openness', score: 68, confidence: 0.72 }],
});
