'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PortalLayout from "@/components/PortalLayout";
import ProgressBanner from "./components/ProgressBanner";
import { useGamesByMood } from './hooks/useGamesByMood';
import BuckyballLoading from './components/BuckyballLoading';
import { useUserSession } from './hooks/useUserSession';
import { useGameSessions } from './hooks/useGameSessions';
import { IconInfoCardWithDescription } from '@/components/IconInfoCardWithDescription';
import { PlayBySkill } from '@/components/PlayBySkill';
import { PlaybookWidget } from './components/PlaybookWidget';
import GamePreviewShareSheet from './components/GamePreviewShareSheet';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useAuth } from './context/AuthContext';
import { getGameDetails } from './config/gameConfig';
import { getCookie, setCookie } from './utils/cookieUtils';
import { PortalPageLayout, PortalPageMain, PortalPageRail, PortalSection } from '@/components/LayoutGrid';
import { PortalPageTitle, PortalSectionTitle, PortalSectionHint } from '@/components/Typography';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GameTile } from '@/components/GameTile';
import { useRecommendedGames } from './hooks/useRecommendedGames';
import { MockDataTag } from '@/components/MockDataTag';
import HomeSkillprintWheel from '@/components/HomeSkillprintWheel';
import { useHomeSummary } from '@/lib/models/portal/useHomeSummary';
import { useHomeRecentSessions } from '@/lib/models/portal/useHomeRecentSessions';
import { useNextGameRecommendation } from '@/lib/models/portal/useNextGameRecommendation';
import type { HomeRecentSession } from '@/lib/models/portal/HomeRecentSessions';

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
    slug: 'space-trip-ce24666e-4467-4a25-8658-0f86a0fdcb20',
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

// The Get started card is one run of five sessions. Every line of copy below is
// derived from how far through that run the player is, so the card cannot say
// "play your first game" to someone with three sessions behind them.
const RUN_TARGET = 5;
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];

type NextUpGame = { slug: string; name: string };

function getNextUpCopy(count: number, nextGames: NextUpGame[]) {
  const played = Math.min(Math.max(count, 0), RUN_TARGET);
  const remaining = RUN_TARGET - played;
  const next = nextGames[0];
  const playHref = `/game/${next?.slug || 'hextris'}`;

  if (played === 0) {
    return {
      eyebrow: 'Get started',
      title: 'Play one game to start your Skillprint.',
      lede: 'Nothing here is scored until you play. A session takes five to ten minutes, and five of them make your first Skillprint.',
      primary: { label: 'Play your first game', href: playHref, icon: 'ti-play' },
      secondary: { label: 'Browse all games', href: '/games' },
      runCount: `Your first ${RUN_TARGET} sessions`,
      runNote: 'Each game measures a different set of skills, so five different games build your Skillprint faster than one played five times.',
      slotsLabel: `No sessions played yet. ${RUN_TARGET} still to play.`,
    };
  }

  if (remaining > 0) {
    const names = nextGames.slice(0, Math.min(remaining, 2)).map(g => g.name);
    const measured = names.length === 2
      ? `${names[0]} and ${names[1]} measure`
      : names.length === 1
        ? `${names[0]} measures`
        : 'Each new game measures';
    const sessionsWord = played === 1 ? 'session' : 'sessions';
    const moreWord = remaining === 1 ? 'session' : 'sessions';
    return {
      eyebrow: 'Next up',
      title: `Play ${remaining} more ${remaining === 1 ? 'game' : 'games'} to finish your first Skillprint.`,
      lede: `${measured} the skills your first ${NUMBER_WORDS[played]} ${sessionsWord} missed. ${NUMBER_WORDS[remaining][0].toUpperCase()}${NUMBER_WORDS[remaining].slice(1)} more ${moreWord} and all three dimensions have a score.`,
      primary: { label: next ? `Play ${next.name}` : 'Play your next game', href: playHref, icon: 'ti-play' },
      secondary: { label: 'Choose another game', href: '/games' },
      runCount: `${played} of ${RUN_TARGET} sessions`,
      runNote: 'Each game measures a different set of skills, so a varied run builds your Skillprint faster than a repeated one.',
      slotsLabel: `${played} of ${RUN_TARGET} sessions played. ${remaining} still to play.`,
    };
  }

  return {
    eyebrow: 'Your Skillprint is ready',
    title: 'All five sessions are in. Your first Skillprint is ready to read.',
    lede: 'Mood, cognition and personality now all have a score. Nothing resets from here \u2014 every further session sharpens the same Skillprint.',
    primary: { label: 'Read your Skillprint', href: '/profile', icon: 'ti-arrow-right' },
    secondary: { label: 'Keep playing', href: '/games' },
    runCount: `${RUN_TARGET} of ${RUN_TARGET} sessions`,
    runNote: 'The run is complete. New games reach skills these five did not, so your Skillprint keeps sharpening as you play.',
    slotsLabel: `All ${RUN_TARGET} sessions played.`,
  };
}

type PillarKey = 'mood' | 'cognition' | 'personality';
const PILLARS: { key: PillarKey; label: string }[] = [
  { key: 'mood', label: 'Mood' },
  { key: 'cognition', label: 'Cognition' },
  { key: 'personality', label: 'Personality' },
];

/* The rail's "what is readable" card. A pillar with a score is described by
   how settled that score is; a pillar without one says what it still needs. */
function pillarLabel(score: number | null | undefined, played: number, remaining: number) {
  if (typeof score === 'number') {
    if (score >= 70) return 'Clear';
    if (score >= 40) return 'Settling';
    return 'Emerging';
  }
  if (played === 0) return 'Needs play';
  if (remaining > 0) return `${remaining} more ${remaining === 1 ? 'game' : 'games'}`;
  return 'Needs a longer run';
}

function getReadCopy(played: number, remaining: number) {
  if (played === 0) {
    return {
      title: 'What you will see here',
      note: 'Mood scores first, cognition next, personality last. This card always says what still needs play.',
    };
  }
  if (remaining > 0) {
    return {
      title: 'What is readable so far',
      note: `Mood scores first, cognition next, personality last. ${NUMBER_WORDS[remaining][0].toUpperCase()}${NUMBER_WORDS[remaining].slice(1)} more ${remaining === 1 ? 'session reaches' : 'sessions reach'} the rest.`,
    };
  }
  return {
    title: 'What is readable now',
    note: 'All three now have a score. Personality is the slowest to settle, so it keeps moving the longest.',
  };
}

function HomeContent() {
  const searchParams = useSearchParams();
  const stateOverride = searchParams.get('state');

  const { isWhitelisted } = useUserSession();
  const [featuredSkill, setFeaturedSkill] = useState(skills[0]);
  const [skillGames, setSkillGames] = useState<any[]>([]);
  const [previewGameSlug, setPreviewGameSlug] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('page--portal-home');
    return () => {
      document.body.classList.remove('page--portal-home');
    };
  }, []);

  // Fetch games for the "New Games" section using the 'relax' mood
  const { games: fetchedNewGames, isLoading: isLoadingNewGames } = useGamesByMood('relax');
  const { recommendedGames, isLoading: isLoadingRecommended } = useRecommendedGames(4);

  useEffect(() => {
    if (fetchedNewGames.length > 0) {
      console.log('Fetched New Games:', fetchedNewGames);
    }
  }, [fetchedNewGames]);


  useEffect(() => {
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

  // Local session log is only a fallback until the portal summary arrives.
  const { count: localCount } = useGameSessions();
  const { data: homeSummary } = useHomeSummary();
  const { data: recentSessions } = useHomeRecentSessions();
  const { data: nextGameRecs } = useNextGameRecommendation();

  let count = homeSummary ? homeSummary.totalSessions : localCount;
  if (stateOverride === 'first') count = 0;
  if (stateOverride === 'semi') count = 3;
  if (stateOverride === 'complete') count = 5;

  const playedInRun = Math.min(count, RUN_TARGET);
  const remainingInRun = RUN_TARGET - playedInRun;

  // Newest first on the wire; the slot row reads in the order they were played.
  const playedSessions: HomeRecentSession[] = recentSessions ?? [];
  const runSlots = [...playedSessions].slice(0, RUN_TARGET).reverse();

  // The portal recommender leads; the legacy games recommender fills in until it answers.
  const nextGames: NextUpGame[] = (nextGameRecs && nextGameRecs.length > 0)
    ? nextGameRecs.map(r => ({ slug: r.game.slug, name: r.game.name }))
    : recommendedGames.map((g: any) => ({ slug: g.slug, name: g.name }));
  const nextUp = getNextUpCopy(count, nextGames.filter((g: NextUpGame) => g.slug && g.name));

  const flowScores = playedSessions.map(s => s.primaryScore).filter((n): n is number => typeof n === 'number');
  const flowScore = flowScores.length ? Math.round(flowScores.reduce((a, b) => a + b, 0) / flowScores.length) : null;
  const streakDays = homeSummary?.streakDays ?? 0;

  // Pillar meters. The dev state overrides carry the reference design's figures.
  const pillarScores: Record<PillarKey, number | null> = stateOverride === 'semi'
    ? { mood: 72, cognition: 38, personality: 14 }
    : stateOverride === 'complete'
      ? { mood: 84, cognition: 76, personality: 58 }
      : stateOverride === 'first'
        ? { mood: null, cognition: null, personality: null }
        : {
          mood: homeSummary?.pillarAverages?.mood ?? null,
          cognition: homeSummary?.pillarAverages?.cognition ?? null,
          personality: homeSummary?.pillarAverages?.personality ?? null,
        };
  const readCopy = getReadCopy(playedInRun, remainingInRun);

  return (
    <>
      <PortalLayout>
        <div className="portal-head">
          <Breadcrumbs items={[{ label: 'Home' }]} />
          <div className="portal-head__row">
            {/* SKI-139: the tour's first step rings only the title copy, not the
                full-width header, so its bubble can sit beside the copy instead
                of landing on the Get started card underneath. */}
            <div className="portal-head__copy" data-home-spot="intro">
              <PortalPageTitle>Play games. Build your Skillprint.</PortalPageTitle>
              <p>Short games that measure how you think. Play five and you have a Skillprint &mdash; your strengths in mood, cognition and personality.</p>
            </div>
            <button className="button button--secondary button--md" type="button" onClick={() => window.dispatchEvent(new CustomEvent('skillprint:show-ftue'))}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-help"></use></svg>
              How this works
            </button>
          </div>
        </div>

        <PortalPageLayout>
          <PortalPageMain>

            {/* Get Started */}
            <PortalSection ariaLabelledBy="nextUpTitle">
              <div className="portal-nextup sp-card" data-home-spot="nextup">
                <div className="portal-nextup__copy">
                  <span className="portal-eyebrow">{nextUp.eyebrow}</span>
                  <PortalSectionTitle id="nextUpTitle">{nextUp.title}</PortalSectionTitle>
                  <p className="portal-nextup__lede">{nextUp.lede}</p>
                  <div className="portal-nextup__actions" data-home-spot="play">
                    <Link className="button button--primary button--lg" href={nextUp.primary.href}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${nextUp.primary.icon}`}></use></svg>
                      <span>{nextUp.primary.label}</span>
                    </Link>
                    <Link className="button button--secondary button--lg" href={nextUp.secondary.href}>
                      <span>{nextUp.secondary.label}</span>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
                    </Link>
                  </div>
                </div>
                <div className="portal-nextup__progress" data-home-spot="run">
                  <p className="nextup-progress__count">{nextUp.runCount}</p>
                  <ol className="nextup-slots" aria-label={nextUp.slotsLabel}>
                    {Array.from({ length: RUN_TARGET }).map((_, i) => {
                      const session = i < playedInRun ? runSlots[i] : undefined;
                      if (session) {
                        const details = getGameDetails(session.gameSlug);
                        return (
                          <li key={session.sessionId} className="nextup-slot">
                            <img src={details?.image || '/images/default-game.jpg'} alt={session.gameName || 'Game'} />
                          </li>
                        );
                      }
                      return <li key={i} className="nextup-slot nextup-slot--empty"></li>;
                    })}
                  </ol>
                  <p className="nextup-progress__note">{nextUp.runNote}</p>
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
                {recommendedGames.slice(0, 4).map((game: any, i: number) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description}
                    image={game.screenshot || game.image || '/images/default-game.jpg'}
                    url={`/game/${game.slug}`}
                    skills={game.skills ? game.skills.map((s: string | any) => ({ id: s.slug || s.id || s.name || String(s), name: s.name || String(s), dimension: 'cognition' as const })) : []}
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                  />
                ))}
              </div>
            </PortalSection>

            {/* Recently Played */}
            <PortalSection ariaLabelledBy="recentTitle">
              <div className="portal-section__bar">
                <PortalSectionTitle id="recentTitle">Recently played</PortalSectionTitle>
                {playedSessions.length > 0 && (
                  <Link className="portal-section__link" href="/profile#sessions">
                    All sessions <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                  </Link>
                )}
              </div>
              {playedSessions.length > 0 ? (
                <div className="game-rail game-rail--library">
                  {playedSessions.slice(0, 5).map((session, i) => {
                    const known = allGames.find(g => g.slug === session.gameSlug);
                    const details = getGameDetails(session.gameSlug);
                    return (
                      <GameTile
                        key={session.sessionId}
                        id={session.gameSlug}
                        title={session.gameName}
                        description={known?.description || ''}
                        image={details?.image || '/images/default-game.jpg'}
                        url={`/game/${session.gameSlug}`}
                        skills={known?.skills ? known.skills.map((s: string) => ({ id: s, name: s, dimension: 'cognition' as const })) : []}
                        tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                      />
                    );
                  })}
                </div>
              ) : (
                <IconInfoCardWithDescription 
                  title="No sessions yet" 
                  note="Every game you finish lands here with the date, your flow score and the skills it measured." 
                  iconId="ti-clock" 
                />
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
                    url={`/game/${game.slug}`}
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
              <PlayBySkill />
            </PortalSection>

          </PortalPageMain>

          <PortalPageRail ariaLabelledBy="printTitle">
            <article className="rail-card rail-print sp-card" data-home-spot="print">
              <div className="rail-card__head">
                <h2 className="rail-card__title" id="printTitle">Your Skillprint</h2>
                <span className="ui-badge ui-badge--sm">
                  {playedInRun === 0 ? 'Not started' : playedInRun < RUN_TARGET ? 'Forming' : 'Ready'}
                </span>
              </div>

              {playedInRun < RUN_TARGET ? (
                <HomeSkillprintWheel
                  person="base"
                  ariaLabel="The blank Skillprint wheel"
                  description="The blank Skillprint wheel — the circular map of 87 game features that every Skillprint is drawn on, shown here with no scores inked onto it yet."
                >
                  <span className="rail-print__veil">
                    <span className="ui-badge ui-badge--sm">{playedInRun} of {RUN_TARGET} sessions</span>
                  </span>
                </HomeSkillprintWheel>
              ) : (
                <div style={{ position: 'relative' }}>
                  <MockDataTag />
                  <HomeSkillprintWheel
                    person="ada"
                    ariaLabel="Your Skillprint"
                    description="Your Skillprint, inked from five completed sessions — the heavier a line, the more evidence sits behind it."
                  />
                </div>
              )}

              <p className="margin-none text-muted font-sm leading-md">
                {playedInRun === 0
                  ? 'Every Skillprint is drawn on this wheel. Yours is blank until you play — each game you finish fills in the parts it measures.'
                  : playedInRun < RUN_TARGET
                    ? `${NUMBER_WORDS[playedInRun][0].toUpperCase()}${NUMBER_WORDS[playedInRun].slice(1)} ${playedInRun === 1 ? 'session' : 'sessions'} in. Enough to score mood; cognition and personality need more play before the wheel can fill them in.`
                    : 'Drawn from five sessions. The heavier a line, the more play sits behind it; faint lines are skills no game has reached yet.'
                }
              </p>

              <dl className="rail-stats">
                <div className="rail-stat"><dt>Sessions</dt><dd>{count}</dd></div>
                <div className="rail-stat"><dt>Flow</dt><dd>{flowScore ?? <>&mdash;</>}</dd></div>
                <div className="rail-stat"><dt>Streak</dt><dd>{streakDays}</dd></div>
              </dl>

              {playedInRun === 0 ? (
                <Link className="button button--primary button--md full-width" href={nextUp.primary.href}>
                  <span>Play your first game</span>
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
                </Link>
              ) : (
                <Link className="button button--primary button--md full-width" href="/profile">
                  <span>View profile</span>
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
                </Link>
              )}
            </article>

            <article className="rail-card sp-card" aria-labelledby="railReadTitle" data-home-spot="read">
              <div className="rail-card__head">
                <span className="rail-card__label" id="railReadTitle">{readCopy.title}</span>
              </div>
              <div className="layout-grid gap-lg">
                {PILLARS.map(pillar => {
                  const score = pillarScores[pillar.key];
                  return (
                    <div key={pillar.key} className="layout-grid gap-sm" data-dimension={pillar.key}>
                      <div className="layout-flex items-center justify-between gap-md font-sm">
                        <span className="weight-semibold">{pillar.label}</span>
                        <span className="text-muted">{pillarLabel(score, playedInRun, remainingInRun)}</span>
                      </div>
                      <div
                        className="rail-meter"
                        role="meter"
                        aria-label={`${pillar.label} score`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={score ?? 0}
                        style={{ '--meter': `${Math.max(0, Math.min(100, score ?? 0))}%` } as React.CSSProperties}
                      >
                        <i></i>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="margin-none text-muted font-sm leading-md">{readCopy.note}</p>
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
