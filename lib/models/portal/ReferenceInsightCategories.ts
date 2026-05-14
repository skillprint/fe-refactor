export interface InsightCategory {
  slug: string;
  display_name: string;
  icon: string;
  description: string;
}

export const generateMockInsightCategories = (): InsightCategory[] => [
  { slug: "improvement", display_name: "Improvement", icon: "trending_up", description: "Score increased." },
  { slug: "peak", display_name: "Personal Best", icon: "emoji_events", description: "New all-time high." },
  { slug: "streak", display_name: "Streak", icon: "local_fire_department", description: "Consistent activity." }
];
