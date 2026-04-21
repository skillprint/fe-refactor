'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import TopNav from "./components/TopNav";
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
  useUserSession();
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
    const hasSeenSpotlight = document.cookie.split('; ').find(row => row.startsWith('spotlight_dismissed='));
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
    // Set cookie to expire in 1 year
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `spotlight_dismissed=true; expires=${date.toUTCString()}; path=/`;
  };

  // Skillprint Visualization Logic
  const { count, isLoaded } = useGameSessions();
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
    <div className="font-sans min-h-screen bg-background">
      {/* Spotlight Overlay */}
      {showTooltip && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={dismissTooltip}
        />
      )}
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <ProgressBanner />

        <div className="px-4 sm:px-8 py-8 bg-background">
          <div className="max-w-[1440px] mx-auto w-full">
            <PlaybookWidget />
          </div>
        </div>
        {/* Hero Section
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-500 dark:to-purple-500 px-8 py-12 sm:py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 dark:text-white">
              Skillprint
            </h1>
            <p className="text-xl mb-8 dark:text-white text-white">
              Build skills through engaging games and track your progress
            </p>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:opacity-90 font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto shadow-lg dark:text-white dark:hover:text-background dark:hover:bg-foreground dark:border-white"
                href="/games"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Play Games
              </a>
              <a
                className="rounded-full border-2 border-foreground transition-colors flex items-center justify-center bg-transparent text-foreground hover:bg-foreground hover:text-background font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto dark:text-white dark:hover:text-background dark:hover:bg-foreground dark:border-white"
                href="/profile"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </a>
            </div>
          </div>
        </div> */}

        {/* Skillprint View for Active Users */}
        {isLoaded && count >= 3 && (
          <div className="bg-card border-b border-border">
            <div className="px-4 sm:px-8 py-12 max-w-[1440px] mx-auto w-full">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Profile is Unlocked!
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Great job! You've played enough sessions and revealed your unique cognitive breakdown.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Link
                      href="/profile"
                      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-primary/25"
                    >
                      View Full Analysis
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-[500px]">
                  <SkillprintVisualization
                    userSkills={userSkillsForVis}
                    userMoods={userMoodsForVis}
                    hasScoreBySkill={hasScoreBySkill}
                    hasScoreByMood={hasScoreByMood}
                    nodeDataMap={nodeDataMap}
                    size={400}
                    initialState="reset"
                    hasMenu={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Games Section */}
        <div className="relative bg-white border-b border-border">
          <div className="px-4 sm:px-8 py-8 max-w-[1440px] w-full mx-auto">
            {/* Tooltip for first item - Positioned relative to the section */}
            {showTooltip && (
              <div className="absolute top-24 left-80 sm:left-96 z-[60] w-64 bg-popover p-4 rounded-xl shadow-2xl border border-border animate-bounce-slight">
                <div className="absolute top-6 -left-2 -translate-x-1/2 rotate-45 w-4 h-4 bg-popover border-l border-b border-border"></div>
                <h3 className="font-bold text-foreground mb-1">Game Tile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This is a game tile. Click it to begin your game!
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dismissTooltip();
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wide"
                >
                  Got it
                </button>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  New Games
                </h2>
                <p className="text-sm text-muted-foreground">
                  Check out our latest additions
                </p>
              </div>
              <Link
                href="/games?filter=new"
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
              >
                See all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Horizontal scrollable game cards */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-4 min-w-min">
                {isLoadingNewGames ? (
                  <div className="w-full py-12 flex justify-center items-center">
                    <BuckyballLoading />
                  </div>
                ) : fetchedNewGames.length > 0 ? (
                  fetchedNewGames.map((game, index) => (
                    <div key={game.slug} className={`relative ${index === 0 && showTooltip ? 'z-10' : ''}`}>
                      <button
                        onClick={() => setPreviewGameSlug(game.slug)}
                        className="block group flex-shrink-0 w-80 text-left"
                      >
                        <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-row h-44`}>
                          <div className="flex-1 p-5 flex flex-col justify-between items-start">
                            <div>
                              <div className="flex gap-2 text-white/90 mb-2">
                                {/* Use basic icon for 'new' or no icon just the pill */}
                                <div className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                  NEW
                                </div>
                              </div>
                              <h3 className="text-xl font-bold text-white leading-tight mt-1 line-clamp-2">
                                {game.name}
                              </h3>
                            </div>

                            <button className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-100 transition-colors mt-2 text-lg">
                              Play
                            </button>
                          </div>

                          {game.screenshot && (
                            <div className="relative aspect-square h-full shrink-0">
                              <img
                                src={game.screenshot}
                                alt={game.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-8">No games found for this mood.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Browse by Mood & Skill Section */}
        <div className="bg-[#efefef]">
          <div className="px-4 sm:px-8 py-8 max-w-[1440px] w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Explore by Mood & Skill
              </h2>
              <p className="text-sm text-muted-foreground">
                Find the perfect game for your current state of mind or goal
              </p>
            </div>

            <div className="space-y-8">
              {/* Moods Row */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                  Moods
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                  {moods.map((mood) => (
                    <Link
                      key={mood.id}
                      href={`/games?tab=moods&filter=${mood.id}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="flex items-center gap-4 px-3 py-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                        <div className={`rounded-xl flex items-center justify-center`}>
                          <img src={mood.image} alt={mood.name} className="w-8 h-8 object-contain rounded-xl" />
                        </div>
                        <div>
                          <span className="block font-bold text-foreground group-hover:text-primary transition-colors">
                            {mood.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Skills Row */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                  Skills
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                  {skills.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/games?tab=skills&filter=${skill.apiSlug}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="flex items-center gap-4 px-3 py-4 rounded-2xl border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 bg-white">
                        <div className={`rounded-xl flex items-center justify-center`}>
                          <img src={skill.image} alt={skill.name} className="w-8 h-8 object-contain rounded-xl" />
                        </div>
                        <div>
                          <span className="block font-bold text-foreground group-hover:text-primary transition-colors">
                            {skill.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Skill Section */}
        <div className="border-t border-border bg-white border-b">
          <div className="px-4 sm:px-8 py-8 max-w-[1440px] w-full mx-auto">
            <div className="mb-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${featuredSkill.gradient} flex items-center justify-center`}>
                    <img src={featuredSkill.image} alt={featuredSkill.name} className="w-10 h-10 object-contain rounded-xl" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Featured Skill: {featuredSkill.name}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {featuredSkill.description}
                    </p>
                  </div>
                </div>
                {/* Gradient underline */}
                <div className={`h-1 bg-gradient-to-r ${featuredSkill.gradient} rounded-full`}></div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Games to develop this skill
                </h3>
                <Link
                  href={`/games?tab=skills&filter=${featuredSkill.apiSlug}`}
                  className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                >
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>



            {/* Horizontal scrollable skill game cards */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-4 min-w-min">
                {skillGames.length > 0 ? (
                  skillGames.map((game) => (
                    <button
                      key={game.slug}
                      onClick={() => setPreviewGameSlug(game.slug)}
                      className="block group flex-shrink-0 w-80 text-left"
                    >
                      <div className={`bg-gradient-to-br ${featuredSkill.gradient} rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-row h-44`}>
                        <div className="flex-1 p-5 flex flex-col justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white leading-tight mt-1 line-clamp-2">
                              {game.name}
                            </h3>
                          </div>
                          <button className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-100 transition-colors mt-2 text-lg">
                            Play
                          </button>
                        </div>

                        {game.image ? (
                          <div className="relative aspect-square h-full shrink-0">
                            <img
                              src={game.image}
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative aspect-square h-full shrink-0 flex items-center justify-center bg-black/10">
                            <img src={featuredSkill.image} alt={featuredSkill.name} className="w-16 h-16 object-contain invert brightness-0 opacity-50" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="w-full py-12 flex justify-center items-center">
                    <BuckyballLoading />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats or Additional Content */}
        <div className="bg-[#efefef]">
          <div className="px-4 sm:px-8 py-8 max-w-[1440px] w-full mx-auto">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                What would you like to do today?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/games"
                  className="group p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Browse All Games</h3>
                      <p className="text-sm text-muted-foreground">Explore our full collection of games</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">View Your Progress</h3>
                      <p className="text-sm text-muted-foreground">Track your skills and achievements</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GamePreviewShareSheet 
        slug={previewGameSlug} 
        isOpen={!!previewGameSlug} 
        onClose={() => setPreviewGameSlug(null)} 
      />
    </div>
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
