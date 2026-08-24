'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/design-system/Layout';
import { PortalSidebar } from '@/components/design-system/PortalSidebar';
import { PortalTopNav } from '@/components/design-system/PortalTopNav';
import { SkillCard, SkillCardProps } from '@/components/design-system/SkillCard';
import { SkillFeatureCard } from '@/components/design-system/SkillFeatureCard';
import { FullGameCard, FullGameCardProps } from '@/components/design-system/FullGameCard';
import { ThisWeekRailCard } from '@/components/design-system/ThisWeekRailCard';
import { SkillGoalCard } from '@/components/design-system/SkillGoalCard';
import { GameRail } from '@/components/design-system/GridSystem';

// -----------------------------------------------------------------------------
// Data Definitions matching Skillprint Portal · Skills.html
// -----------------------------------------------------------------------------

const MOOD_SKILLS: SkillCardProps[] = [
  {
    id: 'awe',
    pillar: 'Mood',
    title: 'Awe',
    description: 'Meet scale, novelty and complexity with a sense of wonder',
    iconId: 'ti-mood-awe',
    games: [
      { name: 'Space Trip', slug: 'space-trip' },
      { name: 'I Love Hue', slug: 'i-love-hue' },
      { name: 'Space Adventure Pinball', slug: 'space-adventure-pinball' },
    ],
    progression: 0,
  },
  {
    id: 'collaborate',
    pillar: 'Mood',
    title: 'Collaborate',
    description: "Coordinate, share and make room for someone else's move",
    iconId: 'ti-mood-collaborate',
    games: [
      { name: 'Garden Match', slug: 'garden-match' },
      { name: 'Match Doodle', slug: 'match-doodle' },
      { name: 'Fruit Sorting', slug: 'fruit-sorting' },
    ],
    progression: 0,
  },
  {
    id: 'creativity',
    pillar: 'Mood',
    title: 'Creativity',
    description: 'Find the move nobody showed you',
    iconId: 'ti-mood-creativity',
    games: [
      { name: 'Doodle God Next', slug: 'doodle-god-next' },
      { name: 'Alchemy', slug: 'alchemy' },
      { name: 'Colorize 2', slug: 'colorize-2' },
    ],
    progression: 0,
  },
  {
    id: 'curiosity',
    pillar: 'Mood',
    title: 'Curiosity',
    description: 'Poke at the rules to see what gives',
    iconId: 'ti-mood-curiosity',
    games: [
      { name: 'Alchemy', slug: 'alchemy' },
      { name: 'Mine Rusher', slug: 'mine-rusher' },
      { name: 'Doodle God Next', slug: 'doodle-god-next' },
    ],
    progression: 0,
  },
  {
    id: 'empathy',
    pillar: 'Mood',
    title: 'Empathy',
    description: 'Read what someone else is feeling and play to it',
    iconId: 'ti-mood-empathy',
    games: [
      { name: 'Match Doodle', slug: 'match-doodle' },
      { name: 'Cut The Rope', slug: 'cut-the-rope' },
      { name: 'Garden Match', slug: 'garden-match' },
    ],
    progression: 0,
  },
  {
    id: 'focus',
    pillar: 'Mood',
    title: 'Focus',
    description: 'Hold a narrow attention for a long stretch',
    iconId: 'ti-mood-focus',
    games: [
      { name: 'Ultimate Sudoku', slug: 'ultimate-sudoku' },
      { name: 'Mahjong Deluxe', slug: 'mahjong-deluxe' },
      { name: 'Hextris', slug: 'hextris' },
    ],
    progression: 0,
  },
  {
    id: 'grit',
    pillar: 'Mood',
    title: 'Grit',
    description: 'Stay with it after the first failure',
    iconId: 'ti-mood-grit',
    games: [
      { name: '0h h1', slug: '0h-h1' },
      { name: 'Star Puzzles', slug: 'star-puzzles' },
      { name: 'Flapcat Steampunk', slug: 'flapcat-steampunk' },
    ],
    progression: 0,
  },
  {
    id: 'joy',
    pillar: 'Mood',
    title: 'Joy',
    description: 'Play for its own sake, with no score attached',
    iconId: 'ti-mood-joy',
    games: [
      { name: 'Om Nom Run', slug: 'om-nom-run' },
      { name: 'Fruit Boom', slug: 'fruit-boom' },
      { name: "Whack 'em All", slug: 'whack-em-all' },
    ],
    progression: 0,
  },
  {
    id: 'relax',
    pillar: 'Mood',
    title: 'Relax',
    description: 'Low pressure, steady pace, room to breathe',
    iconId: 'ti-mood-relax',
    games: [
      { name: 'I Love Hue', slug: 'i-love-hue' },
      { name: 'Garden Match', slug: 'garden-match' },
      { name: 'Box Tower', slug: 'box-tower' },
    ],
    progression: 0,
  },
];

const COGNITION_SKILLS: SkillCardProps[] = [
  {
    id: 'action',
    pillar: 'Cognition',
    title: 'Action',
    description: 'Convert quick decisions into accurate, well-timed moves',
    iconId: 'ti-cognition-action',
    games: [
      { name: "Whack 'em All", slug: 'whack-em-all' },
      { name: 'Brick Out', slug: 'brick-out' },
      { name: 'Om Nom Run', slug: 'om-nom-run' },
    ],
    progression: 81,
  },
  {
    id: 'attention',
    pillar: 'Cognition',
    title: 'Attention',
    description: 'Hold your focus on what matters and filter out the rest',
    iconId: 'ti-cognition-attention',
    games: [
      { name: 'Photo Hunt', slug: 'photo-hunt' },
      { name: 'Sweet Memory', slug: 'sweet-memory' },
      { name: 'Om Nom Run', slug: 'om-nom-run' },
    ],
    progression: 0,
  },
  {
    id: 'deduction',
    pillar: 'Cognition',
    title: 'Deduction',
    description: 'Sharpen your reasoning and problem-solving',
    iconId: 'ti-cognition-deduction',
    games: [
      { name: 'Ultimate Sudoku', slug: 'ultimate-sudoku' },
      { name: '0h h1', slug: '0h-h1' },
      { name: 'Star Puzzles', slug: 'star-puzzles' },
    ],
    progression: 0,
  },
  {
    id: 'knowledge',
    pillar: 'Cognition',
    title: 'Knowledge',
    description: 'Put what you already know to work under time pressure',
    iconId: 'ti-cognition-knowledge',
    games: [
      { name: 'Alchemy', slug: 'alchemy' },
      { name: 'Doodle God Next', slug: 'doodle-god-next' },
      { name: 'Change Word', slug: 'change-word' },
    ],
    progression: 0,
  },
  {
    id: 'math',
    pillar: 'Cognition',
    title: 'Math',
    description: 'Strengthen your number facility and mental arithmetic',
    iconId: 'ti-cognition-math',
    games: [
      { name: 'Sumagi', slug: 'sumagi' },
      { name: 'Ultimate Sudoku', slug: 'ultimate-sudoku' },
      { name: 'Impossible 10', slug: 'impossible-10' },
    ],
    progression: 0,
  },
  {
    id: 'memory',
    pillar: 'Cognition',
    title: 'Memory',
    description: 'Enhance your recall and retention abilities',
    iconId: 'ti-cognition-memory',
    games: [
      { name: 'Sweet Memory', slug: 'sweet-memory' },
      { name: 'Mahjong Deluxe', slug: 'mahjong-deluxe' },
      { name: 'Garden Match', slug: 'garden-match' },
    ],
    progression: 0,
  },
  {
    id: 'pattern-matching',
    pillar: 'Cognition',
    title: 'Pattern Matching',
    description: 'Develop your ability to identify patterns',
    iconId: 'ti-cognition-pattern-matching',
    games: [
      { name: 'Bubble Spirit', slug: 'bubble-spirit' },
      { name: 'Fruit Boom', slug: 'fruit-boom' },
      { name: 'Mahjong Deluxe', slug: 'mahjong-deluxe' },
    ],
    progression: 0,
  },
  {
    id: 'perceptual-speed',
    pillar: 'Cognition',
    title: 'Perceptual Speed',
    description: 'Improve your reaction time and quick thinking',
    iconId: 'ti-cognition-perceptual-speed',
    games: [
      { name: 'Fruit Sorting', slug: 'fruit-sorting' },
      { name: "Whack 'em All", slug: 'whack-em-all' },
      { name: 'Brick Out', slug: 'brick-out' },
    ],
    progression: 0,
  },
  {
    id: 'planning',
    pillar: 'Cognition',
    title: 'Planning',
    description: 'Think several moves ahead before you commit',
    iconId: 'ti-cognition-planning',
    games: [
      { name: 'Gems of Hanoi', slug: 'gems-of-hanoi' },
      { name: 'Colorize 2', slug: 'colorize-2' },
      { name: 'Snake Attack', slug: 'snake-attack' },
    ],
    progression: 0,
  },
  {
    id: 'spatial',
    pillar: 'Cognition',
    title: 'Spatial',
    description: 'Reason about shape, rotation and fit in space',
    iconId: 'ti-cognition-spatial',
    games: [
      { name: 'Hextris', slug: 'hextris' },
      { name: 'Gummy Blocks', slug: 'gummy-blocks' },
      { name: 'Cut The Rope', slug: 'cut-the-rope' },
    ],
    progression: 0,
  },
  {
    id: 'task-switching',
    pillar: 'Cognition',
    title: 'Task Switching',
    description: 'Move cleanly between changing rules and goals',
    iconId: 'ti-cognition-task-switching',
    games: [
      { name: 'Om Nom Run', slug: 'om-nom-run' },
      { name: 'Snake Attack', slug: 'snake-attack' },
      { name: 'Flapcat Steampunk', slug: 'flapcat-steampunk' },
    ],
    progression: 0,
  },
  {
    id: 'timing',
    pillar: 'Cognition',
    title: 'Timing',
    description: 'Land the move at exactly the right moment',
    iconId: 'ti-cognition-timing',
    games: [
      { name: 'Box Tower', slug: 'box-tower' },
      { name: 'Stacks Tower', slug: 'stacks-tower' },
      { name: 'Line Color', slug: 'line-color' },
    ],
    progression: 0,
  },
  {
    id: 'verbal',
    pillar: 'Cognition',
    title: 'Verbal',
    description: 'Expand your vocabulary and word recognition',
    iconId: 'ti-cognition-verbal',
    games: [
      { name: 'Change Word', slug: 'change-word' },
      { name: 'Match Doodle', slug: 'match-doodle' },
      { name: 'Alchemy', slug: 'alchemy' },
    ],
    progression: 0,
  },
  {
    id: 'visualization',
    pillar: 'Cognition',
    title: 'Visualization',
    description: 'Picture the outcome before you make the move',
    iconId: 'ti-cognition-visualization',
    games: [
      { name: 'I Love Hue', slug: 'i-love-hue' },
      { name: 'Gummy Blocks', slug: 'gummy-blocks' },
      { name: 'Impossible 10', slug: 'impossible-10' },
    ],
    progression: 0,
  },
];

const PERSONALITY_SKILLS: SkillCardProps[] = [
  {
    id: 'agreeableness',
    pillar: 'Personality',
    title: 'Agreeableness',
    description: 'How you play when cooperating costs you points',
    iconId: 'ti-personality-agreeableness',
    games: [
      { name: 'Garden Match', slug: 'garden-match' },
      { name: 'Match Doodle', slug: 'match-doodle' },
      { name: 'Cut The Rope', slug: 'cut-the-rope' },
    ],
    progression: 69,
  },
  {
    id: 'conscientiousness',
    pillar: 'Personality',
    title: 'Conscientiousness',
    description: 'How consistently you finish what a session starts',
    iconId: 'ti-personality-conscientiousness',
    games: [
      { name: 'Ultimate Sudoku', slug: 'ultimate-sudoku' },
      { name: 'Star Puzzles', slug: 'star-puzzles' },
      { name: 'Mahjong Deluxe', slug: 'mahjong-deluxe' },
    ],
    progression: 0,
  },
  {
    id: 'emotional-stability',
    pillar: 'Personality',
    title: 'Emotional Stability',
    description: 'How quickly you recover after a run goes wrong',
    iconId: 'ti-personality-emotional-stability',
    games: [
      { name: 'Flapcat Steampunk', slug: 'flapcat-steampunk' },
      { name: 'Brick Out', slug: 'brick-out' },
      { name: 'Stacks Tower', slug: 'stacks-tower' },
    ],
    progression: 0,
  },
  {
    id: 'extraversion',
    pillar: 'Personality',
    title: 'Extraversion',
    description: 'How bold, expressive and high-energy your moves are',
    iconId: 'ti-personality-extraversion',
    games: [
      { name: 'Fruit Boom', slug: 'fruit-boom' },
      { name: 'Om Nom Run', slug: 'om-nom-run' },
      { name: "Whack 'em All", slug: 'whack-em-all' },
    ],
    progression: 0,
  },
  {
    id: 'openness',
    pillar: 'Personality',
    title: 'Openness',
    description: 'How readily you try an unfamiliar rule set',
    iconId: 'ti-personality-openness',
    games: [
      { name: 'Doodle God Next', slug: 'doodle-god-next' },
      { name: 'Space Trip', slug: 'space-trip' },
      { name: 'Alchemy', slug: 'alchemy' },
    ],
    progression: 0,
  },
];

// Rich Featured Mood Game Rail Data (matching lines 184 of Skills.html)
const FEATURED_MOOD_FULL_GAMES: FullGameCardProps[] = [
  {
    title: 'Ultimate Sudoku',
    slug: 'ultimate-sudoku',
    description: 'Fill every row, column and box with one to nine, deduced and never guessed.',
    duration: '8–20 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-cat-focus.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Mahjong Deluxe',
    slug: 'mahjong-deluxe',
    description: 'Clear the layout by pairing free tiles before the open moves run out.',
    duration: '8–15 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-snake-attack.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Hextris',
    slug: 'hextris',
    description: 'Rotate the central hexagon, connect matching colours and prevent the surrounding stack from closing in.',
    duration: '6–10 min',
    mediaBadge: 'Recommended',
    bestFlowScore: 73,
    staticArt: '/assets/design-system/game-art/game-hextris.svg',
    animatedArt: '/assets/design-system/game-art/game-hextris-animated.svg',
    skillsDeveloped: [
      { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { name: 'Spatial', iconId: 'ti-cognition-spatial', dimension: 'cognition' },
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
    ],
  },
];

// Rich Featured Cognition Game Rail Data (matching lines 351 of Skills.html)
const FEATURED_COGNITION_FULL_GAMES: FullGameCardProps[] = [
  {
    title: 'Bubble Spirit',
    slug: 'bubble-spirit',
    description: 'Aim and fire bubbles to burst matching clusters before they reach the floor.',
    duration: '5–10 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-gummy-blocks.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Fruit Boom',
    slug: 'fruit-boom',
    description: 'Swap fruit into threes and set off the chain that clears the board.',
    duration: '5–10 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-box-tower.svg',
    skillsDeveloped: [
      { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { name: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
    ],
  },
  {
    title: 'Mahjong Deluxe',
    slug: 'mahjong-deluxe',
    description: 'Clear the layout by pairing free tiles before the open moves run out.',
    duration: '8–15 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-snake-attack.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
];

// Rich Featured Personality Game Rail Data (matching lines 595 of Skills.html)
const FEATURED_PERSONALITY_FULL_GAMES: FullGameCardProps[] = [
  {
    title: 'Doodle God Next',
    slug: 'doodle-god-next',
    description: 'Mix the four elements over and over until a whole world exists.',
    duration: '6–12 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-cat-focus.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Space Trip',
    slug: 'space-trip',
    description: 'Navigate a rocket through changing routes, anticipate hazards and choose the clearest path forward.',
    duration: '6–9 min',
    mediaBadge: 'Recommended',
    bestFlowScore: 68,
    staticArt: '/assets/design-system/game-art/game-space-trip.svg',
    animatedArt: '/assets/design-system/game-art/game-space-trip-animated.svg',
    skillsDeveloped: [
      { name: 'Visualization', iconId: 'ti-cognition-visualization', dimension: 'cognition' },
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
    ],
  },
  {
    title: 'Alchemy',
    slug: 'alchemy',
    description: 'Combine elements to discover new ones and fill out the board.',
    duration: '5–12 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-box-tower.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
];

export default function PortalSkillsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize data-theme and data-surface on html tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-surface', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const PageHeader = (
    <>
      <div className="portal-eyebrow">Skills</div>
      <div className="portal-head__row">
        <h1 className="font-display">Skills</h1>
        <Link href="/profile" className="button button--secondary button--md">
          <span>Go to profile</span>
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>
      <p className="text-muted leading-base">
        Play games, generate signals, understand yourself. Everything a session measures lands in one of three dimensions — Mood, Cognition and Personality.
      </p>
    </>
  );

  const Footer = (
    <>
      <span className="portal-foot__legal text-muted font-sm">© 2026 Skillprint</span>
    </>
  );

  const PageRail = (
    <>
      <ThisWeekRailCard />
      <SkillGoalCard />
    </>
  );

  return (
    <Layout
      pageClass="page--portal-skills"
      sidebar={
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath="/design-system/skills"
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
      header={PageHeader}
      rail={PageRail}
      footer={Footer}
      theme={theme}
    >
      <div className="space-y-12">
        {/* SECTION 1: MOOD */}
        <section className="portal-section skills-section" id="mood" data-dimension="mood">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="moodTitle">
                Mood
              </h2>
              <p className="portal-section__hint">
                Nine states a session moves you through — the energy you bring to the board and the one it leaves you with.
              </p>
            </div>
            <Link className="portal-section__link flex items-center gap-1" href="/games?skill=mood">
              <span>Games by mood</span>
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </Link>
          </div>

          <div className="space-y-8">
            <SkillFeatureCard
              pillarEyebrow="Featured Mood skill"
              title="Focus"
              copy="Hold a narrow attention for a long stretch."
              iconId="ti-mood-focus"
            >
              <GameRail>
                {FEATURED_MOOD_FULL_GAMES.map(game => (
                  <FullGameCard key={game.slug} {...game} />
                ))}
              </GameRail>
            </SkillFeatureCard>

            <div>
              <h3 className="skills-section__index-title mb-4 font-bold text-lg">All Mood skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOOD_SKILLS.map(skill => (
                  <SkillCard key={skill.id} {...skill} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: COGNITION */}
        <section className="portal-section skills-section" id="cognition" data-dimension="cognition">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="cognitionTitle">
                Cognition
              </h2>
              <p className="portal-section__hint">
                Fourteen skills, read directly from how a game is played. Pick one to filter the library down to the games that train it.
              </p>
            </div>
            <Link className="portal-section__link flex items-center gap-1" href="/games?skill=cognition">
              <span>Games by cognition</span>
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </Link>
          </div>

          <div className="space-y-8">
            <SkillFeatureCard
              pillarEyebrow="Featured Cognition skill"
              title="Pattern Matching"
              copy="Develop your ability to identify patterns."
              iconId="ti-cognition-pattern-matching"
            >
              <GameRail>
                {FEATURED_COGNITION_FULL_GAMES.map(game => (
                  <FullGameCard key={game.slug} {...game} />
                ))}
              </GameRail>
            </SkillFeatureCard>

            <div>
              <h3 className="skills-section__index-title mb-4 font-bold text-lg">All Cognition skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COGNITION_SKILLS.map(skill => (
                  <SkillCard key={skill.id} {...skill} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PERSONALITY */}
        <section className="portal-section skills-section" id="personality" data-dimension="personality">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="personalityTitle">
                Personality
              </h2>
              <p className="portal-section__hint">
                The five traits a long run of sessions makes visible. Slower to move than Mood, and steadier than Cognition.
              </p>
            </div>
            <Link className="portal-section__link flex items-center gap-1" href="/games?skill=personality">
              <span>Games by personality</span>
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </Link>
          </div>

          <div className="space-y-8">
            <SkillFeatureCard
              pillarEyebrow="Featured Personality skill"
              title="Openness"
              copy="How readily you try an unfamiliar rule set."
              iconId="ti-personality-openness"
            >
              <GameRail>
                {FEATURED_PERSONALITY_FULL_GAMES.map(game => (
                  <FullGameCard key={game.slug} {...game} />
                ))}
              </GameRail>
            </SkillFeatureCard>

            <div>
              <h3 className="skills-section__index-title mb-4 font-bold text-lg">All Personality skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PERSONALITY_SKILLS.map(skill => (
                  <SkillCard key={skill.id} {...skill} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
