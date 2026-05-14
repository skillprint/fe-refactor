export interface LibraryTag {
  slug: string;
  name: string;
}

export interface LibraryGameDetail {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  skills: LibraryTag[];
  moods: LibraryTag[];
  orientation: string;
  url: string;
}

export const generateMockLibraryGameDetail = (): LibraryGameDetail => ({
  id: 42,
  name: "Hextris",
  slug: "hextris",
  short_description: "A fast-paced puzzle game",
  long_description: "Hextris challenges players...",
  skills: [{ slug: "attention", name: "Attention" }],
  moods: [{ slug: "focus", name: "Focus" }],
  orientation: "portrait",
  url: "https://cdn.example.com/media/hextris/index.html"
});
