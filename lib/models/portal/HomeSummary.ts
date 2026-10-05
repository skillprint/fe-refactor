/** `GET /api/portal/home/summary/` — camelCase on the wire. */
export interface HomeSummary {
  greeting: string;
  totalSessions: number;
  sessionsThisWeek: number;
  pillarAverages: { mood: number | null; cognition: number | null; personality: number | null };
  streakDays: number;
}

export const generateMockHomeSummary = (): HomeSummary => ({
  greeting: 'Welcome back, Gabriel',
  totalSessions: 142,
  sessionsThisWeek: 8,
  pillarAverages: { mood: 68, cognition: 72, personality: 65 },
  streakDays: 4,
});
