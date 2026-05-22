export interface JumperConfig {
  id: string;
  label: string;
  modelName: string;
  fields: string[];
  daysOffset: number;
  chart: 'Bar' | 'Line' | 'Area' | 'BarLine' | 'Pie' | 'Scatter' | 'RangeBand' | 'Radar' | 'DailyBreakdown';
  compPeriods: number;
  compCohort: boolean;
}

export const JUMPERS: JumperConfig[] = [
  // Home & Summary
  { id: 'home_footprint_mood', label: 'Home: Mood Footprint (Radar)', modelName: 'MoodData', fields: ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'], daysOffset: 7, chart: 'Radar', compPeriods: 1, compCohort: true },
  { id: 'home_footprint_cognition', label: 'Home: Cognition Footprint (Radar)', modelName: 'CognitionData', fields: ['memory', 'attention', 'pattern_matching', 'planning', 'visualization', 'math', 'task_switching'], daysOffset: 7, chart: 'Radar', compPeriods: 1, compCohort: true },
  { id: 'home_footprint_personality', label: 'Home: Personality Profile (Radar)', modelName: 'PersonalityData', fields: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability'], daysOffset: 30, chart: 'Radar', compPeriods: 0, compCohort: true },
  { id: 'daily_breakdown', label: 'Home: Daily Breakdown (Weekly Grid)', modelName: 'MoodData', fields: ['focus'], daysOffset: 7, chart: 'DailyBreakdown', compPeriods: 0, compCohort: false },
  // Mood Pillar
  { id: 'focus_trend_weekly', label: 'Mood: Focus Trend (Weekly Bar vs Prev)', modelName: 'MoodData', fields: ['focus'], daysOffset: 7, chart: 'BarLine', compPeriods: 1, compCohort: false },
  { id: 'focus_vs_relax', label: 'Mood: Focus vs Relax (Monthly Line)', modelName: 'MoodData', fields: ['focus', 'relax'], daysOffset: 30, chart: 'Line', compPeriods: 0, compCohort: false },
  { id: 'grit_progression', label: 'Mood: Grit Progression (6-Month Range)', modelName: 'MoodData', fields: ['grit'], daysOffset: 180, chart: 'RangeBand', compPeriods: 0, compCohort: false },
  { id: 'creative_flow', label: 'Mood: Creative Flow (Monthly Line)', modelName: 'MoodData', fields: ['creativity', 'joy', 'awe'], daysOffset: 30, chart: 'Line', compPeriods: 0, compCohort: false },
  { id: 'empathy_collab', label: 'Mood: Empathy & Collaboration (Monthly Bar)', modelName: 'MoodData', fields: ['empathy', 'collaborate'], daysOffset: 30, chart: 'Bar', compPeriods: 1, compCohort: false },
  // Cognition Pillar
  { id: 'top_cognitive_weekly', label: 'Cognition: Top Skills (Weekly Pie)', modelName: 'CognitionData', fields: ['memory', 'attention', 'task_switching', 'planning'], daysOffset: 7, chart: 'Pie', compPeriods: 0, compCohort: false },
  { id: 'memory_vs_cohort', label: 'Cognition: Memory vs Cohort (Monthly Bar)', modelName: 'CognitionData', fields: ['memory'], daysOffset: 30, chart: 'Bar', compPeriods: 0, compCohort: true },
  { id: 'pattern_matching_consistency', label: 'Cognition: Pattern Matching Consistency (Scatter)', modelName: 'CognitionData', fields: ['pattern_matching'], daysOffset: 30, chart: 'Scatter', compPeriods: 0, compCohort: false },
  { id: 'task_switching_planning', label: 'Cognition: Task Switching vs Planning (6-Month Range)', modelName: 'CognitionData', fields: ['task_switching', 'planning'], daysOffset: 180, chart: 'RangeBand', compPeriods: 0, compCohort: false },
  { id: 'long_range_attention', label: 'Cognition: Long-Range Attention (Yearly Line vs Prev)', modelName: 'CognitionData', fields: ['attention'], daysOffset: 365, chart: 'Line', compPeriods: 1, compCohort: false },
  // Session & Gameplay
  { id: 'session_duration_monthly', label: 'Session: Duration Trends (Monthly Bar vs Prev)', modelName: 'Session', fields: ['duration'], daysOffset: 30, chart: 'BarLine', compPeriods: 1, compCohort: false },
  { id: 'telemetry_activity', label: 'Session: Telemetry Activity (Weekly Line)', modelName: 'Session', fields: ['telemetry_events'], daysOffset: 7, chart: 'Line', compPeriods: 0, compCohort: false },
  { id: 'game_popularity', label: 'Game: Priority vs Players (Monthly Scatter)', modelName: 'Game', fields: ['priority', 'total_players'], daysOffset: 30, chart: 'Scatter', compPeriods: 0, compCohort: false },
  { id: 'active_favorites_growth', label: 'Favorites: Active Growth (Monthly Line)', modelName: 'Favorite', fields: ['active_favorites', 'total_favorites'], daysOffset: 30, chart: 'Line', compPeriods: 0, compCohort: false },
  // Profiles & Analytics
  { id: 'flow_score_confidence', label: 'Profile: Flow Score vs Confidence (Monthly Range)', modelName: 'SkillPrintProfile', fields: ['avg_flow_score', 'flow_confidence'], daysOffset: 30, chart: 'RangeBand', compPeriods: 0, compCohort: false },
  { id: 'survey_completion', label: 'Survey: Completion Time (Weekly Bar)', modelName: 'Survey', fields: ['completion_time'], daysOffset: 7, chart: 'Bar', compPeriods: 0, compCohort: false },
  { id: 'processing_quality', label: 'Analysis: Processing Quality (Monthly Bar)', modelName: 'GameChunkAnalysis', fields: ['processing_attempts', 'flow_llm_score', 'skill_llm_score'], daysOffset: 30, chart: 'Bar', compPeriods: 0, compCohort: false }
];
