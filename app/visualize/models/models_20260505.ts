// Models extracted from Markdown to PDF.pdf
// Created: 20260505

// ==========================================
// Base Types
// ==========================================

export interface GameBasicInfo_20260505 {
  name: string;
  slug: string;
  id?: number;
}

// ==========================================
// M1 — Home Models
// ==========================================

// Endpoint: /home/just-played/
export interface HomeJustPlayed_20260505 {
  session_id: string;
  game: GameBasicInfo_20260505;
  played_at: string; // ISO date string
  duration_seconds: number;
  target_mood: string;
  target_score: number;
}

// Endpoint: /home/recent-sessions/
export interface HomeRecentSession_20260505 {
  session_id: string;
  game_name: string;
  game_slug: string;
  played_at: string; // ISO date string
  duration_seconds: number;
  primary_mood: string;
  primary_score: number;
}

// ==========================================
// M2 — Trends Models
// ==========================================

export interface TrendPillarMetric_20260505 {
  slug: string;
  avg_score: number;
  sessions: number;
}

export interface TrendPillars_20260505 {
  mood: TrendPillarMetric_20260505[];
  cognition: TrendPillarMetric_20260505[];
  personality: TrendPillarMetric_20260505[];
}

// Endpoint: /trends/
export interface TrendSummary_20260505 {
  range: string; // 'W', 'D', 'M', '6M', 'Y'
  pillars: TrendPillars_20260505;
}

export interface TrendDataPoint_20260505 {
  date: string; // YYYY-MM-DD
  score: number;
  sessions: number;
}

// Endpoint: /trends/long-range/
export interface TrendLongRange_20260505 {
  pillar: string;
  dimension: string;
  data_points: TrendDataPoint_20260505[];
}

export interface DailyDimension_20260505 {
  pillar: string;
  slug: string;
  avg_score: number;
  sessions: number;
  duration_seconds: number;
}

// Endpoint: /trends/daily-summary/
export interface TrendDailySummary_20260505 {
  date: string; // YYYY-MM-DD
  dimensions: DailyDimension_20260505[];
}

// ==========================================
// M3 — Insights Models
// ==========================================

// Endpoint: /insights/
export interface Insight_20260505 {
  id: number;
  category: string; // 'improvement', 'peak', 'streak', 'comparative', 'pattern', 'recommendation'
  title: string;
  body: string;
  icon: string;
  pillar: string;
  dimension: string;
  created_at: string; // ISO date string
}

// ==========================================
// M4 — Recommendations Models
// ==========================================

// Endpoint: /recommendations/next-game/
export interface NextGameRecommendation_20260505 {
  game: GameBasicInfo_20260505;
  reason_code: string;
  reason_text: string;
}

// Endpoint: /recommendations/mood-matched/
export interface MoodMatchedRecommendation_20260505 {
  game: GameBasicInfo_20260505;
  reason_code: string;
  reason_text: string;
}

export interface PlaybookFocusArea_20260505 {
  pillar: string;
  slug: string;
  score: number;
  action: string;
}

// Endpoint: /recommendations/playbook/
export interface Playbook_20260505 {
  focus_areas: PlaybookFocusArea_20260505[];
}

// ==========================================
// Library Models
// ==========================================

export interface TagInfo_20260505 {
  slug: string;
  name: string;
}

// Endpoint: /library/games/
export interface LibraryGame_20260505 {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  skills: string[]; // slugs
  moods: string[]; // slugs
}

// Endpoint: /library/games/{slug}/
export interface LibraryGameDetail_20260505 {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  skills: TagInfo_20260505[];
  moods: TagInfo_20260505[];
  orientation: string;
  url: string;
}

// Endpoint: /library/personal-stats/{slug}/
export interface PersonalGameStats_20260505 {
  game_slug: string;
  sessions_played: number;
  total_play_seconds: number;
}

// Endpoint: /library/community-stats/{slug}/
export interface CommunityGameStats_20260505 {
  game_slug: string;
  total_sessions: number;
  unique_players: number;
  avg_duration_seconds: number;
}
