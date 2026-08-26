'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import PortalLayout from "@/components/PortalLayout";
import ProgressBanner from "./components/ProgressBanner";
import { useGamesByMood } from './hooks/useGamesByMood';
import BuckyballLoading from './components/BuckyballLoading';
import { useUserSession } from './hooks/useUserSession';
import { useGameSessions } from './hooks/useGameSessions';
import { useUserProfile } from './hooks/useUserProfile';
import { PlaybookWidget } from './components/PlaybookWidget';
import SkillprintVisualization from './components/Skillprint';
import { useSkillprintVisualizationData } from './hooks/useSkillprintVisualizationData';
import GamePreviewShareSheet from './components/GamePreviewShareSheet';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useAuth } from './context/AuthContext';
import { getGameDetails } from './config/gameConfig';
import { getCookie, setCookie } from './utils/cookieUtils';
import { PortalPageLayout, PortalPageMain, PortalPageRail, PortalSection } from '@/components/LayoutGrid';
import { PortalPageTitle, PortalSectionTitle, PortalSectionHint } from '@/components/Typography';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GameTile } from '@/components/GameTile';

// Skills data
const skills = [
  {
    id: 'planning',
    apiSlug: 'planning',
    name: 'Planning',
    color: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-500 to-purple-500',
    image: '/images/skills/Memorization.png',
    description: 'Enhance your recall and retention abilities'
  },
  {
    id: 'deduction',
    apiSlug: 'deduction',
    name: 'Deduction',
    color: 'bg-red-100 text-red-800',
    gradient: 'from-red-500 to-pink-500',
    image: '/images/skills/DeductiveReasoning.png',
    description: 'Sharpen your reasoning and problem-solving'
  },
  {
    id: 'perceptual-speed',
    apiSlug: 'perceptual-speed',
    name: 'Perceptual Speed',
    color: 'bg-orange-100 text-orange-800',
    gradient: 'from-orange-500 to-yellow-500',
    image: '/images/skills/PerceptualSpeed.png',
    description: 'Improve your reaction time and quick thinking'
  },
  {
    id: 'pattern-matching',
    apiSlug: 'pattern-matching',
    name: 'Pattern Matching',
    color: 'bg-teal-100 text-teal-800',
    gradient: 'from-teal-500 to-cyan-500',
    image: '/images/skills/InductiveReasoning.png',
    description: 'Develop your ability to identify patterns'
  },
  {
    id: 'task-switching',
    apiSlug: 'task-switching',
    name: 'Task Switching',
    color: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-500 to-green-500',
    image: '/images/skills/TaskSwitching.png',
    description: 'Build hand-eye coordination skills'
  },
];

const moods = [
  {
    id: 'relax',
    name: 'Relax',
    image: '/images/mindsets/Relax.png',
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'focus',
    name: 'Focus',
    image: '/images/mindsets/Focus.png',
    gradient: 'from-indigo-400 to-blue-500'
  },
  {
    id: 'grit',
    name: 'Grit',
    image: '/images/mindsets/Collaboration.png',
    gradient: 'from-orange-400 to-red-500'
  },
  {
    id: 'creativity',
    name: 'Creativity',
    image: '/images/mindsets/Innovate.png',
    gradient: 'from-pink-400 to-purple-500'
  },
];

// Games with their associated skills
const allGames = [
  {
    name: '2048',
    slug: '2048',
    description: 'Slide tiles to reach 2048',
    skills: ['planning', 'pattern-matching']
  },
  {
    name: 'Alchemy',
    slug: 'alchemy',
    description: 'Combine elements to create new ones',
    skills: ['planning', 'pattern-matching']
  },
  {
    name: 'Brick Out',
    slug: 'brick-out',
    description: 'Break all the bricks with your paddle',
    skills: ['task-switching', 'perceptual-speed']
  },
  {
    name: 'Bubble Spirit',
    slug: 'bubble-spirit',
    description: 'Pop bubbles in this puzzle game',
    skills: ['pattern-matching', 'task-switching']
  },
  {
    name: 'Change Word',
    slug: 'change-word',
    description: 'Transform words letter by letter',
    skills: ['planning', 'deduction']
  },
  {
    name: 'Flapcat Steampunk',
    slug: 'flapcat-steampunk',
    description: 'Navigate through obstacles',
    skills: ['task-switching', 'perceptual-speed']
  },
  {
    name: 'Fruit Sorting',
    slug: 'fruit-sorting',
    description: 'Sort fruits by color and type',
    skills: ['pattern-matching', 'task-switching']
  },
  {
    name: 'Garden Match',
    slug: 'garden-match',
    description: 'Match garden items in this puzzle',
    skills: ['planning', 'pattern-matching']
  },
  {
    name: 'Hextris',
    slug: 'hextris',
    description: 'Rotate and match hexagons',
    skills: ['task-switching', 'perceptual-speed']
  },
  {
    name: 'I Love Hue',
    slug: 'i-love-hue',
    description: 'Arrange colors in perfect harmony',
    skills: ['pattern-matching', 'planning']
  },
  {
    name: 'Mahjong Deluxe',
    slug: 'mahjong-deluxe',
    description: 'Classic tile matching game',
    skills: ['planning', 'pattern-matching']
  },
  {
    name: 'Mine Rusher',
    slug: 'mine-rusher',
    description: 'Navigate through the minefield',
    skills: ['deduction', 'task-switching']
  },
  {
    name: 'Snake Attack',
    slug: 'snake-attack',
    description: 'Grow your snake by eating food',
    skills: ['task-switching', 'perceptual-speed']
  },
  {
    name: 'Space Trip',
    slug: 'space-trip',
    description: 'Explore space in this adventure',
    skills: ['pattern-matching', 'planning']
  },
  {
    name: 'Ultimate Sudoku',
    slug: 'ultimate-sudoku',
    description: 'Solve number puzzles',
    skills: ['deduction', 'planning']
  },
];

// Default gradients for games
const gradients = [
  'from-purple-500 to-blue-500',
  'from-pink-500 to-purple-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-blue-500 to-cyan-500',
  'from-indigo-500 to-purple-500',
];

function HomeContent() {
  const { isWhitelisted } = useUserSession();
  const [featuredSkill, setFeaturedSkill] = useState(skills[0]);
  const [skillGames, setSkillGames] = useState<any[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [previewGameSlug, setPreviewGameSlug] = useState<string | null>(null);

  // Fetch games for the "New Games" section using the 'relax' mood
  const { games: fetchedNewGames, isLoading: isLoadingNewGames } = useGamesByMood('relax');

  useEffect(() => {
    if (fetchedNewGames.length > 0) {
      console.log('Fetched New Games:', fetchedNewGames);
    }
  }, [fetchedNewGames]);

  useEffect(() => {
    // Check for spotlight cookie
    const hasSeenSpotlight = getCookie('spotlight_dismissed');
    if (!hasSeenSpotlight) {
      // setShowTooltip(true);
    }

    // Randomly select a skill on component mount
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    setFeaturedSkill(randomSkill);

    // Filter games that have this skill and add image from config
    const gamesForSkill = allGames.filter(game =>
      game.skills.includes(randomSkill.id)
    ).map(game => {
      const details = getGameDetails(game.slug);
      return {
        ...game,
        image: details?.image
      };
    });
    setSkillGames(gamesForSkill);
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    setCookie('spotlight_dismissed', 'true');
  };

  // Skillprint Visualization Logic
  const { count, sessions, isLoaded } = useGameSessions();
  const { fetchUserProfile, profile } = useUserProfile();
  const [processedProfile, setProcessedProfile] = useState<any>(null);
  const { nodeDataMap, hasScoreByMood, hasScoreBySkill } = useSkillprintVisualizationData(processedProfile);

  const sampleSkillsForVis = [
    { id: '1', name: 'Problem Solving', level: 85, category: 'Cognitive', color: '#3B82F6' },
    { id: '2', name: 'Memory', level: 78, category: 'Cognitive', color: '#10B981' },
    { id: '3', name: 'Speed', level: 92, category: 'Cognitive', color: '#F59E0B' },
    { id: '4', name: 'Accuracy', level: 88, category: 'Cognitive', color: '#EF4444' },
    { id: '5', name: 'Pattern Recognition', level: 76, category: 'Cognitive', color: '#8B5CF6' },
    { id: '6', name: 'Spatial Awareness', level: 82, category: 'Cognitive', color: '#06B6D4' },
    { id: '7', name: 'Logic', level: 89, category: 'Cognitive', color: '#84CC16' },
    { id: '8', name: 'Creativity', level: 71, category: 'Cognitive', color: '#F97316' },
  ];
  const userSkillsForVis = sampleSkillsForVis.map(s => s.name);
  const userMoodsForVis = ['Innovate', 'Relax', 'Focus', 'Collaborate'];

  useEffect(() => {
    if (profile && profile.results && profile.results.length > 0) {
      const p = profile.results[0];
      const history = p.flowScoreHistory || [];
      const latestMoodsMap = new Map();
      history.forEach((entry: any) => {
        const mood = entry.targetMood;
        const current = latestMoodsMap.get(mood);
        if (!current || new Date(entry.timestamp) > new Date(current.timestamp)) {
          latestMoodsMap.set(mood, entry);
        }
      });
      setProcessedProfile({ ...p, latestMoods: Array.from(latestMoodsMap.values()) });
    }
  }, [profile]);

  return (
    <>
      {/* Spotlight Overlay */}
      {showTooltip && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={dismissTooltip}
        />
      )}
      <PortalLayout>
        <div className="portal-head">
          <Breadcrumbs items={[{ label: 'Home' }]} />
          <div className="portal-head__row">
            <PortalPageTitle>Play games. Build your Skillprint.</PortalPageTitle>
            <button className="button button--secondary button--md" type="button">
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-help"></use></svg>
              How this works
            </button>
          </div>
          <p>Short games that measure how you think. Play five and you have a Skillprint &mdash; your strengths in mood, cognition and personality.</p>
        </div>

        <PortalPageLayout>
          <PortalPageMain>

            {/* Get Started */}
            <PortalSection ariaLabelledBy="nextUpTitle">
              <div className="portal-nextup sp-card">
                <div className="portal-nextup__copy">
                  <span className="portal-eyebrow">Get started</span>
                  <PortalSectionTitle id="nextUpTitle">Play one game to start your Skillprint.</PortalSectionTitle>
                  <p className="portal-nextup__lede">Nothing here is scored until you play. A session takes five to ten minutes, and five of them make your first Skillprint.</p>
                  <div className="portal-nextup__actions">
                    <Link className="button button--primary button--lg" href="/games">
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                      <span>Play your first game</span>
                    </Link>
                    <Link className="button button--secondary button--lg" href="/games">
                      <span>Browse all games</span>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
                    </Link>
                  </div>
                </div>
                <div className="portal-nextup__progress">
                  <p className="nextup-progress__count">Your first 5 sessions</p>
                  <ol className="nextup-slots" aria-label="No sessions played yet. 5 still to play.">
                    {/* Render 5 empty slots */}
                    {[1, 2, 3, 4, 5].map(i => <li key={i} className="nextup-slot nextup-slot--empty"></li>)}
                  </ol>
                  <p className="nextup-progress__note">Each game measures a different set of skills, so five different games build your Skillprint faster than one played five times.</p>
                </div>
              </div>
            </PortalSection>

            {/* Recommended */}
            <PortalSection ariaLabelledBy="pickTitle">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="pickTitle">Start with one of these</PortalSectionTitle>
                  <PortalSectionHint>Short, forgiving games that read a wide spread of skills. Any of them is a fine first move.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/games">
                  All games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="game-rail game-rail--library">
                {skillGames.slice(0, 4).map((game, i) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description}
                    image={game.image || '/images/default-game.jpg'}
                    url={`/game_session?game=${game.slug}`}
                    skills={game.skills.map((s: string) => ({ id: s, name: s, dimension: 'cognition' as const }))}
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                  />
                ))}
              </div>
            </PortalSection>

            {/* Recently Played */}
            <PortalSection ariaLabelledBy="recentTitle">
              <div className="portal-section__bar">
                <PortalSectionTitle id="recentTitle">Recently played</PortalSectionTitle>
                <Link className="portal-section__link" href="/profile#sessions">
                  All sessions <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              {count > 0 ? (
                <div className="game-rail game-rail--library">
                  {sessions.slice(0, 5).map((session, i) => {
                    const game = skillGames.find(g => g.slug === session.gameSlug) || skillGames[0];
                    return (
                      <GameTile
                        key={`${session.id}-${i}`}
                        id={game.slug}
                        title={game.name}
                        description={game.description}
                        image={game.image || '/images/default-game.jpg'}
                        url={`/game_session?game=${game.slug}`}
                        skills={game.skills.map((s: string) => ({ id: s, name: s, dimension: 'cognition' as const }))}
                        tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="portal-blank">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
                  </span>
                  <p className="portal-blank__title">No sessions yet</p>
                  <p className="portal-blank__note">Every game you finish lands here with the date, your flow score and the skills it measured.</p>
                </div>
              )}
            </PortalSection>

            {/* New Games */}
            <PortalSection ariaLabelledBy="newTitle">
              <div className="portal-section__bar">
                <PortalSectionTitle id="newTitle">New games</PortalSectionTitle>
                <Link className="portal-section__link" href="/games">
                  All games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="game-rail game-rail--library">
                {fetchedNewGames.slice(0, 4).map((game: any, i: number) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description || 'Check out this new game!'}
                    image={game.screenshot || '/images/default-game.jpg'}
                    url={`/game_session?game=${game.slug}`}
                    statusBadge="New"
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[(i + 2) % 6]}
                  />
                ))}
              </div>
            </PortalSection>

            {/* Play by skill */}
            <PortalSection ariaLabelledBy="bySkillTitle">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="bySkillTitle">Play by skill</PortalSectionTitle>
                  <PortalSectionHint>Every game measures all three at once. Start from the one you most want to improve.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/skills">
                  All skills <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="skill-launch">
                <Link className="skill-launch__card skill-launch__card--all sp-card sp-card--interactive" href="/skills">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-layout-grid"></use></svg>
                  </span>
                  <span className="skill-launch__name">All skills</span>
                  <span className="skill-launch__meta">The full index</span>
                </Link>

                <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#mood" data-dimension="mood">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-mood"></use></svg>
                  </span>
                  <span className="skill-launch__name">Mood</span>
                  <span className="skill-launch__meta">9 skills · how a session feels</span>
                </Link>

                <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#cognition" data-dimension="cognition">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-cognition"></use></svg>
                  </span>
                  <span className="skill-launch__name">Cognition</span>
                  <span className="skill-launch__meta">14 skills · how you solve it</span>
                </Link>

                <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#personality" data-dimension="personality">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-personality"></use></svg>
                  </span>
                  <span className="skill-launch__name">Personality</span>
                  <span className="skill-launch__meta">5 traits · how you show up</span>
                </Link>
              </div>
            </PortalSection>

          </PortalPageMain>

          <PortalPageRail ariaLabelledBy="printTitle">
            <article className="rail-card rail-print sp-card">
              <div className="rail-card__head">
                <h2 className="rail-card__title" id="printTitle">Your Skillprint</h2>
                <span className="ui-badge ui-badge--sm">Not started</span>
              </div>
              <div className="rail-print__figure ontology-root">
                <div className="ontology-visual clip layout-grid place-center" style={{ width: '100%', aspectRatio: '1/1' }}>
                  <SkillprintVisualization
                    userSkills={userSkillsForVis}
                    userMoods={userMoodsForVis}
                    hasScoreBySkill={hasScoreBySkill}
                    hasScoreByMood={hasScoreByMood}
                    nodeDataMap={nodeDataMap}
                    size={220}
                    useSizeDirectly={true}
                    initialState="reset"
                    hasMenu={false}
                  />
                </div>
                <span className="rail-print__veil"><span className="ui-badge ui-badge--sm">0 of 5 sessions</span></span>
              </div>
              <p className="margin-none text-muted font-sm leading-md">Every Skillprint is drawn on this wheel. Yours is blank until you play — each game you finish fills in the parts it measures.</p>

              <dl className="rail-stats">
                <div className="rail-stat"><dt>Sessions</dt><dd>0</dd></div>
                <div className="rail-stat"><dt>Flow</dt><dd>&mdash;</dd></div>
                <div className="rail-stat"><dt>Streak</dt><dd>0</dd></div>
              </dl>

              <Link className="button button--primary button--md full-width" href="/games">
                <span>Play your first game</span>
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
              </Link>
            </article>

            <article className="rail-card sp-card">
              <div className="rail-card__head">
                <span className="rail-card__label">What you will see here</span>
              </div>
              <div className="layout-grid gap-lg">
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Mood</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Cognition</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Personality</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
              </div>
              <p className="margin-none text-muted font-sm leading-md">Mood scores first, cognition next, personality last. This card always says what still needs play.</p>
              <div className="cluster gap-md">
                <Link className="button button--secondary button--sm" href="/skills">View skills</Link>
              </div>
            </article>
          </PortalPageRail>
        </PortalPageLayout>
      </PortalLayout>
      <GamePreviewShareSheet
        slug={previewGameSlug}
        isOpen={!!previewGameSlug}
        onClose={() => setPreviewGameSlug(null)}
      />
    </>
  );
}

export default function Home() {
  const { status, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <BuckyballLoading />
      </div>
    );
  }

  if (status === 'loggedOut') {
    return <WelcomeScreen />;
  }

  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><BuckyballLoading /></div>}>
      <HomeContent />
    </Suspense>
  );
}
