export const MOOD_GAMES = [
  { id: 'space-trip', slug: 'space-trip', name: 'Space Trip', title: 'Space Trip', description: 'Explore the universe', image: '/skillprint-portal-redesign/assets/images/games/game-space-trip.svg', url: '/game/space-trip', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] },
  { id: 'i-love-hue', slug: 'i-love-hue', name: 'I Love Hue', title: 'I Love Hue', description: 'A relaxing color puzzle game', image: '/skillprint-portal-redesign/assets/images/games/game-color.svg', url: '/game/i-love-hue', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] },
  { id: 'space-adventure-pinball', slug: 'space-adventure-pinball', name: 'Space Adventure Pinball', title: 'Space Adventure Pinball', description: 'Pinball in space!', image: '/skillprint-portal-redesign/assets/images/games/game-arcade-machine.svg', url: '/game/space-adventure-pinball', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] }
];

export const COGNITION_GAMES = [
  { id: 'bubble-spirit', slug: 'bubble-spirit', name: 'Bubble Spirit', title: 'Bubble Spirit', description: 'Pop the bubbles', image: '/skillprint-portal-redesign/assets/images/games/game-bubbles.svg', url: '/game/bubble-spirit', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] },
  { id: 'fruit-boom', slug: 'fruit-boom', name: 'Fruit Boom', title: 'Fruit Boom', description: 'Slice fruits for points', image: '/skillprint-portal-redesign/assets/images/games/game-fruit.svg', url: '/game/fruit-boom', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] },
  { id: 'mahjong-deluxe', slug: 'mahjong-deluxe', name: 'Mahjong Deluxe', title: 'Mahjong Deluxe', description: 'Classic mahjong matching', image: '/skillprint-portal-redesign/assets/images/games/game-mahjong.svg', url: '/game/mahjong-deluxe', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] }
];

export const PERSONALITY_GAMES = [
  { id: 'hextris', slug: 'hextris', name: 'Hextris', title: 'Hextris', description: 'Fast paced puzzle game', image: '/skillprint-portal-redesign/assets/images/games/game-hextris.svg', url: '/game/hextris', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] },
  { id: 'word-search', slug: 'word-search', name: 'Word Search', title: 'Word Search', description: 'Find all the words', image: '/skillprint-portal-redesign/assets/images/games/game-crossword.svg', url: '/game/word-search', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] },
  { id: '2048', slug: '2048', name: '2048', title: '2048', description: 'Join numbers to get 2048', image: '/skillprint-portal-redesign/assets/images/games/game-number.svg', url: '/game/2048', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] }
];

export const MOOD_FEATURED = {
  skillName: 'Focus',
  skillSlug: 'focus',
  skillDescription: 'Hold a narrow attention for a long stretch',
  iconId: 'ti-mood-focus',
  dimensionName: 'Mood',
  games: MOOD_GAMES
};

export const MOOD_SKILLS = [
  { id: 'awe', name: 'Awe', description: 'Meet scale, novelty and complexity with a sense of wonder', dimension: 'mood' as const, iconId: 'ti-mood-awe', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'collaborate', name: 'Collaborate', description: 'Coordinate, share and make room for someone else\'s move', dimension: 'mood' as const, iconId: 'ti-mood-collaborate', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'creativity', name: 'Creativity', description: 'Find the move nobody showed you', dimension: 'mood' as const, iconId: 'ti-mood-creativity', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'curiosity', name: 'Curiosity', description: 'Poke at the rules to see what gives', dimension: 'mood' as const, iconId: 'ti-mood-curiosity', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'empathy', name: 'Empathy', description: 'Read what someone else is feeling and play to it', dimension: 'mood' as const, iconId: 'ti-mood-empathy', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'focus', name: 'Focus', description: 'Hold a narrow attention for a long stretch', dimension: 'mood' as const, iconId: 'ti-mood-focus', games: MOOD_GAMES, progressPercentage: 45 },
];

export const COGNITION_FEATURED = {
  skillName: 'Pattern Matching',
  skillSlug: 'pattern-matching',
  skillDescription: 'Develop your ability to identify patterns',
  iconId: 'ti-cognition-pattern-matching',
  dimensionName: 'Cognition',
  games: COGNITION_GAMES
};

export const COGNITION_SKILLS = [
  { id: 'action', name: 'Action', description: 'Convert quick decisions into accurate, well-timed moves', dimension: 'cognition' as const, iconId: 'ti-cognition-action', games: COGNITION_GAMES, progressPercentage: 81 },
  { id: 'attention', name: 'Attention', description: 'Hold your focus on what matters and filter out the rest', dimension: 'cognition' as const, iconId: 'ti-cognition-attention', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'deduction', name: 'Deduction', description: 'Sharpen your reasoning and problem-solving', dimension: 'cognition' as const, iconId: 'ti-cognition-deduction', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'knowledge', name: 'Knowledge', description: 'Put what you already know to work under time pressure', dimension: 'cognition' as const, iconId: 'ti-cognition-knowledge', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'math', name: 'Math', description: 'Strengthen your number facility and mental arithmetic', dimension: 'cognition' as const, iconId: 'ti-cognition-math', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'pattern-matching', name: 'Pattern Matching', description: 'Develop your ability to identify patterns', dimension: 'cognition' as const, iconId: 'ti-cognition-pattern-matching', games: COGNITION_GAMES, progressPercentage: 60 },
];

export const PERSONALITY_FEATURED = {
  skillName: 'Openness',
  skillSlug: 'openness',
  skillDescription: 'Be open to new experiences and ideas',
  iconId: 'ti-personality-openness',
  dimensionName: 'Personality',
  games: PERSONALITY_GAMES
};

export const PERSONALITY_SKILLS = [
  { id: 'agreeableness', name: 'Agreeableness', description: 'Be compassionate and cooperative towards others', dimension: 'personality' as const, iconId: 'ti-personality-agreeableness', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'conscientiousness', name: 'Conscientiousness', description: 'Show self-discipline and aim for achievement', dimension: 'personality' as const, iconId: 'ti-personality-conscientiousness', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'extraversion', name: 'Extraversion', description: 'Seek fulfillment from sources outside the self', dimension: 'personality' as const, iconId: 'ti-personality-extraversion', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'emotional-stability', name: 'Emotional Stability', description: 'Experience emotions without letting them overwhelm you', dimension: 'personality' as const, iconId: 'ti-personality-emotional-stability', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'openness', name: 'Openness', description: 'Be open to new experiences and ideas', dimension: 'personality' as const, iconId: 'ti-personality-openness', games: PERSONALITY_GAMES, progressPercentage: 75 },
];

export const ALL_SKILLS = [
  ...MOOD_SKILLS,
  ...COGNITION_SKILLS,
  ...PERSONALITY_SKILLS,
];

export const getSkillById = (id: string) => {
  return ALL_SKILLS.find(s => s.id === id);
};
