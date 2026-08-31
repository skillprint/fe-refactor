export interface PortalSkill {
  slug?: string;
  name: string;
  pillar: 'mood' | 'cognition' | 'personality';
  blurb: string;
}

export const PORTAL_SKILLS: Record<string, PortalSkill> = {
  "awe": {
    "name": "Awe",
    "pillar": "mood",
    "blurb": "Meet scale, novelty and complexity with a sense of wonder"
  },
  "collaborate": {
    "name": "Collaborate",
    "pillar": "mood",
    "blurb": "Coordinate, share and make room for someone else’s move"
  },
  "creativity": {
    "name": "Creativity",
    "pillar": "mood",
    "blurb": "Find the move nobody showed you"
  },
  "curiosity": {
    "name": "Curiosity",
    "pillar": "mood",
    "blurb": "Poke at the rules to see what gives"
  },
  "empathy": {
    "name": "Empathy",
    "pillar": "mood",
    "blurb": "Read what someone else is feeling and play to it"
  },
  "focus": {
    "name": "Focus",
    "pillar": "mood",
    "blurb": "Hold a narrow attention for a long stretch"
  },
  "grit": {
    "name": "Grit",
    "pillar": "mood",
    "blurb": "Stay with it after the first failure"
  },
  "joy": {
    "name": "Joy",
    "pillar": "mood",
    "blurb": "Play for its own sake, with no score attached"
  },
  "relax": {
    "name": "Relax",
    "pillar": "mood",
    "blurb": "Low pressure, steady pace, room to breathe"
  },
  "action": {
    "name": "Action",
    "pillar": "cognition",
    "blurb": "Convert quick decisions into accurate, well-timed moves"
  },
  "attention": {
    "name": "Attention",
    "pillar": "cognition",
    "blurb": "Hold your focus on what matters and filter out the rest"
  },
  "deduction": {
    "name": "Deduction",
    "pillar": "cognition",
    "blurb": "Sharpen your reasoning and problem-solving"
  },
  "knowledge": {
    "name": "Knowledge",
    "pillar": "cognition",
    "blurb": "Put what you already know to work under time pressure"
  },
  "math": {
    "name": "Math",
    "pillar": "cognition",
    "blurb": "Strengthen your number facility and mental arithmetic"
  },
  "memory": {
    "name": "Memory",
    "pillar": "cognition",
    "blurb": "Enhance your recall and retention abilities"
  },
  "pattern-matching": {
    "name": "Pattern Matching",
    "pillar": "cognition",
    "blurb": "Develop your ability to identify patterns"
  },
  "perceptual-speed": {
    "name": "Perceptual Speed",
    "pillar": "cognition",
    "blurb": "Improve your reaction time and quick thinking"
  },
  "planning": {
    "name": "Planning",
    "pillar": "cognition",
    "blurb": "Think several moves ahead before you commit"
  },
  "spatial": {
    "name": "Spatial",
    "pillar": "cognition",
    "blurb": "Reason about shape, rotation and fit in space"
  },
  "task-switching": {
    "name": "Task Switching",
    "pillar": "cognition",
    "blurb": "Move cleanly between changing rules and goals"
  },
  "timing": {
    "name": "Timing",
    "pillar": "cognition",
    "blurb": "Land the move at exactly the right moment"
  },
  "verbal": {
    "name": "Verbal",
    "pillar": "cognition",
    "blurb": "Expand your vocabulary and word recognition"
  },
  "visualization": {
    "name": "Visualization",
    "pillar": "cognition",
    "blurb": "Picture the outcome before you make the move"
  },
  "agreeableness": {
    "name": "Agreeableness",
    "pillar": "personality",
    "blurb": "How you play when cooperating costs you points"
  },
  "conscientiousness": {
    "name": "Conscientiousness",
    "pillar": "personality",
    "blurb": "How consistently you finish what a session starts"
  },
  "emotional-stability": {
    "name": "Emotional Stability",
    "pillar": "personality",
    "blurb": "How quickly you recover after a run goes wrong"
  },
  "extraversion": {
    "name": "Extraversion",
    "pillar": "personality",
    "blurb": "How much a shared or competitive board changes your play"
  },
  "openness": {
    "name": "Openness",
    "pillar": "personality",
    "blurb": "How readily you try an unfamiliar rule set"
  }
};
