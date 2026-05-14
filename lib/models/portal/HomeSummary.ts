export interface HomeSummary {
  greeting: string;
  total_sessions: number;
  sessions_this_week: number;
  pillar_averages: { mood: number; cognition: number; personality: number; };
  streak_days: number;
}

export const generateMockHomeSummary = (): HomeSummary => ({
  greeting: "Welcome back, Gabriel",
  total_sessions: 142,
  sessions_this_week: 8,
  pillar_averages: { mood: 68, cognition: 72, personality: 65 },
  streak_days: 4
});
