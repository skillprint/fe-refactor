'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/design-system/Layout';
import { PortalSidebar } from '@/components/design-system/PortalSidebar';
import { FullGameCard, FullGameCardProps } from '@/components/design-system/FullGameCard';
import { PlaybookCard, PlaybookCardProps } from '@/components/design-system/PlaybookCard';
import { ProgressionPicker } from '@/components/design-system/ProgressionPicker';
import { GameRail, GameGrid } from '@/components/design-system/GridSystem';

// -----------------------------------------------------------------------------
// Games Data Definitions matching Skillprint Portal · Games.html
// -----------------------------------------------------------------------------

const RECOMMENDED_GAMES: FullGameCardProps[] = [
  {
    title: 'Cat Focus',
    slug: 'cat-focus',
    description: 'Track shifting targets around the cat and react only when the correct signal reaches the centre.',
    duration: '4–7 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-cat-focus.svg',
    animatedArt: '/assets/design-system/game-art/game-cat-focus-animated.svg',
    skillsDeveloped: [
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
      { name: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed', dimension: 'cognition' },
    ],
  },
  {
    title: 'Hextris',
    slug: 'hextris',
    description: 'Rotate the central hexagon, connect matching colours and prevent the surrounding stack from closing in.',
    duration: '6–10 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-hextris.svg',
    animatedArt: '/assets/design-system/game-art/game-hextris-animated.svg',
    skillsDeveloped: [
      { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { name: 'Spatial', iconId: 'ti-cognition-spatial', dimension: 'cognition' },
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
    ],
  },
  {
    title: 'I Love Hue',
    slug: 'i-love-hue',
    description: 'Drag scrambled tiles back into one perfect gradient.',
    duration: '4–10 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-color-palette.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
      { name: 'Relax', iconId: 'ti-mood-relax', dimension: 'mood' },
    ],
  },
  {
    title: 'Sumagi',
    slug: 'sumagi',
    description: 'Chain adjacent numbers so each line adds up to the target.',
    duration: '4–9 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-math.svg',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
      { name: 'Relax', iconId: 'ti-mood-relax', dimension: 'mood' },
    ],
  },
];

const PLAYBOOKS_DATA: PlaybookCardProps[] = [
  {
    title: 'Deep Focus Routine',
    slug: 'deep-focus-routine',
    description: 'A sequence of games designed to sharpen your attention and eliminate distractions.',
    tag: 'Focus',
    completedCount: 1,
    totalCount: 3,
    staticArt: '/assets/design-system/game-art/game-cat-focus.svg',
    actionText: 'Continue',
  },
  {
    title: 'Brain Activation for Learning',
    slug: 'brain-activation-learning',
    description: 'Prime your brain for new information with these cognitive warm-ups.',
    tag: 'Learning',
    completedCount: 0,
    totalCount: 3,
    staticArt: '/assets/design-system/game-art/game-pastime.svg',
    actionText: 'Start',
  },
  {
    title: 'Mindful Relaxation',
    slug: 'mindful-relaxation',
    description: 'Decompress and reduce stress with calming, low-pressure activities.',
    tag: 'Wellness',
    completedCount: 0,
    totalCount: 3,
    staticArt: '/assets/design-system/game-art/game-color-palette.svg',
    actionText: 'Start',
  },
];

const ALL_GAMES_LIBRARY: (FullGameCardProps & { skills: string[]; pillar: string })[] = [
  {
    title: 'Snake Attack',
    slug: 'snake-attack',
    description: 'Guide the snake through a changing path, collect food and avoid walls and your growing tail.',
    duration: '5–10 min',
    mediaBadge: 'Played',
    staticArt: '/assets/design-system/game-art/game-snake-attack.svg',
    animatedArt: '/assets/design-system/game-art/game-snake-attack-animated.svg',
    skills: ['timing', 'focus', 'attention', 'action', 'planning', 'task-switching'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
    ],
  },
  {
    title: 'Hextris',
    slug: 'hextris',
    description: 'Rotate the central hexagon, connect matching colours and prevent the surrounding stack from closing in.',
    duration: '6–10 min',
    mediaBadge: 'Played',
    staticArt: '/assets/design-system/game-art/game-hextris.svg',
    animatedArt: '/assets/design-system/game-art/game-hextris-animated.svg',
    skills: ['pattern-matching', 'spatial', 'timing', 'focus'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { name: 'Spatial', iconId: 'ti-cognition-spatial', dimension: 'cognition' },
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
    ],
  },
  {
    title: 'Space Trip',
    slug: 'space-trip',
    description: 'Navigate a rocket through changing routes, anticipate hazards and choose the clearest path forward.',
    duration: '6–9 min',
    mediaBadge: 'Played',
    staticArt: '/assets/design-system/game-art/game-space-trip.svg',
    animatedArt: '/assets/design-system/game-art/game-space-trip-animated.svg',
    skills: ['visualization', 'attention', 'timing', 'awe', 'curiosity', 'openness'],
    pillar: 'personality',
    skillsDeveloped: [
      { name: 'Visualization', iconId: 'ti-cognition-visualization', dimension: 'cognition' },
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
    ],
  },
  {
    title: 'Gummy Blocks',
    slug: 'gummy-blocks',
    description: 'Fit block shapes onto the board to complete rows and columns.',
    duration: '5–12 min',
    mediaBadge: 'Played',
    staticArt: '/assets/design-system/game-art/game-gummy-blocks.svg',
    animatedArt: '/assets/design-system/game-art/game-gummy-blocks-animated.svg',
    skills: ['spatial', 'visualization', 'planning', 'focus'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Spatial', iconId: 'ti-cognition-spatial', dimension: 'cognition' },
      { name: 'Visualization', iconId: 'ti-cognition-visualization', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
    ],
  },
  {
    title: 'Cat Focus',
    slug: 'cat-focus',
    description: 'Track shifting targets around the cat and react only when the correct signal reaches the centre.',
    duration: '4–7 min',
    mediaBadge: 'Recommended',
    staticArt: '/assets/design-system/game-art/game-cat-focus.svg',
    animatedArt: '/assets/design-system/game-art/game-cat-focus-animated.svg',
    skills: ['attention', 'focus', 'perceptual-speed'],
    pillar: 'mood',
    skillsDeveloped: [
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
      { name: 'Focus', iconId: 'ti-mood-focus', dimension: 'mood' },
      { name: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed', dimension: 'cognition' },
    ],
  },
  {
    title: 'Box Tower',
    slug: 'box-tower',
    description: 'Stack moving blocks cleanly on top of each other to build the highest tower.',
    duration: '5–8 min',
    mediaBadge: 'Played',
    staticArt: '/assets/design-system/game-art/game-box-tower.svg',
    animatedArt: '/assets/design-system/game-art/game-box-tower-animated.svg',
    skills: ['timing', 'relax', 'perceptual-speed'],
    pillar: 'mood',
    skillsDeveloped: [
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
      { name: 'Relax', iconId: 'ti-mood-relax', dimension: 'mood' },
    ],
  },
  {
    title: 'Sweet Candy Saga',
    slug: 'sweet-candy-saga',
    description: 'Swap adjacent sweets to line up three and clear the board.',
    duration: '5–10 min',
    staticArt: '/assets/design-system/game-art/game-candy.svg',
    skills: ['pattern-matching', 'perceptual-speed', 'planning', 'relax'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Pattern Matching', iconId: 'ti-cognition-pattern-matching', dimension: 'cognition' },
      { name: 'Perceptual Speed', iconId: 'ti-cognition-perceptual-speed', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Relax', iconId: 'ti-mood-relax', dimension: 'mood' },
    ],
  },
  {
    title: 'Twenty-One',
    slug: 'twenty-one',
    description: 'Draw or hold, and get as close to twenty-one as you dare.',
    duration: '5–10 min',
    staticArt: '/assets/design-system/game-art/game-poker.svg',
    skills: ['deduction', 'planning', 'memory', 'focus', 'relax'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Unlock Blox',
    slug: 'unlock-blox',
    description: 'Shift the blocking pieces aside to free the key block.',
    duration: '5–10 min',
    staticArt: '/assets/design-system/game-art/game-lock.svg',
    skills: ['deduction', 'planning', 'memory', 'focus', 'relax'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Deduction', iconId: 'ti-cognition-deduction', dimension: 'cognition' },
      { name: 'Planning', iconId: 'ti-cognition-planning', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
    ],
  },
  {
    title: 'Word Search',
    slug: 'word-search',
    description: 'Find every hidden word in the grid, in any direction.',
    duration: '5–10 min',
    staticArt: '/assets/design-system/game-art/game-crossword.svg',
    skills: ['verbal', 'memory', 'knowledge', 'focus', 'relax'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Verbal', iconId: 'ti-cognition-verbal', dimension: 'cognition' },
      { name: 'Memory', iconId: 'ti-cognition-memory', dimension: 'cognition' },
      { name: 'Knowledge', iconId: 'ti-cognition-knowledge', dimension: 'cognition' },
    ],
  },
  {
    title: 'Zig Zag Switch',
    slug: 'zig-zag-switch',
    description: 'Switch direction at the right instant to stay on the winding path.',
    duration: '5–10 min',
    staticArt: '/assets/design-system/game-art/game-zig-zag.svg',
    skills: ['timing', 'attention', 'action', 'focus'],
    pillar: 'cognition',
    skillsDeveloped: [
      { name: 'Timing', iconId: 'ti-cognition-timing', dimension: 'cognition' },
      { name: 'Attention', iconId: 'ti-cognition-attention', dimension: 'cognition' },
      { name: 'Action', iconId: 'ti-cognition-action', dimension: 'cognition' },
    ],
  },
];

export default function PortalGamesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');

  // Synchronize theme on document element
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

  // Filtered games logic
  const filteredGames = useMemo(() => {
    return ALL_GAMES_LIBRARY.filter(game => {
      // 1. Text Search Filter
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower) ||
        game.skills.some(s => s.toLowerCase().includes(searchLower));

      // 2. Skill Picker Filter
      let matchesSkill = true;
      if (selectedSkill !== 'all') {
        if (selectedSkill === 'mood') {
          matchesSkill = game.pillar === 'mood';
        } else if (selectedSkill === 'cognition') {
          matchesSkill = game.pillar === 'cognition';
        } else if (selectedSkill === 'personality') {
          matchesSkill = game.pillar === 'personality';
        } else {
          matchesSkill = game.skills.includes(selectedSkill);
        }
      }

      return matchesSearch && matchesSkill;
    });
  }, [searchQuery, selectedSkill]);

  const PageHeader = (
    <>
      <div className="portal-eyebrow">Games</div>
      <div className="portal-head__row">
        <h1 className="font-display">Games</h1>
        <Link href="/design-system/skills" className="button button--secondary button--md flex items-center gap-1">
          <span>How games build skills</span>
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>
      <p className="text-muted leading-base">
        Fifty short games, and every one of them is a measurement. Play a round and it reads how you think, decide and hold your nerve, then feeds that reading back as skills you can watch build session by session.
      </p>
    </>
  );

  const Footer = (
    <>
      <span className="portal-foot__legal text-muted font-sm">© 2026 Skillprint</span>
    </>
  );

  return (
    <Layout
      pageClass="page--portal-games"
      sidebar={
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath="/design-system/games"
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
      header={PageHeader}
      footer={Footer}
      theme={theme}
    >
      <div className="space-y-12">
        {/* SECTION 1: RECOMMENDED FOR YOU */}
        <section className="portal-section" aria-labelledby="gamesPicked">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="gamesPicked">
                Recommended for you
              </h2>
              <p className="portal-section__hint">
                Attention has the most headroom this week, so these read it hardest.
              </p>
            </div>
            <Link className="portal-section__link flex items-center gap-1" href="/design-system/skills">
              <span>Develop a specific skill</span>
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
              </svg>
            </Link>
          </div>

          <GameRail className="game-rail--library">
            {RECOMMENDED_GAMES.map(game => (
              <FullGameCard key={game.slug} {...game} />
            ))}
          </GameRail>
        </section>

        {/* SECTION 2: PLAYBOOKS */}
        <section className="portal-section" aria-labelledby="gamesPlaybooks">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="gamesPlaybooks">
                Playbooks
              </h2>
              <p className="portal-section__hint">
                A short sequence with one job. Finish the set and the skills it targets move together.
              </p>
            </div>
          </div>

          <GameRail>
            {PLAYBOOKS_DATA.map(playbook => (
              <PlaybookCard key={playbook.slug} {...playbook} />
            ))}
          </GameRail>
        </section>

        {/* SECTION 3: ALL GAMES LIBRARY & FILTER */}
        <section className="portal-section" id="games" aria-labelledby="gamesAll">
          <div className="portal-section__bar">
            <div>
              <h2 className="portal-section__title" id="gamesAll">
                All games
              </h2>
              <p className="portal-section__hint">
                Every game adapts to you as you play. Start from the skill you want to move.
              </p>
            </div>

            {/* In-section Search Field */}
            <label className="search-field field__control--both position-relative min-w-[280px]">
              <span className="sr-only">Search games</span>
              <svg className="sp-icon position-absolute text-muted left-3 top-2.5" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-search"></use>
              </svg>
              <input
                className="full-width pl-9 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
                aria-label="Search games"
                autoComplete="off"
                id="gameSearch"
                placeholder="Search games or skills"
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="clear-search button button--tertiary button--icon-only button--md surface-transparent text-muted position-absolute right-2 top-2"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="/assets/design-system/icons/sprite.svg#ti-close"></use>
                  </svg>
                </button>
              )}
            </label>
          </div>

          {/* Skill Filter Panel */}
          <ProgressionPicker
            selectedSkill={selectedSkill}
            onSelectSkill={skillId => setSelectedSkill(skillId)}
            className="mb-8"
          />

          {/* Results Count Bar */}
          <div className="portal-toolbar mb-4 flex items-center justify-between">
            <span className="portal-toolbar__count font-semibold text-sm text-slate-300">
              {filteredGames.length} games
            </span>
          </div>

          {/* Games Grid */}
          {filteredGames.length > 0 ? (
            <div className="game-grid game-grid--portal grid grid-3" id="gameGrid">
              {filteredGames.map(game => (
                <FullGameCard key={game.slug} {...game} />
              ))}
            </div>
          ) : (
            <div className="empty-state text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
              <h3 className="text-lg font-bold">No games found</h3>
              <p className="margin-none text-muted text-sm mt-1">Try a different skill or search term.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
