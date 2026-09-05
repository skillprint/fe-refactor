export interface SessionDimensionScore {
  slug: string;
  score: number;
  confidence: number;
  is_target?: boolean;
  is_exercised_by_game?: boolean;
  is_estimated?: boolean;
  baseline_score?: number;
}

export interface SessionPersonalityScore {
  trait: string;
  score: number;
  confidence: number;
}

export interface SessionDetail {
  session_id: string;
  game: { id: number; name: string; slug: string; };
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  mood: {
    target_mood: string;
    target_score: number;
    target_confidence: number;
    all_moods: SessionDimensionScore[];
  };
  cognition: SessionDimensionScore[];
  personality: SessionPersonalityScore[];
}

export const generateMockSessionDetail = (): SessionDetail => ({
  session_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  game: { id: 42, name: "Hextris", slug: "hextris" },
  started_at: new Date(Date.now() - 330000).toISOString(),
  ended_at: new Date().toISOString(),
  duration_seconds: 330,
  mood: {
    target_mood: "focus",
    target_score: 72,
    target_confidence: 0.85,
    all_moods: [
      { slug: "focus", score: 72, confidence: 0.85, is_target: true },
      { slug: "relax", score: 58, confidence: 0.71, is_target: false }
    ]
  },
  cognition: [
    { slug: "attention", score: 81, confidence: 0.90, is_exercised_by_game: true }
  ],
  personality: [
    { trait: "openness", score: 68, confidence: 0.72 }
  ]
});
