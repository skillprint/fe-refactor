export interface DistributionBucket {
  range: string;
  count: number;
}

export interface MetricDistribution {
  pillar: string;
  dimension: string;
  histogram: DistributionBucket[];
  total_users: number;
  your_score: number;
}

export const generateMockMetricDistribution = (): MetricDistribution => ({
  pillar: "cognition",
  dimension: "attention",
  histogram: [
    { range: "0-10", count: 2 },
    { range: "10-20", count: 5 }
  ],
  total_users: 324,
  your_score: 75
});
