import { 
  HomeJustPlayed_20260505, 
  HomeRecentSession_20260505,
  TrendLongRange_20260505,
  TrendDailySummary_20260505,
  Insight_20260505,
  NextGameRecommendation_20260505,
  MoodMatchedRecommendation_20260505,
  Playbook_20260505,
  LibraryGame_20260505,
  PersonalGameStats_20260505,
  CommunityGameStats_20260505
} from '../models/models_20260505';

export const MODEL_FIELDS_20260505: Record<string, string[]> = {
  'HomeJustPlayed_20260505': ['duration_seconds', 'target_score'],
  'HomeRecentSession_20260505': ['duration_seconds', 'primary_score'],
  'TrendSummary_20260505': ['avg_score', 'sessions'],
  'TrendLongRange_20260505': ['score', 'sessions'],
  'TrendDailySummary_20260505': ['avg_score', 'sessions', 'duration_seconds'],
  'Insight_20260505': [],
  'NextGameRecommendation_20260505': [],
  'MoodMatchedRecommendation_20260505': [],
  'Playbook_20260505': ['score'],
  'LibraryGame_20260505': [],
  'LibraryGameDetail_20260505': [],
  'PersonalGameStats_20260505': ['sessions_played', 'total_play_seconds'],
  'CommunityGameStats_20260505': ['total_sessions', 'unique_players', 'avg_duration_seconds']
};

export const MODEL_FILTERS_20260505: Record<string, string[]> = {
  'HomeJustPlayed_20260505': ['game_slug'],
  'HomeRecentSession_20260505': ['game_slug', 'primary_mood'],
  'TrendSummary_20260505': ['range'],
  'TrendLongRange_20260505': ['pillar', 'dimension'],
  'TrendDailySummary_20260505': ['date', 'pillar', 'slug'],
  'Insight_20260505': ['category', 'pillar', 'dimension'],
  'NextGameRecommendation_20260505': ['reason_code'],
  'MoodMatchedRecommendation_20260505': ['reason_code'],
  'Playbook_20260505': ['pillar', 'action'],
  'LibraryGame_20260505': ['skills', 'moods'],
  'LibraryGameDetail_20260505': ['slug'],
  'PersonalGameStats_20260505': ['game_slug'],
  'CommunityGameStats_20260505': ['game_slug']
};

export function generateSyntheticTrendData_20260505(
  pillar: string, 
  dimension: string, 
  daysToGenerate: number = 7
): TrendLongRange_20260505 {
  const data_points = [];
  const baseScore = 60 + Math.random() * 20;
  
  for (let i = 0; i < daysToGenerate; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (daysToGenerate - i - 1));
    const noise = (Math.random() * 2 - 1) * 5;
    
    data_points.push({
      date: d.toISOString().split('T')[0],
      score: Math.min(100, Math.max(0, Math.round(baseScore + noise))),
      sessions: Math.floor(Math.random() * 5) + 1
    });
  }

  return {
    pillar,
    dimension,
    data_points
  };
}

export function generateSyntheticDailySummary_20260505(date: string): TrendDailySummary_20260505 {
  return {
    date,
    dimensions: [
      { pillar: 'mood', slug: 'focus', avg_score: 72, sessions: 2, duration_seconds: 600 },
      { pillar: 'cognition', slug: 'attention', avg_score: 78, sessions: 2, duration_seconds: 600 },
      { pillar: 'personality', slug: 'openness', avg_score: 68, sessions: 1, duration_seconds: 300 }
    ]
  };
}

export function getMockedInsights_20260505(): Insight_20260505[] {
  return [
    {
      id: 17,
      category: "improvement",
      title: "Rising Star",
      body: "Your Attention has improved by 12% recently. Keep up the great work!",
      icon: "trending_up",
      pillar: "cognition",
      dimension: "attention",
      created_at: new Date().toISOString()
    },
    {
      id: 18,
      category: "streak",
      title: "Focus Master",
      body: "You've hit your Focus goal 3 days in a row.",
      icon: "local_fire_department",
      pillar: "mood",
      dimension: "focus",
      created_at: new Date().toISOString()
    }
  ];
}

export function getMockedRecommendations_20260505(): NextGameRecommendation_20260505[] {
  return [
    {
      game: { name: "Sweet Memory", slug: "sweet-memory" },
      reason_code: "GENERAL",
      reason_text: "Recommended based on your profile"
    },
    {
      game: { name: "Hextris", slug: "hextris" },
      reason_code: "MOOD_MATCH_FOCUS",
      reason_text: "Good for focus"
    }
  ];
}
