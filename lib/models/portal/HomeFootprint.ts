export interface RadarAxis {
  pillar: string;
  slug: string;
  label: string;
  score: number;
}

export interface HomeFootprint {
  axes: RadarAxis[];
}

export const generateMockHomeFootprint = (): HomeFootprint => ({
  axes: [
    { pillar: "cognition", slug: "attention", label: "Attention", score: 81 },
    { pillar: "mood", slug: "focus", label: "Focus", score: 74 }
  ]
});
