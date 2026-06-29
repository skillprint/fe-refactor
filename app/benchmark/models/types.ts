export interface GameMoodScores {
  relax?: number;
  focus?: number;
  creativity?: number;
  [mood: string]: number | undefined; // index signature for dynamic access
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'base_llm' | 'reasoning' | 'vision_agent';
  overallScore: number;
  costPerGame: number; // Avg cost per 100 game moves in dollars
  vlmFramesPerSec: number;
  gameScores: {
    colorize: GameMoodScores;
    hextris: GameMoodScores;
    box_tower: GameMoodScores;
    [game: string]: GameMoodScores; // index signature for dynamic access
  };
}

export interface BenchmarkDataPoint {
  id: string;
  name: string;
  provider: string;
  type: 'base_llm' | 'reasoning' | 'vision_agent';
  score: number;
  cost: number;
  vlmSpeed: number;
}

export interface VLMSimulatorStep {
  frame: number;
  detectedObjects: string[];
  action: string;
  confidence: number;
  moodAlignment: {
    relax: number;
    focus: number;
    creativity: number;
  };
  log: string;
  boardState: any; // game-specific state representation for the mock visual
}

export interface BenchmarkLeaderboardEntry {
  providerKey: string;
  providerDisplayName: string;
  totalSessions: number;
  avgMoodRating: number;
  bayesianAvgMoodRating?: number;
}

export interface BenchmarkProvider {
  key: string;
  displayName: string;
}

export interface BenchmarkSurveyCreate {
  sessionId: string; // UUID
  moodRating: number; // 1-5 rating
}

export interface BenchmarkSurveyResponse {
  id?: number;
  sessionId?: string;
  moodRating: number; // 1-5 rating
  atCreated?: string;
}

