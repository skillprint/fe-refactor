export interface DimensionItem {
  slug: string;
  display_name: string;
  about: string;
}

export interface ReferenceDimensions {
  moods: DimensionItem[];
  skills: DimensionItem[];
  personality_traits: DimensionItem[];
}

export const generateMockReferenceDimensions = (): ReferenceDimensions => ({
  moods: [
    { slug: "relax", display_name: "Relax", about: "A state of calm and low arousal..." },
    { slug: "focus", display_name: "Focus", about: "Deep, single-pointed concentration..." }
  ],
  skills: [
    { slug: "attention", display_name: "Attention", about: "Sustained focus on relevant stimuli..." },
    { slug: "memory", display_name: "Memory", about: "Working memory capacity..." }
  ],
  personality_traits: [
    { slug: "openness", display_name: "Openness", about: "Willingness to explore..." },
    { slug: "conscientiousness", display_name: "Conscientiousness", about: "..." }
  ]
});
