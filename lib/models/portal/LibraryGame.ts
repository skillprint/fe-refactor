export interface LibraryGame {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  skills: string[];
  moods: string[];
}

export const generateMockLibraryGames = (): LibraryGame[] => ([
  {
    id: 42,
    name: "Hextris",
    slug: "hextris",
    short_description: "A fast-paced hexagonal puzzle game",
    skills: ["attention", "pattern-matching"],
    moods: ["focus", "grit"]
  }
]);
