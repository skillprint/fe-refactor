/**
 * Maps a backend badge (Talent) onto the badge art shipped with the redesign.
 *
 * The backend only knows the animal's name and species; the art lives at
 * /assets/images/badges/collection/<animal>/<animal>-badge-<colour>-<shape>.svg
 * (see manifest.json alongside it). Colour is fixed per animal; the shape is a
 * rank marker we derive from the badge's points.
 */

export const BADGE_ART_BASE = '/assets/images/badges/collection';

export const BADGE_SHAPES = ['sparkle', 'shield', 'flower', 'gear', 'star', 'sunburst'] as const;
export type BadgeShape = (typeof BADGE_SHAPES)[number];

export const BADGE_ANIMALS: Record<string, { colour: string; animal: string; title: string }> = {
  'aardvark': { colour: 'cool-green', animal: 'Nocturnal Aardvark', title: 'After Hours' },
  'anteater': { colour: 'cool-lime', animal: 'Adding Anteater', title: 'Number Crunching' },
  'bat': { colour: 'mindset-magenta', animal: 'Plotting Bat', title: 'Anticipating' },
  'beaver': { colour: 'mindset-violet', animal: 'Building Beaver', title: 'Organizing' },
  'bushbaby': { colour: 'personality-blue', animal: 'Brisk Bushbaby', title: 'Reaction Time' },
  'chimpanzee': { colour: 'personality-mint', animal: 'Cool Chimpanzee', title: 'Response Control' },
  'cow': { colour: 'skills-orange', animal: 'Constant Cow', title: 'Consistent' },
  'coyote': { colour: 'skills-pink', animal: 'Canny Coyote', title: 'Sharp Mind' },
  'cuttlefish': { colour: 'cool-green', animal: 'Copycat Cuttlefish', title: 'Pattern Matching' },
  'donkey': { colour: 'cool-lime', animal: 'Dogged Donkey', title: 'Grit' },
  'elephant': { colour: 'mindset-magenta', animal: 'Encyclopedic Elephant', title: 'Memory' },
  'elephant-shrew': { colour: 'mindset-violet', animal: 'Sifting Shrew', title: 'Comparing' },
  'fennec-fox': { colour: 'personality-blue', animal: 'Fixated Fennec Fox', title: 'Focus' },
  'gazelle': { colour: 'personality-mint', animal: 'Galloping Gazelle', title: 'Speed Demon' },
  'golden-wolf': { colour: 'skills-orange', animal: 'Watchful Wolf', title: 'Keen Eye' },
  'gorilla': { colour: 'skills-pink', animal: 'Gameplan Gorilla', title: 'Planning' },
  'hare': { colour: 'cool-green', animal: 'Hurried Hare', title: 'Processing' },
  'lion': { colour: 'cool-lime', animal: 'Logical Lion', title: 'Reasoning' },
  'mouse': { colour: 'mindset-magenta', animal: 'Meticulous Mouse', title: 'Detail Oriented' },
  'platypus': { colour: 'mindset-violet', animal: 'Puzzling Platypus', title: 'Puzzle Master' },
  'porpoise': { colour: 'personality-blue', animal: 'Picturing Porpoise', title: 'Visualization' },
  'puma': { colour: 'personality-mint', animal: 'Pivoting Puma', title: 'Task Switching' },
  'racoon': { colour: 'skills-orange', animal: 'Resourceful Racoon', title: 'Adaptability' },
  'sea-otter': { colour: 'skills-pink', animal: 'Studious Sea Otter', title: 'Active Learner' },
  'seal': { colour: 'cool-green', animal: 'Supple Seal', title: 'Flexibility' },
  'shark': { colour: 'cool-lime', animal: 'Sleepless Shark', title: 'Marathon Runner' },
  'squirrel': { colour: 'mindset-magenta', animal: 'Savvy Squirrel', title: 'Cleverness' },
  'tapir': { colour: 'mindset-violet', animal: 'Toddling Tapir', title: 'First Steps' },
  'wildbeest': { colour: 'personality-blue', animal: 'Wayfinding Wildebeest', title: 'Spatial' },
};

// Species names the backend uses that differ from the manifest folder names.
const SPECIES_ALIASES: Record<string, string> = {
  raccoon: 'racoon',
  wildebeest: 'wildbeest',
  wolf: 'golden-wolf',
  shrew: 'elephant-shrew',
  fox: 'fennec-fox',
  otter: 'sea-otter',
  'bush-baby': 'bushbaby',
  chimp: 'chimpanzee',
};

function normalise(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Resolve the manifest animal slug for a badge, or null when no art exists. */
export function resolveBadgeAnimal(animalSpecies?: string | null, animalName?: string | null): string | null {
  const species = normalise(animalSpecies);
  if (species) {
    if (BADGE_ANIMALS[species]) return species;
    if (SPECIES_ALIASES[species]) return SPECIES_ALIASES[species];
    const partial = Object.keys(BADGE_ANIMALS).find((slug) => species.includes(slug) || slug.includes(species));
    if (partial) return partial;
  }
  const name = normalise(animalName);
  if (name) {
    const byName = Object.keys(BADGE_ANIMALS).find((slug) => name.includes(slug));
    if (byName) return byName;
    const alias = Object.keys(SPECIES_ALIASES).find((key) => name.includes(key));
    if (alias) return SPECIES_ALIASES[alias];
  }
  return null;
}

/** Shape marks rank; we tier it off the points a badge is worth. */
export function badgeShapeForPoints(points: number | null | undefined): BadgeShape {
  const p = points || 0;
  if (p <= 10) return 'sparkle';
  if (p <= 20) return 'shield';
  if (p <= 30) return 'flower';
  if (p <= 40) return 'gear';
  if (p <= 50) return 'star';
  return 'sunburst';
}

export function getBadgeArt(
  badge: { animalSpecies?: string | null; animalName?: string | null; points?: number | null }
): string | null {
  const animal = resolveBadgeAnimal(badge.animalSpecies, badge.animalName);
  if (!animal) return null;
  const { colour } = BADGE_ANIMALS[animal];
  const shape = badgeShapeForPoints(badge.points);
  return `${BADGE_ART_BASE}/${animal}/${animal}-badge-${colour}-${shape}.svg`;
}
