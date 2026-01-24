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

  'plastoblasto': {
    exitButtonPosition: 'top-left',
    hideBottomTabs: true,
    customExitButton: {
      color: 'green',
      size: 'sm'
    }
  }
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
  'box-tower': {
    name: 'Box Tower',
    description: 'Stack boxes as high as you can!',
    image: '/games/live/Box Tower/box-tower.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to drop the box. Stack them perfectly to reach new heights.'
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
  },
  '0hh1': {
    name: '0h h1',
    description: 'A logic game with red and blue tiles',
    image: '/games/live/0hh1/static/screenshot.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Logic', 'Pattern Recognition'],
    instructions: 'Fill the grid with red and blue tiles. No three of the same color in a row. Equal number of red and blue in each row and column.'
  },
  'brick-out': {
    name: 'Brick Out',
    description: 'Break all the bricks',
    image: '/games/live/Brick Out/brick-out.png',
    category: 'Arcade',
    difficulty: 'Easy',
    estimatedTime: '3-8 minutes',
    skills: ['Hand-Eye Coordination', 'Reaction Time'],
    instructions: 'Control the paddle to bounce the ball and break all the bricks.'
  },
  'colorize-2': {
    name: 'Colorize 2',
    description: 'Fill the board with color',
    image: '/games/live/Colorize 2/screenshot.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-10 minutes',
    skills: ['Logic', 'Planning'],
    instructions: 'Fill the board with the target color within the given number of moves.'
  },
  'flapcat-steampunk-2': {
    name: 'Flapcat Steampunk 2',
    description: 'More steampunk flying adventures',
    image: '/games/live/Flapcat Steampunk 2/screenshot.png',
    category: 'Arcade',
    difficulty: 'Hard',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to fly. Avoid obstacles and collect gears.'
  },
  'fruit-sorting': {
    name: 'Fruit Sorting',
    description: 'Sort the fruits into the right baskets',
    image: '/games/live/Fruit Sorting/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Easy',
    estimatedTime: '3-5 minutes',
    skills: ['Sorting', 'Speed'],
    instructions: 'Drag and drop fruits into their corresponding baskets before time runs out.'
  },
  'gems-of-hanoi': {
    name: 'Gems of Hanoi',
    description: 'Classic Tower of Hanoi puzzle',
    image: '/games/live/Gems of Hanoi/screenshot.png',
    category: 'Puzzle',
    difficulty: 'Hard',
    estimatedTime: '10-20 minutes',
    skills: ['Logic', 'Planning', 'Problem Solving'],
    instructions: 'Move the stack of gems from one rod to another. You cannot place a larger gem on top of a smaller one.'
  },
  'gummy-blocks': {
    name: 'Gummy Blocks',
    description: 'Fit the gummy blocks into the grid',
    image: '/games/live/Gummy Blocks/gummy-blocks.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Spatial Reasoning', 'Planning'],
    instructions: 'Drag blocks onto the grid to create full rows or columns to clear them.'
  },
  'hiding-master': {
    name: 'Hiding Master',
    description: 'Hide from the seeker',
    image: '/games/live/Hiding Master/screenshot.png',
    category: 'Arcade',
    difficulty: 'Easy',
    estimatedTime: '2-5 minutes',
    skills: ['Stealth', 'Timing'],
    instructions: 'Move around and hide behind objects to avoid being seen by the seeker.'
  },
  'mahjong-deluxe': {
    name: 'Mahjong Deluxe',
    description: 'Classic tile-matching game',
    image: '/games/live/Mahjong Deluxe/screenshot.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '10-20 minutes',
    skills: ['Pattern Recognition', 'Memory'],
    instructions: 'Match pairs of identical free tiles to remove them from the board.'
  },
  'match-doodle': {
    name: 'Match Doodle',
    description: 'Draw to match items',
    image: '/games/live/Match Doodle/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Easy',
    estimatedTime: '3-8 minutes',
    skills: ['Creativity', 'Pattern Recognition'],
    instructions: 'Draw lines to connect matching items.'
  },
  'photo-hunt': {
    name: 'Photo Hunt',
    description: 'Find the differences between photos',
    image: '/games/live/Photo Hunt/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-10 minutes',
    skills: ['Observation', 'Attention to Detail'],
    instructions: 'Spot and tap the differences between two seemingly identical photos.'
  },
  'space-adventure-pinball': {
    name: 'Space Adventure Pinball',
    description: 'Classic pinball in space',
    image: '/games/live/Space Adventure Pinball/space-adventure-pinball.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Reaction Time', 'Physics Intuition'],
    instructions: 'Use the flippers to keep the ball in play and score points.'
  },
  'stacks-tower': {
    name: 'Stacks Tower',
    description: 'Stack blocks to build a tower',
    image: '/games/live/Stacks Tower/screenshot.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to drop blocks and stack them as high as possible.'
  },
  'star-puzzles': {
    name: 'Star Puzzles',
    description: 'Collect stars in this logic puzzle',
    image: '/games/live/Star Puzzles/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Medium',
    estimatedTime: '5-15 minutes',
    skills: ['Logic', 'Problem Solving'],
    instructions: 'Solve the puzzle to collect all the stars in each level.'
  },
  'sumagi': {
    name: 'Sumagi',
    description: 'Sum matching game',
    image: '/games/live/Sumagi/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Hard',
    estimatedTime: '5-15 minutes',
    skills: ['Math', 'Logic'],
    instructions: 'Combine numbers to reach the target sum.'
  },
  'sweet-memory': {
    name: 'Sweet Memory',
    description: 'Memory matching with sweets',
    image: '/games/live/Sweet Memory/icon_144.png',
    category: 'Puzzle',
    difficulty: 'Easy',
    estimatedTime: '3-5 minutes',
    skills: ['Memory', 'Concentration'],
    instructions: 'Flip cards to find matching pairs of sweets.'
  },
  'whack-em-all': {
    name: 'Whack \'em All',
    description: 'Whack the moles!',
    image: '/games/live/Whack \'em All/screenshot.png',
    category: 'Arcade',
    difficulty: 'Easy',
    estimatedTime: '1-3 minutes',
    skills: ['Reaction Time', 'Hand-Eye Coordination'],
    instructions: 'Tap the moles as they pop up. Avoid hitting the bombs.'
  },
  'infinite-runner-3d': {
    name: 'Infinite Runner 3D',
    description: 'Run and jump in this 3D infinite runner',
    image: '/games/live/Infinite Runner 3D/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'flappy-bird-1': {
    name: 'Flappy Bird',
    description: 'Flappy Bird',
    image: '/games/live/Flappy Bird/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'lastwar-frontline': {
    name: 'Last War Frontline',
    description: 'Last War Frontline',
    image: '/games/live/Last War Frontline/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'fruit-ninja': {
    name: 'Fruit Ninja',
    description: 'Fruit Ninja',
    image: '/games/live/Fruit Ninja/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'whack-em-all': {
    name: 'Whack Em All',
    description: 'Whack Em All',
    image: '/games/live/Whack Em All/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'sumagi': {
    name: 'Sumagi',
    description: 'Sumagi',
    image: '/games/live/Sumagi/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'line-color': {
    name: 'Line Color',
    description: 'Line Color',
    image: '/games/live/Line Color/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
  },
  'plastoblasto': {
    name: 'Plastoblasto',
    description: 'Plastoblasto',
    image: '/games/live/Plastoblasto/icon_144.png',
    category: 'Arcade',
    difficulty: 'Medium',
    estimatedTime: '2-5 minutes',
    skills: ['Timing', 'Precision'],
    instructions: 'Tap to jump and avoid obstacles. Collect coins to score.'
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