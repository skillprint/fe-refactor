export interface MetricAbout {
  pillar: string;
  dimension: string;
  display_name: string;
  about: string;
}

export const generateMockMetricAbout = (): MetricAbout => ({
  pillar: "cognition",
  dimension: "attention",
  display_name: "Attention",
  about: "Sustained focus..."
});
