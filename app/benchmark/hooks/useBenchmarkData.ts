import { useState, useMemo } from 'react';
import { AIModel, BenchmarkDataPoint, VLMSimulatorStep } from '../models/types';

// Raw benchmark records for our models
const MODELS_DATA: AIModel[] = [
  {
    id: 'claude-3-7-sonnet-reasoning',
    name: 'Claude 3.7 Sonnet (Reasoning)',
    provider: 'Anthropic',
    type: 'reasoning',
    overallScore: 92.5,
    costPerGame: 3.80,
    vlmFramesPerSec: 1.8,
    gameScores: {
      colorize: { relax: 91, focus: 84, creativity: 89 },
      hextris: { relax: 78, focus: 96, creativity: 72 },
      box_tower: { relax: 82, focus: 93, creativity: 95 }
    }
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    type: 'vision_agent',
    overallScore: 87.0,
    costPerGame: 0.95,
    vlmFramesPerSec: 3.8,
    gameScores: {
      colorize: { relax: 88, focus: 79, creativity: 86 },
      hextris: { relax: 72, focus: 89, creativity: 70 },
      box_tower: { relax: 77, focus: 88, creativity: 91 }
    }
  },
  {
    id: 'o1-pro',
    name: 'o1-pro',
    provider: 'OpenAI',
    type: 'reasoning',
    overallScore: 94.0,
    costPerGame: 4.20,
    vlmFramesPerSec: 1.2,
    gameScores: {
      colorize: { relax: 93, focus: 89, creativity: 84 },
      hextris: { relax: 80, focus: 98, creativity: 75 },
      box_tower: { relax: 85, focus: 97, creativity: 89 }
    }
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    type: 'reasoning',
    overallScore: 89.8,
    costPerGame: 0.35,
    vlmFramesPerSec: 2.2,
    gameScores: {
      colorize: { relax: 87, focus: 83, creativity: 82 },
      hextris: { relax: 76, focus: 94, creativity: 71 },
      box_tower: { relax: 80, focus: 91, creativity: 88 }
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'vision_agent',
    overallScore: 84.5,
    costPerGame: 0.65,
    vlmFramesPerSec: 5.2,
    gameScores: {
      colorize: { relax: 82, focus: 81, creativity: 80 },
      hextris: { relax: 70, focus: 91, creativity: 68 },
      box_tower: { relax: 74, focus: 86, creativity: 85 }
    }
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    type: 'vision_agent',
    overallScore: 83.2,
    costPerGame: 0.55,
    vlmFramesPerSec: 4.8,
    gameScores: {
      colorize: { relax: 89, focus: 76, creativity: 82 },
      hextris: { relax: 74, focus: 85, creativity: 67 },
      box_tower: { relax: 76, focus: 82, creativity: 87 }
    }
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    type: 'reasoning',
    overallScore: 86.8,
    costPerGame: 0.90,
    vlmFramesPerSec: 2.5,
    gameScores: {
      colorize: { relax: 84, focus: 86, creativity: 78 },
      hextris: { relax: 71, focus: 93, creativity: 66 },
      box_tower: { relax: 75, focus: 89, creativity: 81 }
    }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    type: 'vision_agent',
    overallScore: 74.2,
    costPerGame: 0.08,
    vlmFramesPerSec: 7.2,
    gameScores: {
      colorize: { relax: 75, focus: 68, creativity: 71 },
      hextris: { relax: 62, focus: 79, creativity: 58 },
      box_tower: { relax: 66, focus: 73, creativity: 74 }
    }
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    type: 'vision_agent',
    overallScore: 72.8,
    costPerGame: 0.06,
    vlmFramesPerSec: 8.5,
    gameScores: {
      colorize: { relax: 77, focus: 65, creativity: 72 },
      hextris: { relax: 64, focus: 74, creativity: 55 },
      box_tower: { relax: 68, focus: 71, creativity: 73 }
    }
  },
  {
    id: 'llama-3-1-70b-vision',
    name: 'Llama 3.1 70B (Vision)',
    provider: 'Meta',
    type: 'base_llm',
    overallScore: 70.5,
    costPerGame: 0.22,
    vlmFramesPerSec: 3.2,
    gameScores: {
      colorize: { relax: 71, focus: 62, creativity: 68 },
      hextris: { relax: 58, focus: 73, creativity: 54 },
      box_tower: { relax: 63, focus: 69, creativity: 69 }
    }
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    type: 'base_llm',
    overallScore: 68.4,
    costPerGame: 0.18,
    vlmFramesPerSec: 5.5,
    gameScores: {
      colorize: { relax: 69, focus: 61, creativity: 65 },
      hextris: { relax: 56, focus: 70, creativity: 50 },
      box_tower: { relax: 61, focus: 65, creativity: 67 }
    }
  }
];

// Timeline simulator mock events for the 3 games
const HEXTRIS_SIMULATION: VLMSimulatorStep[] = [
  {
    frame: 1,
    detectedObjects: ['Grey Hexagon', 'Falling Blue Bar', 'Empty Board'],
    action: 'Wait / Assess',
    confidence: 0.99,
    moodAlignment: { relax: 0.6, focus: 0.8, creativity: 0.2 },
    log: 'VLM initialized. Board is clear. Falling blue bar detected from top-right.',
    boardState: { activeBlock: 'blue', rotation: 0, blocksCount: 0, dangerLevel: 'low' }
  },
  {
    frame: 2,
    detectedObjects: ['Grey Hexagon', 'Falling Blue Bar', 'Existing Red Base'],
    action: 'Rotate Hexagon 60deg Counter-Clockwise',
    confidence: 0.94,
    moodAlignment: { relax: 0.5, focus: 0.85, creativity: 0.3 },
    log: 'Scanning base. Red blocks occupy bottom edge. Rotating hexagon to line up blue bar with blue slots.',
    boardState: { activeBlock: 'blue', rotation: 60, blocksCount: 1, dangerLevel: 'low' }
  },
  {
    frame: 3,
    detectedObjects: ['Grey Hexagon', 'Blue Block Placed', 'Falling Green Arrow'],
    action: 'Assess next piece / Stabilize base',
    confidence: 0.97,
    moodAlignment: { relax: 0.7, focus: 0.9, creativity: 0.4 },
    log: 'Blue bar successfully landed. Score +10. Next piece green arrow detected. Planning rotation.',
    boardState: { activeBlock: 'green', rotation: 60, blocksCount: 2, dangerLevel: 'low' }
  },
  {
    frame: 4,
    detectedObjects: ['Grey Hexagon', 'Multiple Stacked Blocks', 'Falling Green Arrow'],
    action: 'Rotate Hexagon 120deg Clockwise',
    confidence: 0.88,
    moodAlignment: { relax: 0.4, focus: 0.92, creativity: 0.3 },
    log: 'Speed increment detected. Green arrow requires quick alignment on north-west edge. Executing double tap.',
    boardState: { activeBlock: 'green', rotation: 180, blocksCount: 3, dangerLevel: 'medium' }
  },
  {
    frame: 5,
    detectedObjects: ['Grey Hexagon', 'Combo Pattern Alert', 'Falling Blue Star'],
    action: 'Rotate Hexagon 60deg Clockwise',
    confidence: 0.96,
    moodAlignment: { relax: 0.3, focus: 0.98, creativity: 0.5 },
    log: 'Alert: 3-stack match imminent on south-west quadrant. Rotating to trigger cascade clear.',
    boardState: { activeBlock: 'blue', rotation: 240, blocksCount: 4, dangerLevel: 'high' }
  },
  {
    frame: 6,
    detectedObjects: ['Grey Hexagon', 'Clear Cascade Triggered', 'No active falling blocks'],
    action: 'Idle / Track score surge',
    confidence: 0.99,
    moodAlignment: { relax: 0.8, focus: 0.95, creativity: 0.6 },
    log: 'Cascade clear! 6 blocks eliminated. Focus score maxed. Score +150. Restoring low danger baseline.',
    boardState: { activeBlock: 'none', rotation: 240, blocksCount: 0, dangerLevel: 'low' }
  }
];

const COLORIZE_SIMULATION: VLMSimulatorStep[] = [
  {
    frame: 1,
    detectedObjects: ['12x12 Pixel Grid', 'Origin (0,0) Teal', '4 Colors Available'],
    action: 'Select Palette Color: Purple',
    confidence: 0.95,
    moodAlignment: { relax: 0.8, focus: 0.7, creativity: 0.7 },
    log: 'Grid is highly fragmented. Origin is Teal. Flooding adjacent Teal blocks with Purple to expand area.',
    boardState: { gridProgress: 20, selectedColor: 'purple', movesLeft: 22, colorLayout: 'mixed' }
  },
  {
    frame: 2,
    detectedObjects: ['12x12 Pixel Grid', 'Connected Purple Blob', 'Targeting Green Clusters'],
    action: 'Select Palette Color: Green',
    confidence: 0.91,
    moodAlignment: { relax: 0.85, focus: 0.72, creativity: 0.75 },
    log: 'Blob size expanded to 28 pixels. Selecting Green next to engulf the large green cluster on the left.',
    boardState: { gridProgress: 45, selectedColor: 'green', movesLeft: 21, colorLayout: 'connected-blob' }
  },
  {
    frame: 3,
    detectedObjects: ['12x12 Pixel Grid', 'Connected Green Blob', 'Isolated Orange Blocks'],
    action: 'Select Palette Color: Orange',
    confidence: 0.96,
    moodAlignment: { relax: 0.9, focus: 0.75, creativity: 0.8 },
    log: 'Grid is 60% uniform. Selecting Orange to merge with the major horizontal orange spine in the center.',
    boardState: { gridProgress: 75, selectedColor: 'orange', movesLeft: 20, colorLayout: 'mostly-solid' }
  },
  {
    frame: 4,
    detectedObjects: ['12x12 Pixel Grid', 'Unified Board', 'Victory Screen'],
    action: 'End Game',
    confidence: 0.99,
    moodAlignment: { relax: 0.95, focus: 0.6, creativity: 0.85 },
    log: '100% uniformity reached in 4 moves. Relax alignment index verified at 0.95. High efficiency flow.',
    boardState: { gridProgress: 100, selectedColor: 'none', movesLeft: 19, colorLayout: 'uniform' }
  }
];

const BOX_TOWER_SIMULATION: VLMSimulatorStep[] = [
  {
    frame: 1,
    detectedObjects: ['Base Platform', 'Swinging Box 1', 'Static Camera'],
    action: 'Release Box at Center-Point (0.0 offset)',
    confidence: 0.98,
    moodAlignment: { relax: 0.6, focus: 0.75, creativity: 0.5 },
    log: 'Box swinging smoothly. Center coordinate aligned. Releasing first foundation brick.',
    boardState: { height: 1, wobble: 0, boxSize: 'large', windSpeed: 0 }
  },
  {
    frame: 2,
    detectedObjects: ['Foundation Block', 'Swinging Box 2', 'Wind Speed 1.2m/s'],
    action: 'Offset release by +0.3 to counteract wind',
    confidence: 0.89,
    moodAlignment: { relax: 0.5, focus: 0.8, creativity: 0.8 },
    log: 'Wind pushing box right. Releasing with a counter-offset to land squarely on the center of gravity.',
    boardState: { height: 2, wobble: 0.02, boxSize: 'large', windSpeed: 1.2 }
  },
  {
    frame: 3,
    detectedObjects: ['Tower of 5 Blocks', 'Swinging Narrow Box 6', 'Wobble alert'],
    action: 'Wait for pendulum apex to align weight',
    confidence: 0.92,
    moodAlignment: { relax: 0.45, focus: 0.88, creativity: 0.85 },
    log: 'Center of mass shifting left. Tower is swaying. Releasing narrow block 6 at the rightward apex to restore balance.',
    boardState: { height: 6, wobble: 0.15, boxSize: 'narrow', windSpeed: 0.8 }
  },
  {
    frame: 4,
    detectedObjects: ['Stabilized Tower of 10 Blocks', 'Swinging Heavy Box 11', 'Complex shape stack'],
    action: 'Release precisely at intersection edge',
    confidence: 0.94,
    moodAlignment: { relax: 0.35, focus: 0.92, creativity: 0.94 },
    log: 'High altitude reached. Stacking narrow, structural overhang blocks creatively to bypass wind eddies.',
    boardState: { height: 11, wobble: 0.05, boxSize: 'narrow', windSpeed: 2.1 }
  },
  {
    frame: 5,
    detectedObjects: ['Overhanging Tower structure', 'Swinging Anchor block', 'Victory goal met'],
    action: 'Release anchor block for structural lock',
    confidence: 0.97,
    moodAlignment: { relax: 0.6, focus: 0.9, creativity: 0.96 },
    log: 'Victory threshold passed. Structural load locks the tower in equilibrium. Creativity and focus scores validated.',
    boardState: { height: 12, wobble: 0.01, boxSize: 'large', windSpeed: 1.5 }
  }
];

export function useBenchmarkData(gameFilter: string, moodFilter: string) {
  // Compute leaderboard and scatter plot datasets based on filters
  const filteredModels = useMemo(() => {
    return MODELS_DATA.map((model) => {
      // If we filtered by a specific game, retrieve that game's score
      // If we filtered by all games, retrieve the model's overall score
      let score = model.overallScore;
      let cost = model.costPerGame;
      
      const gameKeys = gameFilter === 'all' ? ['colorize', 'hextris', 'box_tower'] : [gameFilter];
      const moodKeys = moodFilter === 'all' ? ['relax', 'focus', 'creativity'] : [moodFilter];

      // Calculate the specific score according to filter choices
      let scoreSum = 0;
      let scoreCount = 0;
      
      gameKeys.forEach((gameKey) => {
        const gameScores = model.gameScores[gameKey];
        if (gameScores) {
          moodKeys.forEach((moodKey) => {
            const moodScore = gameScores[moodKey];
            if (typeof moodScore === 'number') {
              scoreSum += moodScore;
              scoreCount++;
            }
          });
        }
      });

      if (scoreCount > 0) {
        score = parseFloat((scoreSum / scoreCount).toFixed(1));
      }

      // Adjust cost slightly per game to show differences on scatter plots
      if (gameFilter !== 'all') {
        if (gameFilter === 'hextris') {
          // Vision agents require higher frame rates (more VLM tokens)
          cost = model.type === 'vision_agent' ? model.costPerGame * 1.3 : model.costPerGame;
        } else if (gameFilter === 'colorize') {
          // Colorize is turn-based, very cheap move cost
          cost = model.costPerGame * 0.5;
        } else if (gameFilter === 'box_tower') {
          // Physics balancing, medium density action
          cost = model.costPerGame * 0.9;
        }
      }
      
      cost = parseFloat(cost.toFixed(3));

      return {
        ...model,
        displayedScore: score,
        displayedCost: cost,
      };
    });
  }, [gameFilter, moodFilter]);

  // Scatter Plot Data Formatter
  const scatterPlotData = useMemo(() => {
    return filteredModels.map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      type: model.type,
      score: model.displayedScore,
      cost: model.displayedCost,
      vlmSpeed: model.vlmFramesPerSec
    }));
  }, [filteredModels]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalModels = MODELS_DATA.length;
    
    // Average scores
    let bestScore = 0;
    let bestModel = '';
    let highestFPS = 0;
    let fastestModel = '';

    filteredModels.forEach((m) => {
      if (m.displayedScore > bestScore) {
        bestScore = m.displayedScore;
        bestModel = m.name;
      }
      if (m.vlmFramesPerSec > highestFPS) {
        highestFPS = m.vlmFramesPerSec;
        fastestModel = m.name;
      }
    });

    // Average cost
    const avgCost = filteredModels.reduce((acc, m) => acc + m.displayedCost, 0) / totalModels;

    return {
      totalModels,
      bestScore,
      bestModel,
      avgCost: parseFloat(avgCost.toFixed(2)),
      highestFPS,
      fastestModel
    };
  }, [filteredModels]);

  // Return the correct simulator steps based on selected game
  const simulatorSteps = useMemo(() => {
    switch (gameFilter) {
      case 'colorize':
        return COLORIZE_SIMULATION;
      case 'box_tower':
        return BOX_TOWER_SIMULATION;
      case 'hextris':
      default:
        return HEXTRIS_SIMULATION;
    }
  }, [gameFilter]);

  return {
    models: filteredModels,
    scatterData: scatterPlotData,
    stats,
    simulatorSteps,
  };
}
