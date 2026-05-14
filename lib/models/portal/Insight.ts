export interface Insight {
  id: number;
  category: string;
  title: string;
  body: string;
  icon: string;
  pillar: string;
  dimension: string;
  created_at: string;
}

export const generateMockInsights = (): Insight[] => ([
  {
    id: 17,
    category: "improvement",
    title: "Rising Star",
    body: "Your Attention has improved by 12% recently.",
    icon: "trending_up",
    pillar: "cognition",
    dimension: "",
    created_at: "2026-05-04T04:00:00Z"
  }
]);
