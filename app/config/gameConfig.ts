export interface GameConfig {
  exitButtonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  hideBottomTabs?: boolean;
  customExitButton?: {
    icon?: string;
    color?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'gray';
    size?: 'sm' | 'md' | 'lg';
  };
}

export interface GameDetails {
  name: string;
  description: string;
  image?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  estimatedTime?: string;
  skills?: string[];
  instructions?: string;
}

export const gameConfigs: Record<string, GameConfig> = {
  // Default configuration for games without specific config
  default: {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
  },

  // Specific game configurations
  '2048': {
    exitButtonPosition: 'top-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'blue',
      size: 'md'
    }
  },

  'alchemy': {
    exitButtonPosition: 'bottom-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'purple',
      size: 'lg'
    }
  },

  'bubble-spirit': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'blue',
      size: 'md'
    }
  },

  'change-word': {
    exitButtonPosition: 'bottom-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'green',
      size: 'sm'
    }
  },

  'crossy-chicken': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'orange',
      size: 'md'
    }
  },

  'flapcat-steampunk': {
    exitButtonPosition: 'top-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'gray',
      size: 'md'
    }
  },

  'fruit-boom': {
    exitButtonPosition: 'bottom-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'green',
      size: 'lg'
    }
  },

  'garden-match': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'green',
      size: 'md'
    }
  },

  'hextris': {
    exitButtonPosition: 'bottom-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'purple',
      size: 'sm'
    }
  },

  'i-love-hue': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'purple',
      size: 'md'
    }
  },

  'impossible-10': {
    exitButtonPosition: 'top-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'red',
      size: 'lg'
    }
  },

  'katana-fruits': {
    exitButtonPosition: 'bottom-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'orange',
      size: 'md'
    }
  },

  'mine-rusher': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'gray',
      size: 'md'
    }
  },

  'snake-attack': {
    exitButtonPosition: 'top-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'green',
      size: 'sm'
    }
  },

  'space-trip': {
    exitButtonPosition: 'bottom-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'blue',
      size: 'lg'
    }
  },

  'ultimate-sudoku': {
    exitButtonPosition: 'top-right',
    hideBottomTabs: true,
    customExitButton: {
      color: 'blue',
      size: 'md'
    }
  },
};

// Game details data
export const gameDetails: Record<string, GameDetails> = {
  '2048': {
    name: '2048',
    description: 'Slide tiles to reach 2048',
    image: '/games/live/2048/screenshot.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Strategic Thinking', 'Pattern Recognition', 'Planning'],
    instructions: 'Use arrow keys to slide tiles. When two tiles with the same number touch, they merge into one. Try to reach the 2048 tile!'
  },
  'alchemy': {
    name: 'Alchemy',
    description: 'Combine elements to create new ones',
    image: '/games/live/Alchemy/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Easy',
    estimatedTime: '10-30 minutes',
    skills: ['Creativity', 'Logical Thinking', 'Experimentation'],
    instructions: 'Drag and drop elements to combine them and discover new elements. Start with basic elements like fire, water, earth, and air.'
  },
  'bubble-spirit': {
    name: 'Bubble Spirit',
    description: 'Pop bubbles in this puzzle game',
    image: '/games/live/Bubble Spirit/bubble-spirit.png',
    category: 'Puzzle',
    difficulty: 'Easy',
    estimatedTime: '5-10 minutes',
    skills: ['Hand-Eye Coordination', 'Pattern Matching', 'Quick Thinking'],
    instructions: 'Click on groups of 3 or more bubbles of the same color to pop them. Clear the board to advance to the next level.'
  },
  'change-word': {
    name: 'Change Word',
    description: 'Transform words letter by letter',
    category: 'Word Game',
    difficulty: 'Medium',
    estimatedTime: '3-8 minutes',
    skills: ['Vocabulary', 'Word Recognition', 'Lateral Thinking'],
    instructions: 'Change one letter at a time to transform the starting word into the target word. Each intermediate word must be a valid English word.'
  },
  'crossy-chicken': {
    name: 'Crossy Chicken',
    description: 'Help the chicken cross the road safely',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Reaction Time', 'Risk Assessment', 'Quick Decision Making'],
    instructions: 'Tap to make the chicken jump forward. Avoid cars, trains, and water. Collect coins for bonus points.'
  },
  'flapcat-steampunk': {
    name: 'Flapcat Steampunk',
    description: 'Navigate through obstacles',
    category: 'Arcade',
    difficulty: 'Hard',
    estimatedTime: '1-3 minutes',
    skills: ['Hand-Eye Coordination', 'Timing', 'Persistence'],
    instructions: 'Click or tap to make the cat flap its wings and fly. Navigate through pipes and obstacles without hitting them.'
  },
  'fruit-boom': {
    name: 'Fruit Boom',
    description: 'Match and explode fruits',
    category: 'Match-3',
    difficulty: 'Easy',
    estimatedTime: '5-10 minutes',
    skills: ['Pattern Recognition', 'Strategic Planning', 'Quick Thinking'],
    instructions: 'Match 3 or more fruits of the same type to make them explode. Create special combinations for powerful effects.'
  },
  'garden-match': {
    name: 'Garden Match',
    description: 'Match garden items in this puzzle',
    category: 'Match-3',
    difficulty: 'Easy',
    estimatedTime: '5-15 minutes',
    skills: ['Pattern Recognition', 'Strategic Thinking', 'Visual Memory'],
    instructions: 'Swap adjacent tiles to create matches of 3 or more. Clear objectives to complete each level.'
  },
  'hextris': {
    name: 'Hextris',
    description: 'Rotate and match hexagons',
    category: 'Puzzle',
    difficulty: 'Hard',
    estimatedTime: '3-8 minutes',
    skills: ['Spatial Reasoning', 'Quick Thinking', 'Hand-Eye Coordination'],
    instructions: 'Rotate the hexagon to align falling pieces. Create complete rows to clear them and score points.'
  },
  'i-love-hue': {
    name: 'I Love Hue',
    description: 'Arrange colors in perfect harmony',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '10-20 minutes',
    skills: ['Color Theory', 'Visual Perception', 'Patience'],
    instructions: 'Rearrange the colored tiles to create a smooth gradient. Each level gets progressively more challenging.'
  },
  'impossible-10': {
    name: 'Impossible 10',
    description: 'Solve the impossible puzzle',
    category: 'Puzzle',
    difficulty: 'Hard',
    estimatedTime: '15-45 minutes',
    skills: ['Problem Solving', 'Logical Thinking', 'Persistence'],
    instructions: 'Arrange the numbered tiles in order from 1 to 10. Only certain moves are allowed.'
  },
  'katana-fruits': {
    name: 'Katana Fruits',
    description: 'Slice fruits with your katana',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Hand-Eye Coordination', 'Timing', 'Quick Reactions'],
    instructions: 'Slice fruits by swiping your finger or mouse. Avoid bombs. Chain multiple slices for combo bonuses.'
  },
  'mine-rusher': {
    name: 'Mine Rusher',
    description: 'Navigate through the minefield',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Risk Assessment', 'Strategic Planning', 'Memory'],
    instructions: 'Click on safe squares to reveal numbers. Use the numbers to identify where mines are located.'
  },
  'snake-attack': {
    name: 'Snake Attack',
    description: 'Grow your snake by eating food',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '3-8 minutes',
    skills: ['Strategic Planning', 'Risk Management', 'Quick Thinking'],
    instructions: 'Control the snake to eat food and grow longer. Avoid hitting walls or your own tail.'
  },
  'space-trip': {
    name: 'Space Trip',
    description: 'Explore space in this adventure',
    category: 'Adventure',
    difficulty: 'Medium',
    estimatedTime: '10-25 minutes',
    skills: ['Exploration', 'Problem Solving', 'Resource Management'],
    instructions: 'Navigate through space, collect resources, and solve puzzles to progress through the adventure.'
  },
  'ultimate-sudoku': {
    name: 'Ultimate Sudoku',
    description: 'Solve number puzzles',
    category: 'Puzzle',
    difficulty: 'Hard',
    estimatedTime: '15-60 minutes',
    skills: ['Logical Thinking', 'Number Recognition', 'Problem Solving'],
    instructions: 'Fill in the grid so that every row, column, and 3x3 box contains the digits 1-9 without repetition.'
  }
};

export function getGameConfig(gameSlug: string): GameConfig {
  // Normalize the slug for matching (lowercase, replace spaces with hyphens)
  const normalizedSlug = gameSlug.toLowerCase().replace(/\s+/g, '-');

  // Try to find exact match first
  if (gameConfigs[normalizedSlug]) {
    return gameConfigs[normalizedSlug];
  }

  // Try to find partial match
  const partialMatch = Object.keys(gameConfigs).find(key =>
    key !== 'default' && normalizedSlug.includes(key)
  );

  if (partialMatch) {
    return gameConfigs[partialMatch];
  }

  // Return default configuration
  return gameConfigs.default;
}

export function getGameDetails(gameSlug: string): GameDetails | null {
  // Normalize the slug for matching (lowercase, replace spaces with hyphens)
  const normalizedSlug = gameSlug.toLowerCase().replace(/\s+/g, '-');

  // Try to find exact match first
  if (gameDetails[normalizedSlug]) {
    return gameDetails[normalizedSlug];
  }

  // Try to find partial match
  const partialMatch = Object.keys(gameDetails).find(key =>
    normalizedSlug.includes(key)
  );

  if (partialMatch) {
    return gameDetails[partialMatch];
  }

  // Return null if no match found
  return null;
}

export const knownGameSlugs = [
  '0hh1',
  '2048',
  'alchemy',
  'box-tower',
  'brick-out',
  'bubble-spirit',
  'change-word',
  'colorize-2',
  'crossy-chicken',
  'flapcat-steampunk',
  'flapcat-steampunk-2',
  'fruit-boom',
  'fruit-sorting',
  'garden-match',
  'gems-of-hanoi',
  'gummy-blocks',
  'hextris',
  'hiding-master',
  'i-love-hue',
  'impossible-10',
  'katana-fruits',
  'mahjong-deluxe',
  'match-doodle',
  'mine-rusher',
  'photo-hunt',
  'snake-attack',
  'space-adventure-pinball',
  'space-trip',
  'stacks-tower',
  'star-puzzles',
  'sumagi',
  'sweet-memory',
  'ultimate-sudoku',
  'whack-em-all',
]; 