import React from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { SkillDimensionSection } from '@/components/SkillDimensionSection';
import { SkillsRail } from '@/components/SkillsRail';
import { MockDataTag } from '@/components/MockDataTag';

const MOOD_GAMES = [
  { id: 'space-trip', slug: 'space-trip', name: 'Space Trip', title: 'Space Trip', description: 'Explore the universe', image: '/skillprint-portal-redesign/assets/images/games/game-space-trip.svg', url: '/game_session/?game=space-trip', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] },
  { id: 'i-love-hue', slug: 'i-love-hue', name: 'I Love Hue', title: 'I Love Hue', description: 'A relaxing color puzzle game', image: '/skillprint-portal-redesign/assets/images/games/game-color.svg', url: '/game_session/?game=i-love-hue', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] },
  { id: 'space-adventure-pinball', slug: 'space-adventure-pinball', name: 'Space Adventure Pinball', title: 'Space Adventure Pinball', description: 'Pinball in space!', image: '/skillprint-portal-redesign/assets/images/games/game-arcade-machine.svg', url: '/game_session/?game=space-adventure-pinball', skills: [{ id: 'focus', name: 'Focus', dimension: 'mood' as const }] }
];

const COGNITION_GAMES = [
  { id: 'bubble-spirit', slug: 'bubble-spirit', name: 'Bubble Spirit', title: 'Bubble Spirit', description: 'Pop the bubbles', image: '/skillprint-portal-redesign/assets/images/games/game-bubbles.svg', url: '/game_session/?game=bubble-spirit', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] },
  { id: 'fruit-boom', slug: 'fruit-boom', name: 'Fruit Boom', title: 'Fruit Boom', description: 'Slice fruits for points', image: '/skillprint-portal-redesign/assets/images/games/game-fruit.svg', url: '/game_session/?game=fruit-boom', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] },
  { id: 'mahjong-deluxe', slug: 'mahjong-deluxe', name: 'Mahjong Deluxe', title: 'Mahjong Deluxe', description: 'Classic mahjong matching', image: '/skillprint-portal-redesign/assets/images/games/game-mahjong.svg', url: '/game_session/?game=mahjong-deluxe', skills: [{ id: 'pattern-matching', name: 'Pattern Matching', dimension: 'cognition' as const }] }
];

const PERSONALITY_GAMES = [
  { id: 'hextris', slug: 'hextris', name: 'Hextris', title: 'Hextris', description: 'Fast paced puzzle game', image: '/skillprint-portal-redesign/assets/images/games/game-hextris.svg', url: '/game_session/?game=hextris', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] },
  { id: 'word-search', slug: 'word-search', name: 'Word Search', title: 'Word Search', description: 'Find all the words', image: '/skillprint-portal-redesign/assets/images/games/game-crossword.svg', url: '/game_session/?game=word-search', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] },
  { id: '2048', slug: '2048', name: '2048', title: '2048', description: 'Join numbers to get 2048', image: '/skillprint-portal-redesign/assets/images/games/game-number.svg', url: '/game_session/?game=2048', skills: [{ id: 'openness', name: 'Openness', dimension: 'personality' as const }] }
];

const MOOD_FEATURED = {
  skillName: 'Focus',
  skillSlug: 'focus',
  skillDescription: 'Hold a narrow attention for a long stretch',
  iconId: 'ti-mood-focus',
  dimensionName: 'Mood',
  games: MOOD_GAMES
};

const MOOD_SKILLS = [
  { id: 'awe', name: 'Awe', description: 'Meet scale, novelty and complexity with a sense of wonder', dimension: 'mood' as const, iconId: 'ti-mood-awe', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'collaborate', name: 'Collaborate', description: 'Coordinate, share and make room for someone else\'s move', dimension: 'mood' as const, iconId: 'ti-mood-collaborate', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'creativity', name: 'Creativity', description: 'Find the move nobody showed you', dimension: 'mood' as const, iconId: 'ti-mood-creativity', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'curiosity', name: 'Curiosity', description: 'Poke at the rules to see what gives', dimension: 'mood' as const, iconId: 'ti-mood-curiosity', games: MOOD_GAMES, progressPercentage: 0 },
  { id: 'empathy', name: 'Empathy', description: 'Read what someone else is feeling and play to it', dimension: 'mood' as const, iconId: 'ti-mood-empathy', games: MOOD_GAMES, progressPercentage: 0 }
];

const COGNITION_FEATURED = {
  skillName: 'Pattern Matching',
  skillSlug: 'pattern-matching',
  skillDescription: 'Develop your ability to identify patterns',
  iconId: 'ti-cognition-pattern-matching',
  dimensionName: 'Cognition',
  games: COGNITION_GAMES
};

const COGNITION_SKILLS = [
  { id: 'action', name: 'Action', description: 'Convert quick decisions into accurate, well-timed moves', dimension: 'cognition' as const, iconId: 'ti-cognition-action', games: COGNITION_GAMES, progressPercentage: 81 },
  { id: 'attention', name: 'Attention', description: 'Hold your focus on what matters and filter out the rest', dimension: 'cognition' as const, iconId: 'ti-cognition-attention', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'deduction', name: 'Deduction', description: 'Sharpen your reasoning and problem-solving', dimension: 'cognition' as const, iconId: 'ti-cognition-deduction', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'knowledge', name: 'Knowledge', description: 'Put what you already know to work under time pressure', dimension: 'cognition' as const, iconId: 'ti-cognition-knowledge', games: COGNITION_GAMES, progressPercentage: 0 },
  { id: 'math', name: 'Math', description: 'Strengthen your number facility and mental arithmetic', dimension: 'cognition' as const, iconId: 'ti-cognition-math', games: COGNITION_GAMES, progressPercentage: 0 }
];

const PERSONALITY_FEATURED = {
  skillName: 'Openness',
  skillSlug: 'openness',
  skillDescription: 'Be open to new experiences and ideas',
  iconId: 'ti-personality-openness',
  dimensionName: 'Personality',
  games: PERSONALITY_GAMES
};

const PERSONALITY_SKILLS = [
  { id: 'agreeableness', name: 'Agreeableness', description: 'Be compassionate and cooperative towards others', dimension: 'personality' as const, iconId: 'ti-personality-agreeableness', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'conscientiousness', name: 'Conscientiousness', description: 'Show self-discipline and aim for achievement', dimension: 'personality' as const, iconId: 'ti-personality-conscientiousness', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'extraversion', name: 'Extraversion', description: 'Seek fulfillment from sources outside the self', dimension: 'personality' as const, iconId: 'ti-personality-extraversion', games: PERSONALITY_GAMES, progressPercentage: 0 },
  { id: 'emotional-stability', name: 'Emotional Stability', description: 'Experience emotions without letting them overwhelm you', dimension: 'personality' as const, iconId: 'ti-personality-emotional-stability', games: PERSONALITY_GAMES, progressPercentage: 0 }
];

export default function SkillsPage() {
  return (
    <PortalLayout pageClass="page--portal-skills">
      <div className="portal-head relative">
        <MockDataTag />
        <div className="portal-eyebrow">Skills</div>
        <div className="portal-head__row">
          <h1>Skills</h1>
          <Link className="button button--secondary button--md" href="/profile">
            Go to profile <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
          </Link>
        </div>
        <p>Play games, generate signals, understand yourself. Everything a session measures lands in one of three dimensions — Mood, Cognition and Personality.</p>
      </div>

      <div className="portal-layout">
        <div className="portal-layout__main">
          <SkillDimensionSection 
            dimensionId="mood"
            dimensionTitle="Mood"
            dimensionDescription="9 states a session moves you through — the energy you bring to the board and the one it leaves you with."
            dimensionIconId="ti-category-mood"
            featuredSkill={MOOD_FEATURED}
            skills={MOOD_SKILLS}
          />
          <SkillDimensionSection 
            dimensionId="cognition"
            dimensionTitle="Cognition"
            dimensionDescription="14 skills, read directly from how a game is played. Pick one to filter the library down to the games that train it."
            dimensionIconId="ti-category-cognition"
            featuredSkill={COGNITION_FEATURED}
            skills={COGNITION_SKILLS}
          />
          <SkillDimensionSection 
            dimensionId="personality"
            dimensionTitle="Personality"
            dimensionDescription="The big 5 traits that make up your personality profile."
            dimensionIconId="ti-category-personality"
            featuredSkill={PERSONALITY_FEATURED}
            skills={PERSONALITY_SKILLS}
          />
        </div>
        <SkillsRail />
      </div>
    </PortalLayout>
  );
}